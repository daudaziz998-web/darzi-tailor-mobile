import { Capacitor } from '@capacitor/core';

export interface NativeAppInfo {
  packageName: string;
  versionName: string;
  versionCode: number;
  sdkInt: number;
  deviceModel: string;
}

export interface ClothEstimateResult {
  estimatedMeters: number;
  estimatedGuz: number;
}

// Access custom native Kotlin plugins registered in MainActivity.kt
const getNativeUpdatePlugin = () => {
  if (Capacitor.isNativePlatform()) {
    return (Capacitor as any).Plugins?.NativeUpdate;
  }
  return null;
};

const getNativeTailorPlugin = () => {
  if (Capacitor.isNativePlatform()) {
    return (Capacitor as any).Plugins?.NativeTailor;
  }
  return null;
};

/**
 * Check if running inside the native Android Kotlin app
 */
export const isNativeAndroidApp = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

/**
 * Retrieve Android native app version and device details
 */
export const getAndroidAppInfo = async (): Promise<NativeAppInfo | null> => {
  const plugin = getNativeUpdatePlugin();
  if (!plugin) return null;
  try {
    return await plugin.getNativeAppInfo();
  } catch (err) {
    console.warn('[NativeBridge] getNativeAppInfo failed:', err);
    return null;
  }
};

/**
 * Check if the app has permission to install unknown apps (Android 8+)
 */
export const checkUnknownAppInstallPermission = async (): Promise<boolean> => {
  const plugin = getNativeUpdatePlugin();
  if (!plugin) return true;
  try {
    const res = await plugin.canInstallUnknownApps();
    return Boolean(res?.canInstall);
  } catch (err) {
    console.warn('[NativeBridge] canInstallUnknownApps check failed:', err);
    return true;
  }
};

/**
 * Open Android system settings to grant unknown sources install permission
 */
export const requestUnknownAppInstallPermission = async (): Promise<void> => {
  const plugin = getNativeUpdatePlugin();
  if (!plugin) return;
  try {
    await plugin.openInstallPermissionSettings();
  } catch (err) {
    console.warn('[NativeBridge] openInstallPermissionSettings failed:', err);
  }
};

/**
 * Trigger native Android APK download and auto-install via Android DownloadManager & FileProvider
 */
export const nativeDownloadAndInstallApk = async (
  url: string,
  fileName: string
): Promise<{ success: boolean; enqueued?: boolean }> => {
  const plugin = getNativeUpdatePlugin();
  if (plugin) {
    try {
      const res = await plugin.downloadAndInstallApk({ url, fileName });
      return { success: true, enqueued: res?.status === 'enqueued' };
    } catch (err) {
      console.warn('[NativeBridge] native downloadAndInstallApk failed, falling back to web flow:', err);
    }
  }
  return { success: false };
};

/**
 * Trigger native Android Share Sheet to share customer measurement slips
 */
export const shareReceiptNative = async (title: string, text: string): Promise<boolean> => {
  const plugin = getNativeTailorPlugin();
  if (plugin) {
    try {
      await plugin.shareReceiptText({ title, text });
      return true;
    } catch (err) {
      console.warn('[NativeBridge] Native share failed:', err);
    }
  }

  // Web Share API fallback
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text });
      return true;
    } catch {
      // Ignore user cancellation
    }
  }

  return false;
};

/**
 * Trigger native Android haptic feedback
 */
export const triggerNativeHaptic = async (type: 'light' | 'click' | 'heavy' = 'light'): Promise<void> => {
  const plugin = getNativeTailorPlugin();
  if (plugin) {
    try {
      await plugin.triggerHapticFeedback({ type });
      return;
    } catch {
      // Safe fallback
    }
  }

  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(type === 'heavy' ? 40 : 15);
    } catch {
      // Safe fallback
    }
  }
};
