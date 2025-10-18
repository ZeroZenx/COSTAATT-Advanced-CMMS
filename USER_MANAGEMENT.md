# User Management Module

## Overview
Complete user management system with role-based access control, allowing administrators to manage all system users, their roles, and permissions.

## Features

### ✅ **User Management**
- Create new users with complete profiles
- Edit user information and roles
- Activate/deactivate user accounts
- Delete users (with confirmation)
- Search and filter users
- Role-based access control

### 🔐 **User Roles**

#### **👑 Admin**
- Full system access
- Manage all users
- Configure system settings
- View all work orders and data
- Access analytics and reports

#### **👨‍💼 Supervisor**
- Manage department work orders
- Assign tasks to technicians
- View department analytics
- Approve maintenance schedules

#### **🔧 Technician**
- View assigned work orders
- Update work order status
- Record time and completion
- Access inventory for parts
- Complete maintenance tasks

#### **👤 Staff/Requestor**
- Create work order requests
- View own work orders
- Add comments and updates
- Track request status

### 🔍 **Search & Filter**
- Search by name, email, or department
- Filter by role (Admin, Supervisor, Technician, Staff)
- Filter by status (Active/Inactive)
- Real-time filtering

### 📊 **User Statistics**
- Total users count
- Active users count
- Users by role breakdown
- Department distribution

## API Endpoints

```
GET    /api/v1/users           - List all users
GET    /api/v1/users/:id       - Get user details
POST   /api/v1/users           - Create new user
PATCH  /api/v1/users/:id       - Update user
DELETE /api/v1/users/:id       - Delete user
```

## Usage Guide

### Creating a User

1. Click **"Add New User"** button
2. Fill in required fields:
   - **Email**: User's email address (must be unique)
   - **Display Name**: Full name
   - **Password**: Initial password (min 8 characters)
   - **Role**: Select appropriate role
   - **Department**: Optional department assignment
   - **Phone**: Optional contact number
3. Check **"Active"** to enable account immediately
4. Click **"Create User"**

### Editing a User

1. Find the user in the list
2. Click **"Edit"** button
3. Modify any fields:
   - Change email or display name
   - Update role or department
   - Leave password blank to keep current
   - Toggle active status
4. Click **"Update User"**

### Deleting a User

1. Click **"Delete"** next to the user
2. Confirm deletion (cannot be undone)
3. User and all associated data will be removed

**Note**: You cannot delete yourself (current logged-in user)

## Best Practices

### For Admins

1. **Regular Audits**: Review user list monthly
2. **Role Assignment**: Give minimum necessary permissions
3. **Deactivate, Don't Delete**: Preserve history by deactivating instead
4. **Strong Passwords**: Enforce password requirements
5. **Department Organization**: Keep departments up-to-date

### Password Security

- Minimum 8 characters
- Include uppercase and lowercase
- Include numbers
- Include special characters
- Change default passwords immediately

### Account Management

- **New Employees**: Create account on first day
- **Role Changes**: Update immediately when promoted
- **Departures**: Deactivate accounts same day
- **Contractors**: Set end dates and monitor access

## Security Features

### Role-Based Access Control (RBAC)
- Each role has specific permissions
- Hierarchical access (Admin > Supervisor > Technician > Staff)
- Protected routes based on role
- API endpoint authorization

### Password Security
- Passwords hashed with bcrypt
- Minimum complexity requirements
- Secure storage in database
- Never displayed in plain text

### Session Management
- JWT token authentication
- Token expiration (12 hours)
- Automatic logout on expiration
- Secure token storage

## Data Model

### User Schema
```typescript
{
  id: string;
  email: string;              // Unique email address
  passwordHash: string;       // Bcrypt hashed password
  displayName: string;        // Full name
  role: 'ADMIN' | 'SUPERVISOR' | 'TECHNICIAN' | 'STAFF';
  department: string;         // Optional department
  phone: string;              // Optional phone number
  isActive: boolean;          // Account status
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

## Permissions Matrix

| Feature | Admin | Supervisor | Technician | Staff |
|---------|-------|------------|------------|-------|
| Create Users | ✅ | ❌ | ❌ | ❌ |
| Edit Users | ✅ | ❌ | ❌ | ❌ |
| Delete Users | ✅ | ❌ | ❌ | ❌ |
| View All Users | ✅ | ✅ | ❌ | ❌ |
| Create Work Orders | ✅ | ✅ | ✅ | ✅ |
| Assign Work Orders | ✅ | ✅ | ❌ | ❌ |
| View All WO | ✅ | ✅ (dept) | ❌ | ❌ |
| Complete WO | ✅ | ✅ | ✅ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ |
| Analytics | ✅ | ✅ | ❌ | ❌ |
| Inventory Mgmt | ✅ | ✅ | ✅ | ❌ |
| Maintenance Schedules | ✅ | ✅ | ✅ | ❌ |

## Default Users

The system comes with pre-configured test users:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Admin | admin@costaatt.edu.tt | Admin@123 | System administration |
| Supervisor | sup1@costaatt.edu.tt | Pass@123 | Department supervision |
| Technician | tech1@costaatt.edu.tt | Pass@123 | Field technician |
| Staff | staff1@costaatt.edu.tt | Pass@123 | Request submission |

**⚠️ Change these passwords in production!**

## Troubleshooting

### Can't Create User
- Check that email is unique
- Verify all required fields are filled
- Ensure password meets requirements
- Check admin permissions

### Can't Edit User
- Verify you have admin role
- Check user exists
- Ensure valid data in all fields

### Can't Delete User
- You cannot delete yourself
- User may have associated data
- Check admin permissions

## Audit & Compliance

### User Activity Tracking
- Login/logout events
- Password changes
- Role modifications
- Account activation/deactivation

### Data Retention
- User accounts preserved (deactivated)
- Work order history maintained
- Comments and attachments retained
- Audit trails immutable

## Integration

### Email Notifications
- Welcome email on account creation
- Password reset emails
- Role change notifications
- Account status changes

### Mobile App
- Same user accounts work on mobile
- Synchronized permissions
- Offline access with sync
- Push notifications

---

**Version**: 1.0.0  
**Last Updated**: October 2025

