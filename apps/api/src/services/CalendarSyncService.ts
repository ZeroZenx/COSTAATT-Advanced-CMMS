import { MaintenanceSchedule, WorkOrder } from '@prisma/client';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  reminders?: number[]; // Minutes before event
}

interface CalendarProvider {
  type: 'outlook' | 'google';
  accessToken: string;
  refreshToken?: string;
}

export class CalendarSyncService {
  private outlookEnabled: boolean = false;
  private googleEnabled: boolean = false;

  constructor() {
    this.checkConfiguration();
  }

  private checkConfiguration() {
    // Check if Outlook Calendar is configured
    this.outlookEnabled = !!(
      process.env.AZURE_CLIENT_ID &&
      process.env.AZURE_CLIENT_ID !== 'your-client-id-here'
    );

    // Check if Google Calendar is configured
    this.googleEnabled = !!(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET
    );

    if (this.outlookEnabled) {
      console.log('✅ Outlook Calendar sync enabled');
    }
    if (this.googleEnabled) {
      console.log('✅ Google Calendar sync enabled');
    }
    if (!this.outlookEnabled && !this.googleEnabled) {
      console.warn('⚠️ Calendar sync disabled - No calendar providers configured');
    }
  }

  // Create calendar event from maintenance schedule
  private maintenanceToCalendarEvent(schedule: MaintenanceSchedule): CalendarEvent {
    const startTime = new Date(schedule.nextDueDate);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

    return {
      id: schedule.id,
      title: `Maintenance: ${schedule.title}`,
      description: `${schedule.description}\n\nFrequency: ${schedule.frequency}\nScheduled via COSTAATT CMMS`,
      startTime,
      endTime,
      location: schedule.assetLocation || 'TBD',
      reminders: [60, 1440], // 1 hour and 1 day before
    };
  }

  // Create calendar event from work order
  private workOrderToCalendarEvent(workOrder: WorkOrder): CalendarEvent {
    const startTime = workOrder.dueDate ? new Date(workOrder.dueDate) : new Date();
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    return {
      id: workOrder.id,
      title: `Work Order: ${workOrder.title}`,
      description: `${workOrder.description}\n\nPriority: ${workOrder.priority}\nStatus: ${workOrder.status}\nLocation: ${workOrder.location}\n\nCreated via COSTAATT CMMS`,
      startTime,
      endTime,
      location: workOrder.location || 'TBD',
      reminders: [30, 480], // 30 minutes and 8 hours before
    };
  }

