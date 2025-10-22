# COSTAATT CMMS - Deployment Complete ✅

## 🎉 Deployment Status: SUCCESS

The CMMS system has been successfully deployed alongside the existing HR system.

---

## 📊 System Configuration

### HR System (Existing - Unaffected)
- **Frontend:** http://10.2.1.27:5173
- **Backend:** http://10.2.1.27:3000
- **Database:** `costaatt_hr`
- **Status:** ✅ Running and verified

### CMMS System (Newly Deployed)
- **Frontend:** http://10.2.1.27:5174
- **Backend:** http://10.2.1.27:4000
- **Database:** `costaatt_cmms`
- **Status:** ✅ Running and accessible

### Shared Infrastructure
- **MySQL Server:** Port 3306 (shared between HR and CMMS)
- **Databases:** Completely isolated (costaatt_hr ≠ costaatt_cmms)

---

## 🚀 Starting/Stopping CMMS

### To Start CMMS:
```powershell
cd C:\COSTAATT-CMMS
.\start-cmms.ps1
```

### To Stop CMMS:
```powershell
cd C:\COSTAATT-CMMS
.\stop-cmms.ps1
```

### To Check Status:
```powershell
# Check which ports are listening
netstat -ano | findstr "3000 4000 5173 5174"

# Test CMMS frontend
curl http://10.2.1.27:5174/

# Test CMMS backend
curl http://10.2.1.27:4000/
```

---

## 🔑 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@costaatt.edu.tt | Admin@123 |
| Supervisor | sup1@costaatt.edu.tt | Pass@123 |
| Technician | tech1@costaatt.edu.tt | Pass@123 |
| Staff | staff1@costaatt.edu.tt | Pass@123 |

---

## 📁 Directory Structure

```
C:\
├── HR\
│   └── HR\                          # HR System (DO NOT MODIFY)
│       ├── apps\api\                # HR Backend
│       ├── apps\web\                # HR Frontend
│       └── ...
│
└── COSTAATT-CMMS\                   # CMMS System (NEW)
    ├── apps\
    │   ├── api\                     # CMMS Backend
    │   └── web\                     # CMMS Frontend
    ├── start-cmms.ps1               # Start script
    ├── stop-cmms.ps1                # Stop script
    └── ecosystem.config.js          # PM2 config (for future use)
```

---

## 🗄️ Database Structure

```
MySQL Server (Port 3306)
├── costaatt_hr        # HR database (EXISTING - DO NOT TOUCH)
│   ├── users
│   ├── employees
│   ├── appraisals
│   └── ...
│
└── costaatt_cmms      # CMMS database (NEW - ISOLATED)
    ├── users
    ├── work_orders
    ├── assets
    ├── maintenance_schedules
    └── ...
```

**Important:** Both databases are completely isolated - no shared tables or data.

---

## 🔥 Firewall Configuration

The following ports have been opened:
- ✅ Port 3000 (HR Backend)
- ✅ Port 3306 (MySQL)
- ✅ Port 4000 (CMMS Backend) - **NEW**
- ✅ Port 5173 (HR Frontend)
- ✅ Port 5174 (CMMS Frontend) - **NEW**

---

## 🔧 Troubleshooting

### CMMS Not Accessible

```powershell
# Check if services are running
netstat -ano | findstr ":4000"
netstat -ano | findstr ":5174"

# If not running, start them
cd C:\COSTAATT-CMMS
.\start-cmms.ps1
```

### Port Conflicts

```powershell
# Find what's using a port
netstat -ano | findstr ":4000"

# Kill a specific process (replace PID)
taskkill /PID <PID> /F
```

### Database Connection Issues

```powershell
# Test MySQL connection
mysql -u root -p

# Check databases
SHOW DATABASES;

# Verify CMMS database exists
USE costaatt_cmms;
SHOW TABLES;
```

### HR System Verification

```powershell
# Always verify HR still works after changes
curl http://10.2.1.27:5173/
curl http://10.2.1.27:3000/
```

---

## ⚠️ Important Notes

1. **DO NOT** modify the HR system (`C:\HR\HR\`)
2. **DO NOT** access the `costaatt_hr` database from CMMS
3. **DO NOT** change ports 3000 or 5173 (reserved for HR)
4. **ALWAYS** verify HR system works after making changes
5. **BACKUP** databases before making major changes

---

## 📞 Support

For issues or questions:
1. Check this README
2. Review logs in `C:\COSTAATT-CMMS\logs\`
3. Verify HR system is still running
4. Contact system administrator

---

## ✅ Success Criteria

Deployment is successful when:
- [x] CMMS frontend accessible at http://10.2.1.27:5174
- [x] CMMS backend responding at http://10.2.1.27:4000
- [x] HR system still accessible at http://10.2.1.27:5173
- [x] Both systems running simultaneously
- [x] Separate databases verified
- [x] No port conflicts
- [x] Login works with test credentials

**Status: ALL CRITERIA MET ✅**

---

*Deployment completed: October 21, 2025*

