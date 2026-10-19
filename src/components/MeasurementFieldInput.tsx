import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { StandardMeasurements } from '../types';
import { MEASUREMENT_GUIDES } from '../data/measurementGuides';
import { compressImageFile } from '../utils/measurementImageStorage';
import { Camera, Upload, RotateCcw, X, ZoomIn, Check } from 'lucide-react';

interface Props {
  fieldKey: keyof StandardMeasurements;
  mainLabelEn: string;
  helperLabelUr: string;
  mainLabelUr: string;
  helperLabelEn: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  customImage?: string;
  onUploadImage?: (field: keyof StandardMeasurements, dataUrl: string) => void;
  onResetImage?: (field: keyof StandardMeasurements) => void;
}

export const MeasurementFieldInput: React.FC<Props> = ({
  fieldKey,
  mainLabelEn,
  helperLabelUr,
  mainLabelUr,
  helperLabelEn,
  value,
  onChange,
  placeholder = '0',
  customImage,
  onUploadImage,
  onResetImage,
}) => {
  const { language, settings, t } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUrdu = language === 'ur';
  const mainLabel = isUrdu ? mainLabelUr : mainLabelEn;
  const helperLabel = isUrdu ? helperLabelEn : helperLabelUr;
  const unitText = isUrdu
    ? (settings.unit === 'cm' ? 'سینٹی میٹر' : 'انچ')
    : (settings.unit === 'cm' ? 'cm' : 'in');

  const guide = MEASUREMENT_GUIDES[fieldKey];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const dataUrl = await compressImageFile(file, 600, 0.85);
      if (onUploadImage) {
        onUploadImage(fieldKey, dataUrl);
      }
    } catch (err) {
      console.error('Failed to process image:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onResetImage) {
      onResetImage(fieldKey);
    }
  };

  return (
    <>
      <div className="bg-white border border-slate-200 focus-within:border-amber-500 rounded-lg p-1.5 sm:p-2 shadow-2xs transition-colors flex items-center gap-2">
        {/* Small Reference Image Thumbnail (Compact ~38x38px) */}
        <div className="relative group shrink-0" title={t('clickToEnlarge')}>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-10 h-10 rounded-md overflow-hidden border border-slate-300 hover:border-amber-500 bg-slate-50 p-0.5 flex items-center justify-center transition-all hover:scale-105 shadow-2xs relative"
          >
            {customImage ? (
              <img
                src={customImage}
                alt={mainLabel}
                className="w-full h-full object-cover rounded"
              />
            ) : guide ? (
              guide.renderSvg('w-full h-full')
            ) : null}

            {/* Hover overlay with zoom/camera */}
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
              <ZoomIn className="w-3.5 h-3.5 text-white drop-shadow" />
            </div>
          </button>

          {/* Indicator Dot if Custom Image is active */}
          {customImage && (
            <span
              className="absolute -top-1 -end-1 w-2.5 h-2.5 bg-amber-500 border-2 border-white rounded-full shadow-xs"
              title={t('customImageBadge')}
            />
          )}
        </div>

        {/* Labels and Input Box */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex items-baseline justify-between gap-1 mb-0.5">
            <span className="text-xs font-black text-slate-900 truncate">
              {mainLabel}
            </span>
            <span className="text-[10px] text-amber-800 font-semibold truncate">
              {helperLabel}
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full text-sm sm:text-base font-mono font-bold text-slate-900 bg-slate-50 border border-slate-300 focus:bg-white focus:border-amber-500 rounded px-2 py-0.5 pe-9 outline-none h-7.5 transition-colors"
            />
            <div className="absolute inset-y-0 end-0 flex items-center pe-2 pointer-events-none text-[10px] font-bold text-slate-500">
              {unitText}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Input for uploading custom reference image */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Enlarged Reference Image & Upload Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden p-4 space-y-3.5"
            onClick={(e) => e.stopPropagation()}
            dir={isUrdu ? 'rtl' : 'ltr'}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-none">
                    {mainLabel}
                  </h3>
                  <span className="text-[11px] font-semibold text-amber-700">
                    {helperLabel}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Large Image Preview */}
            <div className="relative aspect-square w-full max-w-[220px] mx-auto bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center p-2 shadow-inner">
              {customImage ? (
                <img
                  src={customImage}
                  alt={mainLabel}
                  className="w-full h-full object-contain rounded"
                />
              ) : guide ? (
                guide.renderSvg('w-full h-full')
              ) : null}

              {customImage && (
                <div className="absolute top-2 start-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" />
                  <span>{t('customImageBadge')}</span>
                </div>
              )}
            </div>

            {/* Guidance Text (Where and How to measure) */}
            {guide && (
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wide">
                  {t('howToMeasure')}:
                </span>
                <p className="leading-snug">
                  {isUrdu ? guide.guideUr : guide.guideEn}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {isUrdu ? guide.guideEn : guide.guideUr}
                </p>
              </div>
            )}

            {/* Action Buttons: Upload Image from PC & Reset to Default */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {isUploading
                    ? (isUrdu ? 'اپ لوڈ ہو رہا ہے...' : 'Uploading...')
                    : (customImage ? t('changeImage') : t('uploadImage'))}
                </span>
              </button>

              {customImage && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-slate-300"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('resetToDefault')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
