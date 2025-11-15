import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
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

export function useFrameworkReady() {
  useEffect(() => {
    const prepare = async () => {
      try {
        if (Platform.OS === 'web') {
          window.frameworkReady?.();
        } else {
          // For native platforms, hide splash screen after a short delay
          // to ensure the app is ready
          await new Promise(resolve => setTimeout(resolve, 100));
          await SplashScreen.hideAsync();
          console.log('✅ Splash screen hidden successfully');
        }
      } catch (error) {
        console.error('❌ Error hiding splash screen:', error);
        // Try to hide splash screen anyway
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.error('❌ Failed to hide splash screen on retry:', e);
        }
      }
    };

    prepare();
  }, []);
}