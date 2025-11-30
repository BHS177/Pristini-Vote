# 🌐 How to Add Custom Domain to Railway - Step by Step

## Prerequisites
- You need to own a domain name (buy from Namecheap, Google Domains, GoDaddy, etc.)
- Your Railway project must be deployed and running

## Step-by-Step Instructions

### Step 1: Get Your Domain Ready
1. **Buy a domain** (if you don't have one):
   - Go to: Namecheap.com, Google Domains, or GoDaddy
   - Search for a domain (e.g., `pristini-vote.com`)
   - Purchase it (~$10-15/year)

### Step 2: Add Domain in Railway

1. **Go to Railway Dashboard:**
   - Visit: https://railway.app
   - Log in to your account
   - Click on your project: `Pristini-Vote` or `abundant-simplicity`

2. **Open Your Service:**
   - Click on the service (the one that says "web" or your app name)
   - It should show your deployment

3. **Go to Settings:**
   - Click on **"Settings"** tab (top menu)
   - Or click the gear icon ⚙️

4. **Find Networking Section:**
   - Scroll down to **"Networking"** or **"Domains"** section
   - Look for **"Custom Domain"** or **"Add Domain"** button

5. **Add Your Domain:**
   - Click **"Add Domain"** or **"Generate Domain"**
   - Enter your domain name (e.g., `pristini-vote.com`)
   - Click **"Add"** or **"Save"**

### Step 3: Configure DNS Records

Railway will show you DNS records you need to add. Usually it looks like:

**Option A - CNAME Record (Most Common):**
```
Type: CNAME
Name: @ (or leave blank)
Value: xxxxx.up.railway.app
```

**Option B - A Record:**
```
Type: A
Name: @ (or leave blank)
Value: [IP address Railway provides]
```

### Step 4: Add DNS at Your Domain Registrar

1. **Go to Your Domain Registrar:**
   - Log in to Namecheap, Google Domains, GoDaddy, etc.
   - Find your domain
   - Go to **"DNS Settings"** or **"Manage DNS"**

2. **Add the DNS Record:**
   - Click **"Add Record"** or **"Add DNS Record"**
   - Select the type Railway gave you (CNAME or A)
   - Enter the name (usually `@` or leave blank for root domain)
   - Enter the value Railway provided
   - Click **"Save"**

3. **Wait for DNS Propagation:**
   - Usually takes 5-10 minutes
   - Can take up to 24 hours (but usually much faster)

### Step 5: Verify It Works

1. **Check Railway:**
   - Go back to Railway → Settings → Networking
   - You should see your domain with a status (usually "Active" or green checkmark)

2. **Test Your Domain:**
   - Visit: `https://your-domain.com`
   - Should show your voting website
   - Visit: `https://your-domain.com/admin`
   - Should show admin page

## Example Setup

**If your domain is `pristini-vote.com`:**

1. **In Railway:** Add domain `pristini-vote.com`
2. **Railway shows:** CNAME → `xxxxx.up.railway.app`
3. **At Namecheap/GoDaddy:** Add CNAME record:
   - Type: CNAME
   - Host: @
   - Value: `xxxxx.up.railway.app`
4. **Wait 5-10 minutes**
5. **Visit:** `https://pristini-vote.com` ✅

## Troubleshooting

### Domain not working?
- Wait longer (DNS can take time)
- Check DNS records are correct
- Make sure you added the record at your domain registrar
- Check Railway shows the domain as "Active"

### SSL Certificate?
- Railway automatically provides SSL (HTTPS)
- Usually takes a few minutes after DNS is set up
- Your site will have a secure lock icon 🔒

### Subdomain instead?
- If you want `vote.pristini-vote.com`:
  - Add `vote` as the CNAME name
  - Value: Railway's provided value

## Quick Reference

**Railway Settings Path:**
```
Railway Dashboard → Your Project → Your Service → Settings → Networking → Add Domain
```

**What You Need:**
- ✅ Domain name (purchased)
- ✅ Railway project deployed
- ✅ Access to domain registrar DNS settings

**Time Required:**
- Setup: 5 minutes
- DNS propagation: 5-10 minutes (usually)

**Result:**
- Professional URL: `https://your-domain.com`
- Admin URL: `https://your-domain.com/admin`

---

**Need help? Check Railway's documentation or their support chat!**

