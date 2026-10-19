import React, { useState, useRef } from 'react';
import { CustomMeasurementDefinition, Language } from '../types';
import { compressImageFile } from '../utils/measurementImageStorage';
import { TranslationKey } from '../translations';
import {
  Ruler,
  Upload,
  RotateCcw,
  X,
  ZoomIn,
  ImageIcon,
} from 'lucide-react';

interface Props {
  definition: CustomMeasurementDefinition;
  value: string;
  onChange: (val: string) => void;
  onUpdateDefinitionImage?: (def: CustomMeasurementDefinition, newImage: string) => void;
  language: Language;
  t: (key: TranslationKey) => string;
}

export const CustomMeasurementFieldCard: React.FC<Props> = ({
  definition,
  value,
  onChange,
  onUpdateDefinitionImage,
  language,
  t,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUrdu = language === 'ur';
  const mainLabel = isUrdu ? (definition.nameUr || definition.name) : definition.name;
  const helperLabel = isUrdu ? definition.name : (definition.nameUr || '');
  const unitText = definition.unit === 'CM' 
    ? (isUrdu ? 'سینٹی میٹر' : 'cm') 
    : (isUrdu ? 'انچ' : 'in');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const dataUrl = await compressImageFile(file, 600, 0.85);
      if (onUpdateDefinitionImage) {
        onUpdateDefinitionImage(definition, dataUrl);
      }
    } catch (err) {
      console.error('Failed to compress image:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateDefinitionImage) {
      onUpdateDefinitionImage(definition, '');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
            {definition.image ? (
              <img
                src={definition.image}
                alt={mainLabel}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="w-full h-full rounded bg-amber-50 text-amber-600 flex items-center justify-center">
                <Ruler className="w-4 h-4" />
              </div>
            )}

            {/* Hover overlay with zoom */}
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
              <ZoomIn className="w-3.5 h-3.5 text-white drop-shadow" />
            </div>
          </button>

          {/* Indicator Dot if Custom Image is active */}
          {definition.image && (
            <span
              className="absolute -top-1 -end-1 w-2.5 h-2.5 bg-amber-500 border-2 border-white rounded-full shadow-xs"
              title={isUrdu ? 'رہنمائی تصویر موجود ہے' : 'Custom reference image'}
            />
          )}
        </div>

        {/* Labels and Input Box */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex items-baseline justify-between gap-1 mb-0.5">
            <span className="text-xs font-black text-slate-900 truncate">
              {mainLabel}
            </span>
            {helperLabel && (
              <span className="text-[10px] text-amber-800 font-semibold truncate">
                {helperLabel}
              </span>
            )}
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="0"
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
            className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-sm w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-3 py-2 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="font-bold text-xs">{mainLabel}</div>
                {helperLabel && (
                  <div className="text-[10px] text-amber-400 font-medium">
                    {helperLabel}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image Preview */}
            <div className="p-3 bg-slate-950 flex items-center justify-center min-h-[160px] max-h-[260px] overflow-hidden">
              {definition.image ? (
                <img
                  src={definition.image}
                  alt={mainLabel}
                  className="max-h-[240px] w-auto object-contain rounded"
                />
              ) : (
                <div className="text-center py-6 space-y-2 text-slate-400">
                  <ImageIcon className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-xs">
                    {isUrdu
                      ? 'کوئی رہنمائی تصویر موجود نہیں'
                      : 'No reference image uploaded'}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons: Upload Image & Reset to Default */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold rounded text-xs shadow-xs transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Uploading...' : t('uploadImageBtn')}</span>
              </button>

              {definition.image && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-slate-600 hover:text-rose-600 text-xs font-semibold hover:bg-slate-200/60 rounded transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('resetDefaultBtn')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold rounded"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
