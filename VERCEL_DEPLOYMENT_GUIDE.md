# Vercel Deployment Guide for Admin Dashboard

## Setup Instructions

Your project is now configured for Vercel deployment with full support for client-side routing including `/admin`.

### Configuration Files Ready

✅ **vercel.json** - Configured with:
- SPA routing: All routes redirect to `/index.html` for React Router handling
- Cache headers for optimal performance (no-cache for HTML, max-age for assets)
- Asset caching for `*.js` and `*.css` files

✅ **.vercelignore** - Excludes unnecessary files from deployment

### Deploy to Vercel

#### Option 1: Using Vercel CLI (Recommended)

```bash
npm i -g vercel
vercel --prod
```

#### Option 2: Using Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Vercel will auto-detect Vite and use correct build settings
6. Click "Deploy"

### Vercel Dashboard Settings (Auto-Configured)

**Framework Preset:** Vite
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

### Environment Variables

Add these to your Vercel project settings:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Post-Deployment Testing

After deployment, test these URLs:

- ✅ Home page: `https://yourdomain.vercel.app`
- ✅ Admin login: `https://yourdomain.vercel.app/admin/login`
- ✅ Admin dashboard: `https://yourdomain.vercel.app/admin` (after login)
- ✅ Refresh admin page: Should stay on `/admin` (not 404)

### How It Works

When you visit `/admin` on Vercel:

1. Request comes to Vercel
2. `vercel.json` rewrites all unknown routes to `/index.html`
3. Browser downloads `index.html` with React/Router bundle
4. React Router handles the `/admin` route client-side
5. ProtectedRoute checks authentication
6. Shows AdminDashboard if authenticated, redirects to login if not

### Troubleshooting

**Issue:** `/admin` returns 404
- **Fix:** Ensure `vercel.json` is in project root (done ✅)

**Issue:** Page refreshes on `/admin` show blank/404
- **Fix:** This config prevents that by routing to index.html (done ✅)

**Issue:** Admin page loads but data doesn't show
- **Fix:** Check Supabase RLS policies and VITE env vars
- **Solution:** Verify environment variables in Vercel dashboard

**Issue:** Authentication not persisting
- **Fix:** Check `AuthContext.tsx` for session management
- **Verify:** Supabase auth tokens are being stored/retrieved correctly

### Custom Domain

To use a custom domain (e.g., `yourdomain.com`):

1. In Vercel Dashboard → Project Settings
2. Go to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for propagation (5-10 minutes)

### Deployment Commands for Reference

```bash
# Local testing
npm run dev

# Production build
npm run build

# Preview build locally
npm run preview

# Deploy to Vercel
vercel --prod
```

---

**Your admin dashboard is now ready for production!** 🚀
