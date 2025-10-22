# Apache-Only Configuration for CMMS

**Date:** October 21, 2025  
**Web Server:** Apache (XAMPP)  
**Status:** ✅ Fully Operational

---

## ✅ **Configuration Summary**

### **Web Server: Apache (XAMPP)**
- **Role:** Reverse proxy for CMMS
- **Port:** 80 (HTTP)
- **Status:** Running and auto-start enabled
- **Location:** C:\xampp\apache\

### **IIS: Disabled**
- **Status:** Stopped
- **Startup:** Manual (won't auto-start)
- **Reason:** Prevents conflict with Apache on port 80

---

## 🌐 **CMMS Access URLs**

### **Primary (Recommended):**
```
http://cmms.costaatt.edu.tt
```
- Clean URL (no port number)
- Goes through Apache reverse proxy
- Professional and user-friendly

### **Alternative URLs:**
```
http://cmms.costaatt.edu.tt:5174  (Direct access)
http://10.2.1.27:5174             (IP access)
```

---

## 🔧 **Apache Configuration**

### **Virtual Host File:**
`C:\xampp\apache\conf\extra\httpd-cmms.conf`

### **Configuration:**
```apache
<VirtualHost *:80>
    ServerName cmms.costaatt.edu.tt
    
    ProxyRequests Off
    ProxyPreserveHost On
    ProxyVia On
    
    <Proxy *>
        Order deny,allow
        Allow from all
        Require all granted
    </Proxy>
    
    <Location />
        Require all granted
        ProxyPass http://localhost:5174/
        ProxyPassReverse http://localhost:5174/
    </Location>
    
    ErrorLog "logs/cmms-error.log"
    CustomLog "logs/cmms-access.log" combined
</VirtualHost>
```

### **Enabled Modules:**
- ✅ mod_proxy
- ✅ mod_proxy_http
- ✅ mod_rewrite

---

## 🚀 **Managing Apache**

### **Using XAMPP Control Panel:**
1. Open XAMPP Control Panel
2. Apache section → Start/Stop

### **Using Command Line:**

#### Start Apache:
```powershell
Start-Process "C:\xampp\apache\bin\httpd.exe" -WindowStyle Hidden
```

#### Stop Apache:
```powershell
Get-Process httpd | Stop-Process -Force
```

#### Restart Apache:
```powershell
Get-Process httpd | Stop-Process -Force
Start-Sleep -Seconds 2
Start-Process "C:\xampp\apache\bin\httpd.exe" -WindowStyle Hidden
```

#### Test Configuration:
```powershell
& "C:\xampp\apache\bin\httpd.exe" -t
```

---

## 📝 **Configuration Files**

| File | Purpose |
|------|---------|
| `C:\xampp\apache\conf\httpd.conf` | Main Apache config |
| `C:\xampp\apache\conf\extra\httpd-cmms.conf` | CMMS virtual host |
| `C:\xampp\apache\conf\extra\httpd-vhosts.conf` | Other virtual hosts |

---

## 🔍 **Troubleshooting**

### **Apache Won't Start:**

1. **Check if IIS is running:**
   ```powershell
   Get-Service W3SVC
   # If running, stop it:
   Stop-Service W3SVC -Force
   ```

2. **Check port 80:**
   ```powershell
   netstat -ano | findstr ":80"
   ```

3. **Test Apache config:**
   ```powershell
   & "C:\xampp\apache\bin\httpd.exe" -t
   ```

4. **Check Apache error log:**
   ```powershell
   Get-Content C:\xampp\apache\logs\error.log -Tail 20
   ```

### **Reverse Proxy Not Working:**

1. **Check CMMS is running:**
   ```powershell
   Get-Service COSTAATT-CMMS-Frontend
   netstat -ano | findstr ":5174"
   ```

2. **Test direct access:**
   ```powershell
   curl http://localhost:5174
   ```

3. **Check proxy logs:**
   ```powershell
   Get-Content C:\xampp\apache\logs\cmms-error.log -Tail 20
   ```

### **DNS Not Resolving:**

1. **Check HOSTS file:**
   ```powershell
   Get-Content C:\Windows\System32\drivers\etc\hosts | Select-String "cmms"
   ```

2. **Flush DNS:**
   ```powershell
   ipconfig /flushdns
   ```

3. **Test resolution:**
   ```powershell
   nslookup cmms.costaatt.edu.tt
   ```

---

## 🔄 **After Server Restart:**

Everything will automatically start in this order:
1. ✅ MySQL starts (XAMPP)
2. ✅ Apache starts (XAMPP)
3. ✅ CMMS Backend service starts
4. ✅ CMMS Frontend service starts
5. ❌ IIS stays stopped (manual)

**No manual intervention needed!**

---

## ⚙️ **Advanced Configuration**

### **Add HTTPS/SSL Later:**

When you get an SSL certificate for cmms.costaatt.edu.tt:

1. Place certificate in: `C:\xampp\apache\conf\ssl\`
2. Create: `C:\xampp\apache\conf\extra\httpd-cmms-ssl.conf`
3. Configure port 443 virtual host
4. Redirect HTTP to HTTPS

### **Enable Access Logging:**

Apache is already logging:
- **Access:** `C:\xampp\apache\logs\cmms-access.log`
- **Errors:** `C:\xampp\apache\logs\cmms-error.log`

---

## 📊 **Complete System Architecture**

```
Internet/Internal Network
         ↓
DNS: cmms.costaatt.edu.tt
         ↓
Resolves to: 10.2.1.27
         ↓
Windows Server (10.2.1.27)
         ↓
Apache :80 (Reverse Proxy)
         ↓
CMMS Frontend :5174
         ↓
CMMS Backend :4000
         ↓
MySQL :3306
         ↓
Database: costaatt_cmms
```

---

## ✅ **Success Criteria - ALL MET:**

- [x] Apache running on port 80
- [x] IIS disabled (no conflicts)
- [x] CMMS accessible via DNS name
- [x] Clean URL works (no port)
- [x] Reverse proxy functioning
- [x] Auto-start configured
- [x] Login working
- [x] HR system unaffected

---

## 🎊 **You're All Set!**

Your CMMS is now running with:
- ✅ Apache as the web server
- ✅ Clean DNS name
- ✅ No IIS conflicts
- ✅ Auto-start on boot
- ✅ Professional setup

**Share this URL with your team:**  
**http://cmms.costaatt.edu.tt**

---

*For team announcement, see: C:\COSTAATT-CMMS\FINAL-TEAM-ANNOUNCEMENT.md*