  // Sync maintenance schedule to Outlook Calendar
  async syncMaintenanceToOutlook(
    schedule: MaintenanceSchedule,
    provider: CalendarProvider
  ): Promise<{ success: boolean; eventId?: string; error?: string }> {
    if (!this.outlookEnabled || provider.type !== 'outlook') {
      return { success: false, error: 'Outlook calendar not configured' };
    }

    try {
      const event = this.maintenanceToCalendarEvent(schedule);
      
      // Microsoft Graph API endpoint for creating calendar events
      const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${provider.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: event.title,
          body: {
            contentType: 'Text',
            content: event.description,
          },
          start: {
            dateTime: event.startTime.toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: event.endTime.toISOString(),
            timeZone: 'UTC',
          },
          location: {
            displayName: event.location,
          },
          isReminderOn: true,
          reminderMinutesBeforeStart: event.reminders?.[0] || 60,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Synced maintenance to Outlook: ${schedule.title}`);
        return { success: true, eventId: data.id };
      } else {
        const error = await response.text();
        console.error('Outlook sync error:', error);
        return { success: false, error };
      }
    } catch (error) {
      console.error('Outlook calendar sync error:', error);
      return { success: false, error: String(error) };
    }
  }

  // Sync work order to Outlook Calendar
  async syncWorkOrderToOutlook(
    workOrder: WorkOrder,
    provider: CalendarProvider
  ): Promise<{ success: boolean; eventId?: string; error?: string }> {
    if (!this.outlookEnabled || provider.type !== 'outlook') {
      return { success: false, error: 'Outlook calendar not configured' };
    }

    try {
      const event = this.workOrderToCalendarEvent(workOrder);
      
      const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${provider.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: event.title,
          body: {
            contentType: 'Text',
            content: event.description,
          },
          start: {
            dateTime: event.startTime.toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: event.endTime.toISOString(),
            timeZone: 'UTC',
          },
          location: {
            displayName: event.location,
          },
          isReminderOn: true,
          reminderMinutesBeforeStart: event.reminders?.[0] || 30,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Synced work order to Outlook: ${workOrder.title}`);
        return { success: true, eventId: data.id };
      } else {
        const error = await response.text();
        console.error('Outlook sync error:', error);
        return { success: false, error };
      }
    } catch (error) {
      console.error('Outlook calendar sync error:', error);
      return { success: false, error: String(error) };
    }
  }

  // Sync maintenance schedule to Google Calendar
  async syncMaintenanceToGoogle(
    schedule: MaintenanceSchedule,
    provider: CalendarProvider
  ): Promise<{ success: boolean; eventId?: string; error?: string }> {
    if (!this.googleEnabled || provider.type !== 'google') {
      return { success: false, error: 'Google calendar not configured' };
    }

    try {
      const event = this.maintenanceToCalendarEvent(schedule);
      
      // Google Calendar API endpoint
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${provider.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: event.title,
            description: event.description,
            location: event.location,
            start: {
              dateTime: event.startTime.toISOString(),
              timeZone: 'UTC',
            },
            end: {
              dateTime: event.endTime.toISOString(),
              timeZone: 'UTC',
            },
            reminders: {
              useDefault: false,
              overrides: event.reminders?.map(minutes => ({
                method: 'popup',
                minutes,
              })),
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Synced maintenance to Google Calendar: ${schedule.title}`);
        return { success: true, eventId: data.id };
      } else {
        const error = await response.text();
        console.error('Google sync error:', error);
        return { success: false, error };
      }
    } catch (error) {
      console.error('Google calendar sync error:', error);
      return { success: false, error: String(error) };
    }
  }

  // Sync work order to Google Calendar
  async syncWorkOrderToGoogle(
    workOrder: WorkOrder,
    provider: CalendarProvider
  ): Promise<{ success: boolean; eventId?: string; error?: string }> {
    if (!this.googleEnabled || provider.type !== 'google') {
      return { success: false, error: 'Google calendar not configured' };
    }

    try {
      const event = this.workOrderToCalendarEvent(workOrder);
      
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${provider.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: event.title,
            description: event.description,
            location: event.location,
            start: {
              dateTime: event.startTime.toISOString(),
              timeZone: 'UTC',
            },
            end: {
              dateTime: event.endTime.toISOString(),
              timeZone: 'UTC',
            },
            reminders: {
              useDefault: false,
              overrides: event.reminders?.map(minutes => ({
                method: 'popup',
                minutes,
              })),
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Synced work order to Google Calendar: ${workOrder.title}`);
        return { success: true, eventId: data.id };
      } else {
        const error = await response.text();
        console.error('Google sync error:', error);
        return { success: false, error };
      }
    } catch (error) {
      console.error('Google calendar sync error:', error);
      return { success: false, error: String(error) };
    }
  }

  // Get upcoming events from calendar
  async getUpcomingEvents(
    provider: CalendarProvider,
    days: number = 7
  ): Promise<{ success: boolean; events?: any[]; error?: string }> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    try {
      if (provider.type === 'outlook') {
        const response = await fetch(
          `https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=${startDate.toISOString()}&endDateTime=${endDate.toISOString()}`,
          {
            headers: {
              'Authorization': `Bearer ${provider.accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          return { success: true, events: data.value };
        }
      } else if (provider.type === 'google') {
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startDate.toISOString()}&timeMax=${endDate.toISOString()}&singleEvents=true&orderBy=startTime`,
          {
            headers: {
              'Authorization': `Bearer ${provider.accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          return { success: true, events: data.items };
        }
      }

      return { success: false, error: 'Failed to fetch events' };
    } catch (error) {
      console.error('Get events error:', error);
      return { success: false, error: String(error) };
    }
  }

  // Check if calendar sync is available
  isAvailable(type: 'outlook' | 'google'): boolean {
    return type === 'outlook' ? this.outlookEnabled : this.googleEnabled;
  }
}

export const calendarSyncService = new CalendarSyncService();
