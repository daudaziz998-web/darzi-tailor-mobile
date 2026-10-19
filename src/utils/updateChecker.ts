/**
 * Auto-Update Manager using GitHub Releases
 * 
 * IMPORTANT: GitHub URLs and internal endpoints are kept strictly internal
 * and are never displayed in the app's user interface.
 */

export const CURRENT_APP_VERSION = '1.0.0';

// Internal GitHub configuration - NEVER rendered in UI
const GITHUB_OWNER = 'daudaziz998-web';
const GITHUB_REPO = 'darzi-tailor-mobile';
const RELEASES_API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;

export interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion?: string;
  releaseTitle?: string;
  releaseNotes?: string;
  apkUrl?: string;
  apkName?: string;
  apkSize?: number;
  publishedAt?: string;
  message: string;
}

/**
 * Compare two semver strings (e.g. 'v1.0.1' and '1.0.0').
 * Returns:
 *   1 if v1 > v2 (v1 is newer)
 *  -1 if v1 < v2 (v2 is newer)
 *   0 if equal
 */
export function compareSemver(v1: string, v2: string): number {
  const clean1 = (v1 || '').trim().replace(/^[vV]/, '').split('-')[0];
  const clean2 = (v2 || '').trim().replace(/^[vV]/, '').split('-')[0];

  const p1 = clean1.split('.').map((n) => parseInt(n, 10) || 0);
  const p2 = clean2.split('.').map((n) => parseInt(n, 10) || 0);

  const len = Math.max(p1.length, p2.length);
  for (let i = 0; i < len; i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

/**
 * Check GitHub Releases for updates.
 * Safe fallback: If inaccessible, private, network error, or no APK,
 * returns { hasUpdate: false, message: 'You are using the latest version.' }
 * and logs real error internally for debugging.
 */
export async function checkForAppUpdate(): Promise<UpdateInfo> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(RELEASES_API, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[AutoUpdate] GitHub API returned status ${res.status}`);
      return {
        hasUpdate: false,
        currentVersion: CURRENT_APP_VERSION,
        message: 'You are using the latest version.',
      };
    }

    const data = await res.json();
    const tagName = typeof data.tag_name === 'string' ? data.tag_name : '';
    if (!tagName) {
      return {
        hasUpdate: false,
        currentVersion: CURRENT_APP_VERSION,
        message: 'You are using the latest version.',
      };
    }

    // Find compatible APK asset attached to release
    const assets = Array.isArray(data.assets) ? data.assets : [];
    const apkAsset = assets.find(
      (a: any) =>
        typeof a.name === 'string' &&
        a.name.toLowerCase().endsWith('.apk') &&
        Boolean(a.browser_download_url)
    );

    // If no APK asset is present in the release, don't update
    if (!apkAsset) {
      console.warn('[AutoUpdate] Release found without compatible APK asset.');
      return {
        hasUpdate: false,
        currentVersion: CURRENT_APP_VERSION,
        latestVersion: tagName,
        message: 'You are using the latest version.',
      };
    }

    const isNewer = compareSemver(tagName, CURRENT_APP_VERSION) > 0;

    if (isNewer) {
      return {
        hasUpdate: true,
        currentVersion: CURRENT_APP_VERSION,
        latestVersion: tagName,
        releaseTitle: data.name || tagName,
        releaseNotes: data.body || '',
        apkUrl: apkAsset.browser_download_url,
        apkName: apkAsset.name || `app-update-${tagName}.apk`,
        apkSize: apkAsset.size || 0,
        publishedAt: data.published_at || '',
        message: 'A newer version is available.',
      };
    }

    return {
      hasUpdate: false,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion: tagName,
      message: 'You are using the latest version.',
    };
  } catch (err) {
    // Internal logging without exposing URLs in the UI
    console.error('[AutoUpdate] Update check failed:', err);
    return {
      hasUpdate: false,
      currentVersion: CURRENT_APP_VERSION,
      message: 'You are using the latest version.',
    };
  }
}

/**
 * Format bytes into human-readable size
 */
export function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

import { nativeDownloadAndInstallApk } from './nativeBridge';

/**
 * Trigger Android download and installation flow
 */
export async function startApkDownload(
  apkUrl: string,
  apkName: string,
  onProgress?: (pct: number) => void
): Promise<void> {
  if (onProgress) {
    onProgress(15);
  }

  // Attempt native Android Kotlin DownloadManager & FileProvider flow
  const nativeResult = await nativeDownloadAndInstallApk(apkUrl, apkName);
  if (nativeResult.success) {
    if (onProgress) {
      onProgress(100);
    }
    return;
  }

  // Fallback for web browser / PWA environment
  if (onProgress) {
    onProgress(40);
    await new Promise((r) => setTimeout(r, 250));
    onProgress(75);
    await new Promise((r) => setTimeout(r, 250));
    onProgress(100);
  }

  const a = document.createElement('a');
  a.href = apkUrl;
  a.download = apkName;
  a.target = '_system';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
  }, 1000);
}
