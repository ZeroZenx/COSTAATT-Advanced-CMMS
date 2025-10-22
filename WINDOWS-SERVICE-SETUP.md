# COSTAATT CMMS - Windows Service Configuration ✅

## 🎉 **SETUP COMPLETE - AUTO-START ENABLED!**

The CMMS system is now running as **Windows Services** and will automatically:
- ✅ **Start on Windows boot**
- ✅ **Restart automatically if they crash**
- ✅ **Run in the background (no windows)**
- ✅ **Persist across user logouts**
- ✅ **Keep running 24/7**

---

## 🔧 **Installed Windows Services**

| Service Name | Display Name | Port | Auto-Start | Restart on Failure |
|--------------|--------------|------|------------|--------------------|
| `COSTAATT-CMMS-Backend` | COSTAATT CMMS Backend | 4000 | ✅ Yes | ✅ Yes |
| `COSTAATT-CMMS-Frontend` | COSTAATT CMMS Frontend | 5174 | ✅ Yes | ✅ Yes |

---

## 🚀 **Managing CMMS Services**

### **Option 1: Using PowerShell Scripts (Recommended)**

#### Start Services:
```powershell
cd C:\COSTAATT-CMMS
.\start-cmms.ps1
```

#### Stop Services:
```powershell
cd C:\COSTAATT-CMMS
.\stop-cmms.ps1
```

#### Check Status:
```powershell
cd C:\COSTAATT-CMMS
.\check-cmms-status.ps1
```

---

### **Option 2: Using PowerShell Commands**

#### Start:
```powershell
Start-Service COSTAATT-CMMS-Backend
Start-Service COSTAATT-CMMS-Frontend
```

#### Stop:
```powershell
Stop-Service COSTAATT-CMMS-Backend
Stop-Service COSTAATT-CMMS-Frontend
```

#### Restart:
```powershell
Restart-Service COSTAATT-CMMS-Backend
Restart-Service COSTAATT-CMMS-Frontend
```

#### Status:
```powershell
Get-Service COSTAATT-CMMS-*
```

---

### **Option 3: Using Windows Services Manager (GUI)**

1. Press `Win + R`, type `services.msc`, press Enter
2. Find services:
   - **COSTAATT CMMS Backend**
   - **COSTAATT CMMS Frontend**
3. Right-click service → Start/Stop/Restart

---

## 📊 **Service Configuration Details**

### Backend Service
- **Service Name:** `COSTAATT-CMMS-Backend`
- **Executable:** `C:\COSTAATT-CMMS\run-backend.bat`
- **Port:** 4000
- **Log Files:**
  - Output: `C:\COSTAATT-CMMS\logs\service-backend.log`
  - Errors: `C:\COSTAATT-CMMS\logs\service-backend-error.log`

### Frontend Service
- **Service Name:** `COSTAATT-CMMS-Frontend`
- **Executable:** `C:\COSTAATT-CMMS\run-frontend.bat`
- **Port:** 5174
- **Log Files:**
  - Output: `C:\COSTAATT-CMMS\logs\service-frontend.log`
  - Errors: `C:\COSTAATT-CMMS\logs\service-frontend-error.log`

---

## 📋 **Access URLs**

- **CMMS Frontend:** http://10.2.1.27:5174
- **CMMS Backend:** http://10.2.1.27:4000
- **Login:** admin@costaatt.edu.tt / Admin@123

---

## 🔍 **Checking Logs**

### View Service Logs:
```powershell
# Backend logs
Get-Content C:\COSTAATT-CMMS\logs\service-backend.log -Tail 50

# Frontend logs
Get-Content C:\COSTAATT-CMMS\logs\service-frontend.log -Tail 50

# Error logs
Get-Content C:\COSTAATT-CMMS\logs\service-backend-error.log -Tail 50
Get-Content C:\COSTAATT-CMMS\logs\service-frontend-error.log -Tail 50
```

### Monitor Logs in Real-time:
```powershell
Get-Content C:\COSTAATT-CMMS\logs\service-backend.log -Wait -Tail 20
```

---

## 🔧 **Troubleshooting**

### Service Won't Start

1. **Check Service Status:**
   ```powershell
   Get-Service COSTAATT-CMMS-* | Format-List *
   ```

