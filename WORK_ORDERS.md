# Work Orders Module

## Overview
The Work Orders module is a comprehensive maintenance request management system that allows users to create, track, and manage work orders across your organization.

## Features

### ✅ **Work Order Management**
- Create new work orders with detailed information
- View all work orders in a sortable, filterable list
- Update work order status in real-time
- Assign work orders to technicians
- Set priorities (Low, Medium, High, Urgent)
- Track work order lifecycle (Open → In Progress → Completed)

### 🔍 **Advanced Filtering & Search**
- Search by title, description, or work order number
- Filter by:
  - Status (Open, In Progress, Completed, Cancelled, On Hold)
  - Priority (Low, Medium, High, Urgent)
  - Category (HVAC, Electrical, Plumbing, etc.)
  - Assigned technician
  - Date ranges

### 📊 **Dashboard Statistics**
- Total work orders count
- Open work orders
- In Progress work orders
- Completed work orders
- Average completion time
- Work orders by priority
- Work orders by category

### 💬 **Communication**
- Add comments to work orders
- Internal vs public comments
- Real-time comment updates
- Track conversation history

### 📎 **Attachments** (Ready for implementation)
- Upload photos and documents
- Multiple file format support
- File size tracking

### 🔐 **Role-Based Access**
- **Admin**: Full access to all work orders
- **Supervisor**: View and manage department work orders
- **Technician**: View assigned work orders and own created ones
- **Staff**: Create and view own work orders

## API Endpoints

### Work Orders
```
GET    /api/v1/work-orders           - List all work orders (with filters)
GET    /api/v1/work-orders/:id       - Get work order details
POST   /api/v1/work-orders           - Create new work order
PATCH  /api/v1/work-orders/:id       - Update work order
DELETE /api/v1/work-orders/:id       - Delete work order (Admin only)
GET    /api/v1/work-orders/stats     - Get work order statistics
```

### Comments
```
POST   /api/v1/work-orders/:id/comments  - Add comment to work order
```

## Usage Guide

### Creating a Work Order

1. Click the **"Create Work Order"** button
2. Fill in the required fields:
   - **Title**: Brief description of the issue
   - **Description**: Detailed explanation
   - **Priority**: Select urgency level
   - **Category**: Type of work (HVAC, Electrical, etc.)
   - **Location**: Where the work needs to be done
3. Optionally:
   - Assign to a technician
   - Set a due date
   - Estimate hours required
4. Click **"Create Work Order"**

### Viewing Work Order Details

1. Click **"View Details"** on any work order
2. See complete information including:
   - Full description
   - Status and priority
   - Assigned technician
   - Location and category
   - Creation and due dates
   - All comments and history
3. Add comments to communicate with team members
4. Mark internal comments for staff-only visibility

### Updating Work Order Status

You can quickly update status from the list view:
1. Use the dropdown next to each work order
2. Select new status:
   - **Open**: Newly created, awaiting assignment
   - **In Progress**: Currently being worked on
   - **On Hold**: Temporarily paused
   - **Completed**: Work finished
   - **Cancelled**: Work order no longer needed

### Filtering Work Orders

Use the filter bar to narrow down results:
1. **Search**: Type keywords to search titles, descriptions, or WO numbers
2. **Status Filter**: Show only work orders with specific status
3. **Priority Filter**: Filter by urgency level
4. **Category Filter**: Show only specific types of work

## Work Order Lifecycle

```
┌─────────┐
│  OPEN   │ ← Initial Status
└────┬────┘
     │
     ↓
┌──────────────┐
│ IN_PROGRESS  │ ← Work Started
└──────┬───────┘
       │
       ├──────→ ┌──────────┐
       │        │ ON_HOLD  │ ← Temporarily Paused
       │        └────┬─────┘
       │             │
       │             ↓
       ↓        ┌──────────┐
   ┌───────────┤          │
   │           │ Continue │
   │           └──────────┘
   ↓
┌───────────┐
│ COMPLETED │ ← Work Finished
└───────────┘

   OR
   
┌───────────┐
│ CANCELLED │ ← Work Order Cancelled
└───────────┘
```

## Best Practices

### For Requestors (Staff)
1. **Be Specific**: Provide detailed descriptions
2. **Set Priorities**: Use correct priority levels
3. **Add Photos**: Attach images when helpful (coming soon)
4. **Follow Up**: Add comments for updates or clarifications

### For Technicians
1. **Update Status**: Change status as work progresses
2. **Log Time**: Record actual hours spent
3. **Document Work**: Add detailed comments about work performed
4. **Close Promptly**: Mark as completed when finished

### For Supervisors
1. **Review Daily**: Check for new urgent work orders
2. **Assign Wisely**: Distribute work based on skills and availability
3. **Monitor Progress**: Track completion rates and times
4. **Provide Feedback**: Use comments to guide team members

### For Admins
1. **Analyze Trends**: Review statistics regularly
2. **Optimize Workflow**: Identify bottlenecks
3. **Manage Categories**: Standardize categories and procedures
4. **Train Users**: Ensure everyone understands the system

## Data Model

### Work Order Schema
```typescript
{
  id: string;
  workOrderNumber: string;        // Auto-generated (e.g., WO-0001)
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: string;               // e.g., "HVAC", "Electrical"
  location: string;               // e.g., "Main Building - Room 101"
  tags: string[];                 // Optional tags for organization
  estimatedHours: number;
  actualHours: number;
  dueDate: DateTime;
  completedAt: DateTime;
  createdAt: DateTime;
  updatedAt: DateTime;
  createdById: string;            // User who created the work order
  assignedToId: string;           // Technician assigned to the work
}
```

## Notifications (Integrated)

Work orders trigger automatic notifications:
- **New Work Order**: Notify assigned technician
- **Status Change**: Update requester and supervisor
- **Comment Added**: Notify all participants
- **Overdue**: Alert when past due date
- **SLA Breach**: Escalate critical issues

## Reports Available

1. **Work Order Summary**: Overview of all work orders
2. **Completion Rate**: Percentage completed on time
3. **Average Response Time**: Time from creation to assignment
4. **Average Completion Time**: Time from assignment to completion
5. **Work Orders by Category**: Distribution across types
6. **Technician Performance**: Individual productivity metrics
7. **Overdue Work Orders**: List of past-due items

## Mobile App Integration

The Work Orders module is fully available in the mobile app:
- Create work orders on the go
- Scan QR codes to link to assets
- Take photos and attach immediately
- Update status from the field
- Add GPS location automatically
- Receive push notifications
- Work offline and sync later

## Coming Soon

- [ ] File attachments with drag-and-drop
- [ ] Work order templates
- [ ] Recurring work orders
- [ ] Custom fields
- [ ] Email notifications
- [ ] SMS alerts for urgent work orders
- [ ] Calendar view
- [ ] Gantt chart for scheduling
- [ ] Work order merging
- [ ] Bulk operations
- [ ] Export to PDF/Excel
- [ ] Integration with inventory management

## Troubleshooting

### Can't See Work Orders
- Check your role permissions
- Technicians only see assigned work orders
- Clear filters and try again

### Can't Create Work Order
- Ensure all required fields are filled
- Check that you're logged in
- Verify API server is running

### Status Not Updating
- Refresh the page
- Check your permissions
- Ensure work order is not already completed

## Support

For questions or issues:
- Contact your system administrator
- Check the main README for setup instructions
- Review API documentation for integration details

---

**Version**: 1.0.0  
**Last Updated**: October 2025

