# COSTAATT CMMS - Quick Reference Guide

## 🚀 Getting Started

### Start the System
```bash
# From project root
npm run dev:all
```

### Access the System
- **Web App**: http://localhost:5174
- **API Server**: http://localhost:4000
- **API Health**: http://localhost:4000/health

### Login Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| 👑 **Admin** | admin@costaatt.edu.tt | Admin@123 | Full system access |
| 👨‍💼 **Supervisor** | sup1@costaatt.edu.tt | Pass@123 | Department management |
| 🔧 **Technician** | tech1@costaatt.edu.tt | Pass@123 | Work order completion |
| 👤 **Staff** | staff1@costaatt.edu.tt | Pass@123 | Request submission |

## 📋 Main Features

### 1️⃣ User Management
**Location**: Users menu (Admin only)

**Quick Actions:**
- ➕ Add New User
- ✏️ Edit user details
- 🔄 Change roles
- ❌ Deactivate accounts

**Access**: Admin only

---

### 2️⃣ Work Orders
**Location**: Work Orders menu

**Quick Actions:**
- ➕ Create Work Order
- 🔍 Search & Filter
- 📊 View Details
- 💬 Add Comments
- ✅ Update Status

**Access**: All users (role-based filtering)

**Status Flow:**
```
Open → In Progress → Completed
     ↘ On Hold ↗
     ↘ Cancelled
```

---

### 3️⃣ Preventive Maintenance
**Location**: Maintenance menu

**Quick Actions:**
- ➕ New Schedule
- ▶️ Run Now
- ✏️ Edit Schedule
- 📅 View Upcoming

**Access**: Admin, Supervisor, Technician

**Frequencies:**
- 📆 Daily
- 📅 Weekly
- 📊 Monthly
- 📈 Yearly

---

### 4️⃣ Inventory Management
**Location**: Inventory menu

**Quick Actions:**
- ➕ Add Item
- 📝 Record Transaction
- 📊 View Details
- ⚠️ Check Low Stock

**Access**: Admin, Supervisor, Technician

**Transaction Types:**
- ➕ Stock In
- ➖ Stock Out
- 🔄 Adjust

---

### 5️⃣ Analytics & Reports
**Location**: Analytics menu

**Available:**
- 📊 Work order statistics
- 📈 Trends and insights
- 👥 Team performance
- 💰 Cost analysis
- ⏱️ Response times

**Access**: Admin, Supervisor

---

### 6️⃣ Settings
**Location**: Settings menu (Admin only)

**Tabs:**
- ⚙️ General Settings
- 🔔 Notifications
- 🎛️ Features
- 💊 System Health
- 💾 Backup

**Access**: Admin only

---

## 🎯 Common Tasks

### Create a Work Order
1. Go to **Work Orders**
2. Click **"Create Work Order"**
3. Fill in title, description
4. Set priority and category
5. Select location
6. Assign to technician (optional)
7. Click **"Create"**

### Assign Work to Technician
1. Find work order
2. Click **"View Details"**
3. Use status dropdown
4. Select **"In Progress"**
5. Or reassign from edit

### Complete a Work Order
1. Open work order details
2. Add completion comment
3. Change status to **"Completed"**
4. Record actual hours
5. Attach photos (if needed)

### Create Maintenance Schedule
1. Go to **Maintenance**
2. Click **"New Schedule"**
3. Enter asset name
4. Set frequency
5. Choose next due date
6. Assign technician
7. Click **"Create Schedule"**

### Record Inventory Transaction
1. Go to **Inventory**
2. Find the item
3. Click **"Transaction"**
4. Select type (In/Out/Adjust)
5. Enter quantity
6. Add notes
7. Click **"Record"**

### Add a New User
1. Go to **Users** (Admin)
2. Click **"Add New User"**
3. Enter email and name
4. Set password
5. Choose role
6. Add department
7. Click **"Create User"**

---

## 🔑 Role Capabilities

### 👑 Admin
✅ Everything
- Manage users
- System settings
- All work orders
- Analytics
- Maintenance schedules
- Inventory management

### 👨‍💼 Supervisor
✅ Department management
- Department work orders
- Assign to team
- Maintenance schedules
- Inventory transactions
- Team analytics

❌ Cannot:
- Manage users
- Change system settings
- Access other departments

### 🔧 Technician
✅ Field operations
- Assigned work orders
- Complete tasks
- Inventory transactions
- View schedules
- Add comments

❌ Cannot:
- Create users
- Assign work orders
- Access analytics
- Change settings

### 👤 Staff
✅ Basic requests
- Create work orders
- View own requests
- Add comments
- Track status

❌ Cannot:
- Assign work orders
- Access inventory
- View analytics
- Manage users

---

## 📱 Navigation

### Main Menu
- 🏠 **Dashboard**: Role-specific overview
- 📋 **Work Orders**: Request management
- 🔧 **Maintenance**: Preventive schedules
- 📦 **Inventory**: Stock tracking
- 👥 **Users**: User management (Admin)
- 📊 **Analytics**: Reports (Admin/Supervisor)
- ⚙️ **Settings**: System config (Admin)

---

## 💡 Pro Tips

### Work Orders
- Use clear, descriptive titles
- Add photos when helpful
- Update status regularly
- Use internal comments for notes
- Set realistic due dates

### Maintenance
- Review schedules weekly
- Run overdue tasks promptly
- Adjust frequencies as needed
- Document completion thoroughly
- Plan for parts availability

### Inventory
- Set reorder levels wisely
- Record transactions immediately
- Link to work orders when possible
- Do regular physical counts
- Review slow-moving items

### General
- Clear browser cache if issues
- Use search for quick access
- Filter to narrow results
- Export data regularly (coming soon)
- Report bugs to admin

---

## 🆘 Troubleshooting

### Can't Login
1. Check credentials
2. Clear browser cache
3. Try incognito mode
4. Contact admin

### Page Not Loading
1. Refresh the page
2. Check internet connection
3. Verify servers are running
4. Clear browser cache

### Can't Create/Edit
1. Verify your role permissions
2. Check all required fields
3. Look for error messages
4. Contact admin if persists

### Data Not Showing
1. Try refreshing page
2. Check filters
3. Clear search query
4. Verify permissions

---

## 🔧 For Admins

### Daily Tasks
- Review new work orders
- Check overdue items
- Monitor system health
- Respond to alerts

### Weekly Tasks
- Review completion rates
- Check inventory levels
- Update maintenance schedules
- Team performance review

### Monthly Tasks
- User account audit
- Physical inventory count
- Generate reports
- System backup
- Update documentation

---

## 📞 Support

### System Issues
- Check system health in Settings
- Review error logs
- Restart servers if needed
- Contact IT support

### Training
- Review documentation (*.md files)
- Test with demo credentials
- Practice in test environment
- Request admin assistance

---

## 🔐 Security

### Password Requirements
- Minimum 8 characters
- At least one uppercase
- At least one number
- At least one special character

### Session
- Auto-logout after 12 hours
- Manual logout recommended
- Secure token storage
- No password storage

### Best Practices
- Change default passwords
- Don't share credentials
- Logout when done
- Report suspicious activity

---

## 📊 Quick Stats

View at a glance:
- **Dashboard**: Overview cards
- **Work Orders**: Status breakdown
- **Maintenance**: Schedule health
- **Inventory**: Stock levels
- **Users**: Role distribution

---

**Version**: 1.0.0  
**For**: COSTAATT Campus Services  
**Updated**: October 2025