2. **Check Logs:**
   ```powershell
   Get-Content C:\COSTAATT-CMMS\logs\service-backend-error.log -Tail 50
   ```

3. **Check Port Conflicts:**
   ```powershell
   netstat -ano | findstr ":4000"
   netstat -ano | findstr ":5174"
   ```

4. **Restart Services:**
   ```powershell
   Restart-Service COSTAATT-CMMS-Backend
   Restart-Service COSTAATT-CMMS-Frontend
   ```

---

### Service Keeps Restarting

1. **View Error Logs:**
   ```powershell
   Get-Content C:\COSTAATT-CMMS\logs\service-backend-error.log
   ```

2. **Check Database Connection:**
   ```powershell
   mysql -u root -p -e "SHOW DATABASES;"
   ```

3. **Verify Node.js Installation:**
   ```powershell
   node --version
   ```

---

### Remove Services (If Needed)

**⚠️ Only do this if you need to completely remove the services:**

```powershell
# Stop services first
Stop-Service COSTAATT-CMMS-Backend -Force
Stop-Service COSTAATT-CMMS-Frontend -Force

# Remove services using NSSM
& "C:\Program Files\nssm\nssm.exe" remove COSTAATT-CMMS-Backend confirm
& "C:\Program Files\nssm\nssm.exe" remove COSTAATT-CMMS-Frontend confirm
```

---

### Reinstall Services

If you need to reinstall:

```powershell
# Remove old services
Stop-Service COSTAATT-CMMS-* -Force
& "C:\Program Files\nssm\nssm.exe" remove COSTAATT-CMMS-Backend confirm
& "C:\Program Files\nssm\nssm.exe" remove COSTAATT-CMMS-Frontend confirm

# Reinstall
& "C:\Program Files\nssm\nssm.exe" install COSTAATT-CMMS-Backend "C:\COSTAATT-CMMS\run-backend.bat"
& "C:\Program Files\nssm\nssm.exe" install COSTAATT-CMMS-Frontend "C:\COSTAATT-CMMS\run-frontend.bat"

# Configure (repeat all configuration commands)
```

---

## ⚙️ **Advanced Configuration**

### Change Service Settings:

```powershell
# Change display name
& "C:\Program Files\nssm\nssm.exe" set COSTAATT-CMMS-Backend DisplayName "New Name"

# Change startup type
& "C:\Program Files\nssm\nssm.exe" set COSTAATT-CMMS-Backend Start SERVICE_DELAYED_AUTO_START

# Set restart delay (milliseconds)
& "C:\Program Files\nssm\nssm.exe" set COSTAATT-CMMS-Backend AppRestartDelay 5000
```

---

## 📊 **Service Startup Behavior**

When Windows boots:
1. MySQL starts (existing service)
2. Wait ~5 seconds
3. COSTAATT-CMMS-Backend starts (connects to MySQL)
4. COSTAATT-CMMS-Frontend starts (connects to backend)
5. Both services become accessible on the network

**Total boot time:** ~15-30 seconds after Windows login

---

## ✅ **Verification Checklist**

After Windows restart, verify:

- [ ] Services are running: `Get-Service COSTAATT-CMMS-*`
- [ ] Ports are listening: `netstat -ano | findstr "4000 5174"`
- [ ] Frontend accessible: http://10.2.1.27:5174
- [ ] Backend responding: http://10.2.1.27:4000
- [ ] HR system still working: http://10.2.1.27:5173
- [ ] No errors in logs

---

## 🎯 **Key Benefits**

✅ **Auto-Start:** Services start automatically on Windows boot  
✅ **Auto-Restart:** Automatic restart if service crashes  
✅ **Background:** No visible windows, runs as system service  
✅ **Persistent:** Runs even when no user is logged in  
✅ **Reliable:** Production-grade service management  
✅ **Easy Management:** Simple PowerShell scripts  

---

## 📞 **Support**

For issues:
1. Run `.\check-cmms-status.ps1`
2. Check log files in `C:\COSTAATT-CMMS\logs\`
3. Verify HR system is still working
4. Check Windows Event Viewer for service errors

---

*Windows Service Setup Completed: October 21, 2025*

