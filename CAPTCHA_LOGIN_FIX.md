# Fix: Captcha Required for Login (500 Error)

## Problem

You're getting a `500 Internal Server Error` when trying to log in, and the error message says "captcha verification process failed". This happens because **Supabase has captcha enabled for login**, but your code doesn't send a captcha token during login.

## Root Cause

In Supabase Dashboard, captcha protection can be enabled for:
- **Sign up only** ✅ (Recommended)
- **Sign up AND login** ❌ (Causes this issue)

If captcha is enabled for login, Supabase expects a captcha token with every login request. Since we're not sending one (because login shouldn't require captcha), Supabase returns a 500 error.

## Solution

### Option 1: Disable Captcha for Login (Recommended)

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/oxipnmlkhfqustalghxq
2. **Navigate to**: **Authentication** → **Settings** → **Bot and Abuse Protection**
3. **Check captcha settings**:
   - If captcha is enabled globally (for both sign up and login), you need to configure it to only apply to sign up
   - Look for options like "Apply to sign up only" or "Apply to login" and disable it for login
4. **Save changes**

### Option 2: Check Supabase Captcha Configuration

Supabase might have captcha configured to apply to all auth endpoints. Check:

1. **Go to**: **Authentication** → **Settings** → **Bot and Abuse Protection**
2. **Verify**:
   - Captcha provider (hCaptcha, Cloudflare Turnstile, etc.)
   - Whether it's applied to login endpoints
   - If there's an option to exclude login from captcha

### Option 3: Add Captcha to Login (Not Recommended)

If you must have captcha on login (not recommended for UX), you would need to:

1. Show captcha on login form
2. Get captcha token before login
3. Pass captcha token to `signInWithPassword`

**But this is NOT recommended** because:
- Login should be fast and frictionless
- Captcha on login hurts user experience
- Captcha should only protect sign up from bots

## Recommended Configuration

**Best practice**: Captcha should only be enabled for **sign up**, not login.

- ✅ **Sign up**: Requires captcha (prevents bot registrations)
- ❌ **Login**: No captcha (fast and user-friendly)

## How to Verify

After making changes:

1. **Try logging in** - should work without captcha
2. **Try signing up** - should still require captcha
3. **Check Supabase logs** - should see successful login requests

## Troubleshooting

If you still get the error after disabling captcha for login:

1. **Clear browser cache** - old error messages might be cached
2. **Check Supabase logs** - look for the exact error message
3. **Verify environment variables** - make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
4. **Wait a few minutes** - Supabase settings changes might take a moment to propagate

## Related Files

- `app/login/page.tsx` - Login form (captcha only shown for sign up)
- `HCAPTCHA_SETUP.md` - Captcha setup guide

