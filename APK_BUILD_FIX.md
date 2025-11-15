# APK Build Splash Screen Fix

## Problem
The app was getting stuck on the splash screen when built as an APK using `eas build --platform android --profile preview`. This was caused by:

1. **Missing environment variables** - Supabase credentials weren't being passed to the build
2. **Splash screen timing** - Splash screen was hiding before auth initialization completed
3. **No error handling** - Silent failures in production builds

## Solution Applied

### 1. Environment Variable Configuration

#### Option A: Using .env file (Recommended for Development)
1. Create a `.env` file in the root directory:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Add `.env` to `.gitignore` (if not already there)

#### Option B: Using eas.json (Required for EAS Builds)
1. Open `eas.json`
2. Fill in your Supabase credentials in the `env` section for each build profile:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key-here"
      }
    }
  }
}
```

#### Option C: Using EAS Secrets (Most Secure for Production)
```bash
# Set secrets for your EAS project
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key-here"
```

Then remove the `env` section from `eas.json` - EAS will automatically use the secrets.

#### Option D: Using app.json extra config (Fallback)
1. Open `app.json`
2. Fill in the values in the `extra` section:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://your-project.supabase.co",
      "supabaseAnonKey": "your-anon-key-here"
    }
  }
}
```

### 2. Updated Files

- **`lib/supabase.ts`** - Now reads credentials from multiple sources with fallbacks
- **`hooks/useFrameworkReady.ts`** - Returns ready state and exports manual hide function
- **`app/_layout.tsx`** - Hides splash screen after auth initialization completes
- **`eas.json`** - Added environment variable placeholders for all build profiles
- **`app.json`** - Added extra config placeholders for Supabase credentials

### 3. Splash Screen Timing

The splash screen now:
- Stays visible during auth initialization (up to 8 seconds)
- Hides automatically once auth completes
- Has a fallback timeout to prevent infinite loading

## Building the APK

### Step 1: Set Your Credentials
Choose one of the options above (A, B, C, or D) and configure your Supabase credentials.

### Step 2: Build
```bash
# For preview build
eas build --platform android --profile preview

# For production build
eas build --platform android --profile production
```

### Step 3: Test
1. Download and install the APK on your device
2. The app should now:
   - Show splash screen briefly
   - Initialize auth in the background
   - Automatically transition to login/main screen
   - NOT get stuck on splash screen

## Debugging

### Check if credentials are loaded:
Look for console logs in development:
- ✅ "Supabase credentials loaded successfully"
- ❌ "Supabase credentials are missing!"

### Test locally before building:
```bash
# Test with local development build
npx expo run:android --variant release

# Or test with EAS development build
eas build --platform android --profile development
```

### Enable remote debugging for APK:
Add to `app.json`:
```json
{
  "expo": {
    "android": {
      "enableDangerousExperimentalLeanBuilds": false
    }
  }
}
```

Then use `adb logcat` to view logs:
```bash
adb logcat | grep -i "ReactNativeJS\|Supabase\|Splash"
```

## Common Issues

### Issue: Still stuck on splash screen
**Solution**: Check that environment variables are properly set in `eas.json` or as EAS secrets.

### Issue: "Network request failed"
**Solution**: Ensure your Supabase URL is correct and accessible from the device.

### Issue: Splash screen flickers
**Solution**: This is normal - it means the app is working correctly now.

### Issue: Build fails
**Solution**: Make sure all environment variables are strings (wrapped in quotes) in `eas.json`.

## Verification Checklist

Before building:
- [ ] Supabase credentials are configured (choose one method)
- [ ] `.env` is in `.gitignore` (if using .env)
- [ ] Test locally with `npm run android` first
- [ ] Verify auth works in development

After building:
- [ ] APK installs successfully
- [ ] Splash screen shows briefly
- [ ] App transitions to login/main screen
- [ ] Auth functionality works
- [ ] No infinite loading

## Recommended Approach

For the best security and workflow:

1. **Development**: Use `.env` file locally
2. **Preview/Testing**: Use `eas.json` env section with test credentials
3. **Production**: Use EAS Secrets for maximum security

## Additional Notes

- The auth initialization timeout is set to 8 seconds (reduced from 12)
- Splash screen will force-hide after 8 seconds even if auth fails
- All console logs work in development but won't show in production APK
- Use `adb logcat` to debug production builds
