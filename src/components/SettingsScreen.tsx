import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Save, 
  RotateCcw, 
  Store, 
  Phone, 
  MapPin, 
  Ruler, 
  Printer, 
  Download, 
  Upload, 
  ShieldCheck, 
  Check, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileDown, 
  Lock 
} from 'lucide-react';
import { Language, MeasurementUnit, ThermalWidth } from '../types';
import { 
  CURRENT_APP_VERSION, 
  UpdateInfo, 
  checkForAppUpdate, 
  formatBytes, 
  startApkDownload 
} from '../utils/updateChecker';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, resetToSampleData, exportBackup, restoreBackup, language, t } = useApp();

  const [shopNameEn, setShopNameEn] = useState(settings.shopNameEn);
  const [shopNameUr, setShopNameUr] = useState(settings.shopNameUr);
  const [location, setLocation] = useState(settings.location);
  const [phone, setPhone] = useState(settings.phone);
  const [currency, setCurrency] = useState(settings.currency);
  const [unit, setUnit] = useState<MeasurementUnit>(settings.unit);
  const [appLang, setAppLang] = useState<Language>(settings.language);
  const [thermalWidth, setThermalWidth] = useState<ThermalWidth>(settings.thermalWidth || '80mm');

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  // Auto-Update States
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadCompleted, setDownloadCompleted] = useState(false);

  const handleCheckForUpdates = async () => {
    setIsCheckingUpdate(true);
    setUpdateInfo(null);
    setDownloadCompleted(false);
    setDownloadProgress(0);
    try {
      const result = await checkForAppUpdate();
      setUpdateInfo(result);
    } catch (err) {
      console.error('[AutoUpdate] Check error:', err);
      setUpdateInfo({
        hasUpdate: false,
        currentVersion: CURRENT_APP_VERSION,
        message: 'You are using the latest version.',
      });
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleDownloadUpdate = async () => {
    if (!updateInfo?.apkUrl) return;
    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      await startApkDownload(
        updateInfo.apkUrl,
        updateInfo.apkName || `darzi-update-${updateInfo.latestVersion || 'latest'}.apk`,
        (pct) => setDownloadProgress(pct)
      );
      setDownloadCompleted(true);
    } catch (err) {
      console.error('[AutoUpdate] Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      shopNameEn,
      shopNameUr,
      location,
      phone,
      currency,
      unit,
      language: appLang,
      thermalWidth,
    });
  };

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      await exportBackup();
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(t('restoreConfirm'))) {
      if (restoreInputRef.current) restoreInputRef.current.value = '';
      return;
    }

    try {
      setIsRestoring(true);
      const text = await file.text();
      await restoreBackup(text);
    } finally {
      setIsRestoring(false);
      if (restoreInputRef.current) restoreInputRef.current.value = '';
    }
  };

  const handleReset = async () => {
    if (window.confirm(t('resetConfirm'))) {
      await resetToSampleData();
      setShopNameEn('Awais Tailor House');
      setShopNameUr('اویس ٹیلر ہاؤس');
      setLocation('Talash, Shamshi Khan');
      setPhone('0300-1234567');
      setCurrency('Rs.');
      setUnit('inches');
      setAppLang('en');
      setThermalWidth('80mm');
    }
  };

  return (
    <div className="space-y-3 pb-8 max-w-3xl mx-auto">
      {/* Settings Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
            {t('settingsHeader')}
          </h1>
          <p className="text-xs text-slate-500">
            {settings.shopNameEn} · {settings.location}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-3 text-xs">
        {/* Shop Info Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-1.5 flex items-center gap-1.5 text-slate-800 font-bold">
            <Store className="w-4 h-4 text-amber-500" />
            <span>Shop Information & Contacts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('shopNameLabel')}</label>
              <input
                type="text"
                required
                value={shopNameEn}
                onChange={(e) => setShopNameEn(e.target.value)}
                placeholder="Awais Tailor House"
                className="w-full text-xs font-bold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded outline-none h-8"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('shopNameUrLabel')}</label>
              <input
                type="text"
                value={shopNameUr}
                onChange={(e) => setShopNameUr(e.target.value)}
                placeholder="اویس ٹیلر ہاؤس"
                className="w-full text-xs font-bold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded outline-none h-8 font-sans"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('shopLocationLabel')}</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Talash, Shamshi Khan"
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded outline-none h-8 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t('shopPhoneLabel')} <span className="text-amber-600 font-normal">(Editable)</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300-1234567"
                className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded outline-none h-8"
              />
            </div>
          </div>
        </div>

        {/* Preferences & Printer Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-1.5 flex items-center gap-1.5 text-slate-800 font-bold">
            <Printer className="w-4 h-4 text-amber-500" />
            <span>Printer & Measurement Preferences</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('thermalWidthLabel')}</label>
              <select
                value={thermalWidth}
                onChange={(e) => setThermalWidth(e.target.value as ThermalWidth)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded outline-none h-8 font-bold"
              >
                <option value="80mm">80mm (Standard POS)</option>
                <option value="58mm">58mm (Mini Receipt)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('currencyLabel')}</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="Rs."
                className="w-full font-mono font-black px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded outline-none h-8"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('measurementUnitLabel')}</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as MeasurementUnit)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded outline-none h-8 font-bold"
              >
                <option value="inches">Inches (انچ)</option>
                <option value="cm">Centimeters (cm)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('defaultLanguageLabel')}</label>
              <select
                value={appLang}
                onChange={(e) => setAppLang(e.target.value as Language)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded outline-none h-8 font-bold"
              >
                <option value="en">English</option>
                <option value="ur">اردو (Urdu)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Auto Update Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{language === 'ur' ? 'خودکار سافٹ ویئر اپ ڈیٹ' : 'Auto Update'}</span>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              v{CURRENT_APP_VERSION}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <div className="font-bold text-slate-900 text-xs">
                  {language === 'ur' ? 'موجودہ ایپ ورژن: ' : 'Installed App Version: '}
                  <span className="font-mono text-amber-700 font-black">v{CURRENT_APP_VERSION}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {language === 'ur'
                    ? 'نئے فیچرز، سیکیورٹی اور کٹنگ فارم کی اپ ڈیٹس خودکار طور پر چیک کریں۔'
                    : 'Check for new features, security enhancements, and tailoring slip updates.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCheckForUpdates}
                disabled={isCheckingUpdate || isDownloading}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-98 text-amber-400 font-bold rounded-lg text-xs transition-all shadow-2xs shrink-0 disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                <span>
                  {isCheckingUpdate
                    ? (language === 'ur' ? 'چیک ہو رہا ہے...' : 'Checking...')
                    : (language === 'ur' ? 'تازہ ترین ورژن چیک کریں' : 'Check for Updates')}
                </span>
              </button>
            </div>

            {/* When checked and no update is available */}
            {updateInfo && !updateInfo.hasUpdate && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {language === 'ur' ? 'آپ تازہ ترین ورژن استعمال کر رہے ہیں۔' : 'You are using the latest version.'}
                </span>
              </div>
            )}

            {/* When update is available */}
            {updateInfo && updateInfo.hasUpdate && (
              <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono font-black text-xs">
                      {updateInfo.latestVersion}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">
                      {updateInfo.releaseTitle || (language === 'ur' ? 'نیا ورژن دستیاب ہے' : 'New Update Available')}
                    </span>
                  </div>
                  {updateInfo.apkSize ? (
                    <span className="text-[11px] font-mono text-slate-600 font-bold">
                      {formatBytes(updateInfo.apkSize)}
                    </span>
                  ) : null}
                </div>

                {updateInfo.releaseNotes && (
                  <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded border border-slate-200 max-h-32 overflow-y-auto whitespace-pre-line leading-relaxed">
                    <div className="font-bold text-[10px] uppercase text-slate-400 mb-1">
                      {language === 'ur' ? 'ورژن تفصیلات:' : 'Release Notes:'}
                    </div>
                    {updateInfo.releaseNotes}
                  </div>
                )}

                {/* Progress bar during download */}
                {isDownloading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-700">
                      <span>{language === 'ur' ? 'ڈاؤن لوڈ ہو رہا ہے...' : 'Downloading update...'}</span>
                      <span className="font-mono">{downloadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-200"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Download / Install Action */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadUpdate}
                    disabled={isDownloading}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>
                      {isDownloading
                        ? (language === 'ur' ? 'ڈاؤن لوڈ ہو رہا ہے...' : 'Downloading...')
                        : (language === 'ur' ? 'اپ ڈیٹ ڈاؤن لوڈ کریں' : 'Download Update')}
                    </span>
                  </button>

                  {downloadCompleted && (
                    <p className="text-[11px] text-emerald-800 font-semibold leading-tight">
                      {language === 'ur'
                        ? 'ڈاؤن لوڈ مکمل! فائل پر ٹیپ کر کے انسٹال کریں۔'
                        : 'Download initiated! Tap the downloaded APK to install.'}
                    </p>
                  )}
                </div>

                <div className="text-[10px] text-slate-500 leading-normal pt-1 border-t border-amber-200/80">
                  {language === 'ur'
                    ? 'اینڈرائیڈ پر نیا ورژن انسٹال کرنے پر گاہکوں اور ناپوں کا تمام سابقہ ریکارڈ محفوظ رہتا ہے۔'
                    : 'Installing updates preserves all customer records, measurements, and existing settings.'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* License Status Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>{language === 'ur' ? 'سافٹ ویئر لائسنس اسٹیٹس' : 'Software License Status'}</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{language === 'ur' ? 'فعال ہے (Active)' : 'Active'}</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-1">
            <span>Swati Software Solution · Licensed Product</span>
            <span className="font-mono text-slate-400">ID: SW-TLR-100</span>
          </div>
        </div>

        {/* Backup & Restore Data Card (Permanent Database Backup & Restore) */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-1.5 flex items-center gap-1.5 text-slate-800 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{language === 'ur' ? 'ڈیٹا بیک اپ اور بحالی' : 'Backup & Restore Data'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Backup Data */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 flex flex-col justify-between">
              <div>
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('backupData')}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  {t('backupDesc')}
                </p>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleBackup}
                  disabled={isBackingUp}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isBackingUp ? (language === 'ur' ? 'بیک اپ ہو رہا ہے...' : 'Creating Backup...') : t('backupData')}</span>
                </button>
              </div>
            </div>

            {/* Restore Data */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 flex flex-col justify-between">
              <div>
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('restoreData')}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  {t('restoreDesc')}
                </p>
              </div>
              <div className="mt-3">
                <input
                  type="file"
                  ref={restoreInputRef}
                  onChange={handleRestoreFileSelected}
                  accept=".json,application/json"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => restoreInputRef.current?.click()}
                  disabled={isRestoring}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5 text-white" />
                  <span>{isRestoring ? (language === 'ur' ? 'ڈیٹا بحال ہو رہا ہے...' : 'Restoring Data...') : t('restoreData')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('resetSampleData')}</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-sm font-black rounded-lg shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{t('saveSettingsBtn')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
