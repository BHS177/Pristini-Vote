# Deployment Instructions

## 🚀 Quick Deploy to Vercel (Recommended - Easiest & Free)

### Option 1: Deploy via GitHub (Recommended)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign up/login

3. **Click "Add New Project"**

4. **Import your GitHub repository** (`Pristini-Vote`)

5. **Configure:**
   - Framework Preset: **Other**
   - Root Directory: `./` (leave as is)
   - Build Command: (leave empty)
   - Output Directory: (leave empty)

6. **Click "Deploy"**

7. **Your site will be live in ~2 minutes!**

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? **Yes**
   - Which scope? (choose your account)
   - Link to existing project? **No**
   - Project name? `pristini-vote` (or your choice)
   - Directory? `./` (press Enter)

5. **For production deployment:**
   ```bash
   vercel --prod
   ```

## 📍 Access Your Deployed Website

After deployment, Vercel will give you URLs like:
- **Main Voting Page:** `https://pristini-vote.vercel.app`
- **Admin Panel:** `https://pristini-vote.vercel.app/admin`

**Share with students:** The main URL (without `/admin`)

**Share with president only:** The `/admin` URL

## 🔒 Security Note

The admin page is accessible to anyone who knows the URL. For better security, you can:
1. Use a password (we can add this if needed)
2. Share the admin URL only with the president
3. The URL is not indexed by search engines

## Alternative: Deploy to Heroku

1. **Create a `Procfile` in the root:**
   ```
   web: node server.js
   ```

2. **Install Heroku CLI** and login:
   ```bash
   heroku login
   ```

3. **Create and deploy:**
   ```bash
   heroku create pristini-vote
   git push heroku main
   ```

4. **Access:**
   - Main: `https://pristini-vote.herokuapp.com`
   - Admin: `https://pristini-vote.herokuapp.com/admin`

## Alternative: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Connect your repository
4. Railway will auto-detect Node.js and deploy

## Environment Variables

No environment variables needed for basic setup. The server runs on port 3000 by default, or uses `process.env.PORT` if set (which hosting platforms set automatically).

## Important Notes

- ✅ Votes are stored in memory and will reset when the server restarts
- ✅ For production, consider using a database (MongoDB, PostgreSQL, etc.) if you need persistent storage
- ✅ The admin page shows all voters with their names and votes
- ✅ Students can only access the voting page, not the admin page
- ✅ The website works on all devices (mobile, tablet, desktop)

## 📱 Testing After Deployment

1. Test the voting page on mobile and desktop
2. Test the admin page to see vote results
3. Share the main URL with students
4. Share the admin URL only with the president

