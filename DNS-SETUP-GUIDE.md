# DNS Setup Guide for CMMS

## ✅ What's Been Configured

### **Apache Reverse Proxy**
- ✅ Apache configuration updated
- ✅ Virtual host created for cmms.costaatt.edu.tt
- ✅ Proxy rules configured to forward to localhost:5174
- ✅ Firewall rules in place
- ✅ Configuration file: `C:\xampp\apache\conf\extra\httpd-cmms.conf`

---

## 🌐 DNS Setup Required

**You need to create a DNS A record** on your DNS server:

### **DNS Record Details:**
```
Type: A
Name: cmms
Domain: costaatt.edu.tt
Value/IP: 10.2.1.27
TTL: 3600 (or your default)
```

### **Result:**
`cmms.costaatt.edu.tt` → `10.2.1.27`

---

## 📞 Contact Your Network/DNS Administrator

**Provide them with this information:**

```
Please create a DNS A record for the new CMMS system:

Record Type: A (Address Record)
Hostname: cmms
Full Domain: cmms.costaatt.edu.tt  
IP Address: 10.2.1.27
TTL: 3600 seconds (1 hour)

This will allow internal users to access the CMMS system at:
http://cmms.costaatt.edu.tt
```

---

## ✅ Testing After DNS is Created

### **Step 1: Verify DNS Resolution**
Open PowerShell and run:
```powershell
nslookup cmms.costaatt.edu.tt
```

**Expected result:**
```
Name:    cmms.costaatt.edu.tt
Address: 10.2.1.27
```

### **Step 2: Test HTTP Access**
```powershell
curl http://cmms.costaatt.edu.tt
```

### **Step 3: Browser Test**
Open browser and navigate to:
```
http://cmms.costaatt.edu.tt
```

---

## 🔄 Alternative: Test Using HOSTS File (Immediate Testing)

If you want to test before DNS is set up, edit the Windows HOSTS file:

### **On Your Computer:**
1. **Open Notepad as Administrator**
2. **Open file:** `C:\Windows\System32\drivers\etc\hosts`
3. **Add this line:**
   ```
   10.2.1.27  cmms.costaatt.edu.tt
   ```
4. **Save and close**
5. **Test:** http://cmms.costaatt.edu.tt in your browser

⚠️ **Note:** This only works on YOUR computer. Other users still need the DNS record.

---

## 🎯 Current Access Methods

| Method | URL | Status |
|--------|-----|--------|
| **Direct IP with Port** | http://10.2.1.27:5174 | ✅ Working Now |
| **DNS Name (after DNS setup)** | http://cmms.costaatt.edu.tt | ⏳ Pending DNS |

---

## 📊 System Architecture After DNS Setup

```
User Browser
     ↓
cmms.costaatt.edu.tt (DNS resolves to 10.2.1.27)
     ↓
Windows Server (10.2.1.27)
     ↓
Apache (Port 80) - Reverse Proxy
     ↓
CMMS Frontend (Port 5174)
     ↓
CMMS Backend (Port 4000)
     ↓
MySQL Database (Port 3306)
```

---

## 🔧 Troubleshooting

### **Issue: DNS doesn't resolve**
```powershell
# Check DNS
nslookup cmms.costaatt.edu.tt

# If it doesn't work, contact DNS administrator
```

### **Issue: DNS resolves but site doesn't load**
```powershell
# Test if Apache is running
netstat -ano | findstr ":80"

# Test proxy directly
curl http://localhost:5174
```

### **Issue: 403 Forbidden error**
```powershell
# Check Apache error log
Get-Content C:\xampp\apache\logs\error.log -Tail 20
```

---

## 📝 Summary for IT Team

**What to tell your network administrator:**

> "We've deployed a new CMMS (Computerized Maintenance Management System) on server 10.2.1.27. 
> 
> We need a DNS A record created:
> - **Hostname:** cmms.costaatt.edu.tt
> - **IP Address:** 10.2.1.27
> 
> This will allow users to access the system at http://cmms.costaatt.edu.tt instead of having to type the IP address and port number.
> 
> The server is already configured and ready. We just need the DNS record to make it accessible via the friendly name."

---

## ✅ Verification Checklist

After DNS is set up, verify:

- [ ] DNS resolves: `nslookup cmms.costaatt.edu.tt` returns 10.2.1.27
- [ ] HTTP works: `curl http://cmms.costaatt.edu.tt` returns 200 OK
- [ ] Browser works: Can login at http://cmms.costaatt.edu.tt
- [ ] Clean URL: No need to type port number
- [ ] Multiple users: Other computers can access it too

---

## 🎊 Benefits of DNS Setup

✅ **Easy to remember:** cmms.costaatt.edu.tt vs 10.2.1.27:5174  
✅ **Professional:** Matches your other systems (hrpmg.costaatt.edu.tt)  
✅ **No port numbers:** Clean URL  
✅ **Future-proof:** IP can change without changing user bookmarks  
✅ **SSL ready:** Can add HTTPS later  

---

## 📞 Questions?

- **DNS Issues:** Contact your network/DNS administrator
- **CMMS Issues:** Check logs in `C:\COSTAATT-CMMS\logs\`
- **Apache Issues:** Check `C:\xampp\apache\logs\error.log`

---

*For technical details, see: C:\COSTAATT-CMMS\README-DEPLOYMENT.md*


