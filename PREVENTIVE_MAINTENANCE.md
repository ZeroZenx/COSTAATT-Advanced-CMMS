# Preventive Maintenance Module

## Overview
Comprehensive preventive maintenance scheduling system that automates regular maintenance tasks, reduces downtime, and extends asset life through proactive care.

## Features

### ✅ **Maintenance Scheduling**
- Create recurring maintenance schedules
- Set frequency (Daily, Weekly, Monthly, Yearly)
- Assign to technicians
- Track next due dates
- Auto-generate work orders

### 📅 **Schedule Management**
- View all maintenance schedules
- Edit schedule details
- Run schedules manually
- Track completion history
- Monitor overdue items

### 🔔 **Alerts & Notifications**
- Overdue schedule warnings
- Upcoming maintenance reminders
- Low stock alerts for parts
- Completion confirmations

### 📊 **Analytics**
- Active schedules count
- Overdue schedules
- Upcoming this week
- Completion rates
- Cost tracking

## API Endpoints

```
GET    /api/v1/maintenance/schedules          - List all schedules
GET    /api/v1/maintenance/schedules/:id      - Get schedule details
POST   /api/v1/maintenance/schedules          - Create new schedule
PATCH  /api/v1/maintenance/schedules/:id      - Update schedule
DELETE /api/v1/maintenance/schedules/:id      - Delete schedule
POST   /api/v1/maintenance/schedules/:id/run  - Run schedule now
```

## Usage Guide

### Creating a Maintenance Schedule

1. Click **"New Schedule"** button
2. Fill in details:
   - **Title**: Name of the maintenance task
   - **Description**: Detailed instructions
   - **Asset/Location**: Where the maintenance happens
   - **Frequency**: How often (Daily/Weekly/Monthly/Yearly)
   - **Next Due Date**: When first maintenance is due
   - **Assign To**: Select responsible technician
3. Click **"Create Schedule"**

### Running a Schedule

When you click **"Run Now"** on a schedule:
1. System creates a new work order automatically
2. Work order is assigned to designated technician
3. Due date is set from schedule
4. Next due date is automatically calculated
5. Maintenance task is tracked

### Frequency Options

- **Daily**: Every 24 hours (e.g., inspections)
- **Weekly**: Every 7 days (e.g., filter checks)
- **Monthly**: Every 30 days (e.g., equipment servicing)
- **Yearly**: Every 365 days (e.g., annual inspections)

## Maintenance Workflow

```
┌──────────────────┐
│ Create Schedule  │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ Set Frequency &  │
│ Next Due Date    │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ Assign Technician│
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ Due Date Arrives │ ──→ Automatic Notification
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ Run Schedule     │ ──→ Creates Work Order
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ Complete WO      │ ──→ Records Completion
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ Next Due Date    │ ──→ Auto-calculated
│ Updated          │
└──────────────────┘
```

## Best Practices

### For Administrators

1. **Asset Inventory**: Maintain complete asset list
2. **Schedule Templates**: Create standard schedules
3. **Assign Wisely**: Match technician skills to tasks
4. **Monitor Compliance**: Track completion rates
5. **Adjust Frequency**: Optimize based on results

### For Supervisors

1. **Review Schedules**: Check upcoming tasks weekly
2. **Resource Planning**: Ensure parts availability
3. **Team Coordination**: Balance workload
4. **Follow Up**: Ensure timely completion

### For Technicians

1. **Check Daily**: Review assigned schedules
2. **Complete Promptly**: Finish before due date
3. **Document Work**: Add detailed comments
4. **Report Issues**: Flag any problems found
5. **Request Parts**: Order needed items in advance

## Common Maintenance Schedules

### HVAC Systems
- **Daily**: Temperature checks, visual inspection
- **Weekly**: Filter inspection, thermostat check
- **Monthly**: Full system inspection, filter replacement
- **Quarterly**: Coil cleaning, refrigerant check
- **Yearly**: Professional servicing, warranty maintenance

### Electrical Systems
- **Weekly**: Emergency lighting test
- **Monthly**: Panel inspection, breaker check
- **Quarterly**: Load testing, connection tightening
- **Yearly**: Thermographic inspection, full audit

### Plumbing
- **Weekly**: Leak inspection, pressure check
- **Monthly**: Drain cleaning, valve operation
- **Quarterly**: Water quality testing
- **Yearly**: Full system inspection, valve replacement

### Equipment
- **Daily**: Operational checks, safety inspection
- **Weekly**: Lubrication, basic cleaning
- **Monthly**: Detailed inspection, calibration
- **Yearly**: Major servicing, parts replacement

## Data Model

### Maintenance Schedule Schema
```typescript
{
  id: string;
  title: string;
  description: string;
  assetId: string;              // Asset or location identifier
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  nextDueDate: DateTime;
  lastCompletedDate: DateTime;
  isActive: boolean;
  assignedToId: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  tasks: MaintenanceTask[];    // History of completed tasks
}
```

### Maintenance Task Schema
```typescript
{
  id: string;
  scheduleId: string;
  workOrderId: string;
  completedAt: DateTime;
  completedById: string;
  notes: string;
  createdAt: DateTime;
}
```

## Integration with Other Modules

### Work Orders
- Auto-creates work orders from schedules
- Links maintenance tasks to work orders
- Tracks completion through work order system

### Inventory Management
- Parts used tracked in inventory
- Auto-alerts for low stock items
- Cost tracking per maintenance task

### Analytics
- Completion rate reporting
- Cost per asset analysis
- Downtime reduction metrics
- ROI calculations

### Notifications
- Email alerts for upcoming maintenance
- SMS for urgent/overdue tasks
- Push notifications on mobile
- Webhook integrations

## Reports Available

1. **Schedule Compliance**: Completion rate by schedule
2. **Asset Maintenance History**: All tasks per asset
3. **Cost Analysis**: Maintenance costs over time
4. **Technician Performance**: Tasks completed per technician
5. **Overdue Tasks**: All past-due maintenance
6. **Preventive vs Reactive**: PM effectiveness metrics

## Benefits

### Cost Savings
- Reduce emergency repairs by 40-60%
- Extend asset life by 20-30%
- Lower energy costs through efficiency
- Minimize production downtime

### Operational Efficiency
- Predictable maintenance schedule
- Optimized resource allocation
- Better inventory management
- Improved asset reliability

### Compliance
- Meet regulatory requirements
- Document maintenance history
- Ensure safety standards
- Track warranty compliance

## Mobile App Features

- View assigned schedules on mobile
- Scan QR codes to identify assets
- Complete tasks in the field
- Take before/after photos
- Update status in real-time
- Offline mode with sync

## Coming Soon

- [ ] Maintenance templates
- [ ] Parts list per schedule
- [ ] Estimated costs
- [ ] Calendar view
- [ ] Gantt chart for planning
- [ ] Custom frequencies
- [ ] Conditional schedules
- [ ] Integration with sensors
- [ ] Predictive maintenance AI
- [ ] Mobile app enhancements

---

**Version**: 1.0.0  
**Last Updated**: October 2025

