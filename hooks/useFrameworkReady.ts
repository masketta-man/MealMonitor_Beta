import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  // In case splash screen is already hidden or not available
  console.log('Failed to prevent splash screen auto-hide');
});

let splashHidden = false;

export function useFrameworkReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        if (Platform.OS === 'web') {
          window.frameworkReady?.();
          setIsReady(true);
        } else {
          // For native platforms, wait a bit longer to ensure app is ready
          // This gives time for auth initialization
          await new Promise(resolve => setTimeout(resolve, 500));
          setIsReady(true);
        }
      } catch (error) {
        console.error('❌ Error in framework ready:', error);
        setIsReady(true);
      }
    };

    prepare();
  }, []);

  return isReady;
}

// Export a function to manually hide splash screen when app is ready
export async function hideSplashScreen() {
  if (splashHidden) return;
  
  try {
    await SplashScreen.hideAsync();
    splashHidden = true;
    console.log('✅ Splash screen hidden successfully');
  } catch (error) {
    console.error('❌ Error hiding splash screen:', error);
  }
}