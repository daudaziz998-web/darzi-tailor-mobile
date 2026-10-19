import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CustomMeasurementDefinition } from '../types';
import { compressImageFile } from '../utils/measurementImageStorage';
import {
  Ruler,
  Plus,
  Edit,
  Trash2,
  Upload,
  RotateCcw,
  X,
  Check,
  ZoomIn,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
} from 'lucide-react';

export const CustomMeasurementsScreen: React.FC = () => {
  const {
    customMeasurementDefinitions,
    addCustomMeasurementDefinition,
    updateCustomMeasurementDefinition,
    deleteCustomMeasurementDefinition,
    setScreen,
    language,
    t,
  } = useApp();

  const isUrdu = language === 'ur';

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomMeasurementDefinition | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [nameUr, setNameUr] = useState('');
  const [unit, setUnit] = useState<'Inches' | 'CM'>('Inches');
  const [image, setImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Image Zoom Modal state
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setNameUr('');
    setUnit('Inches');
    setImage('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CustomMeasurementDefinition) => {
    setEditingItem(item);
    setName(item.name);
    setNameUr(item.nameUr || '');
    setUnit(item.unit || 'Inches');
    setImage(item.image || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormError('');
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const dataUrl = await compressImageFile(file, 600, 0.85);
      setImage(dataUrl);
    } catch (err) {
      console.error('Failed to compress image:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResetImage = () => {
    setImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError(
        isUrdu ? 'برائے مہربانی ناپ کا نام درج کریں' : 'Please provide a measurement name'
      );
      return;
    }

    if (editingItem) {
      await updateCustomMeasurementDefinition({
        ...editingItem,
        name: name.trim(),
        nameUr: nameUr.trim(),
        unit,
        image,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await addCustomMeasurementDefinition({
        name: name.trim(),
        nameUr: nameUr.trim(),
        unit,
        image,
      });
    }

    handleCloseModal();
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      await deleteCustomMeasurementDefinition(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setScreen('dashboard')}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title={t('backToDashboard')}
            >
              {isUrdu ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            </button>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                {t('customMeasurementsTitle')}
              </h1>
              <p className="text-xs text-slate-500 leading-tight">
                {t('customMeasurementsSubtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold rounded-lg text-xs sm:text-sm shadow-xs transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addCustomMeasurementBtn')}</span>
          </button>
        </div>
      </div>

      {/* Main Measurements Table / Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {customMeasurementDefinitions.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              <Ruler className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-700">
              {t('noCustomMeasurementsDefined')}
            </div>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-md text-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addCustomMeasurementBtn')}</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-2 px-3 sm:px-4 py-2 bg-slate-50 text-[11px] font-black uppercase text-slate-500 tracking-wider">
              <div className="col-span-2 sm:col-span-1 text-center">
                {isUrdu ? 'تصویر' : 'Image'}
              </div>
              <div className="col-span-4 sm:col-span-4">
                {isUrdu ? 'ناپ کا نام (انگریزی)' : 'Measurement Name'}
              </div>
              <div className="col-span-3 sm:col-span-3">
                {isUrdu ? 'اردو نام' : 'Urdu Name'}
              </div>
              <div className="col-span-1 sm:col-span-2 text-center">
                {isUrdu ? 'اکائی' : 'Unit'}
              </div>
              <div className="col-span-2 sm:col-span-2 text-end">
                {isUrdu ? 'اقدامات' : 'Actions'}
              </div>
            </div>

            {/* Rows */}
            {customMeasurementDefinitions.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 px-3 sm:px-4 py-2.5 items-center hover:bg-slate-50/80 transition-colors"
              >
                {/* Reference Image Thumbnail */}
                <div className="col-span-2 sm:col-span-1 flex justify-center">
                  {item.image ? (
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewImage({
                          src: item.image!,
                          title: item.name,
                        })
                      }
                      className="w-9 h-9 rounded-md overflow-hidden border border-slate-300 hover:border-amber-500 bg-slate-100 p-0.5 relative group shadow-2xs"
                      title={t('clickToEnlarge')}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                        <ZoomIn className="w-3 h-3 text-white drop-shadow" />
                      </div>
                    </button>
                  ) : (
                    <div className="w-9 h-9 rounded-md bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="col-span-4 sm:col-span-4 min-w-0">
                  <div className="text-xs sm:text-sm font-black text-slate-900 truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    ID: {item.id}
                  </div>
                </div>

                {/* Urdu Name */}
                <div className="col-span-3 sm:col-span-3 min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-amber-800 font-sans truncate">
                    {item.nameUr || '—'}
                  </div>
                </div>

                {/* Unit */}
                <div className="col-span-1 sm:col-span-2 text-center">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {item.unit === 'CM' ? (isUrdu ? 'سینٹی میٹر' : 'CM') : (isUrdu ? 'انچ' : 'Inches')}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                    title={t('editCustomMeasurementBtn')}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(item.id)}
                    className="p-1.5 rounded-md hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors"
                    title={t('deleteCustomMeasurementBtn')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Custom Measurement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold tracking-tight">
                  {editingItem ? t('editCustomMeasurementBtn') : t('addCustomMeasurementBtn')}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
              {formError && (
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Measurement Name (English) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {t('measurementNameLabel')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder={t('measurementNamePlaceholder')}
                  className="w-full text-xs sm:text-sm font-bold px-3 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-amber-500 rounded-lg outline-none transition-colors"
                />
              </div>

              {/* Urdu Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {t('urduNameLabel')}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={nameUr}
                  onChange={(e) => setNameUr(e.target.value)}
                  placeholder={t('urduNamePlaceholder')}
                  className="w-full text-xs sm:text-sm font-bold px-3 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-amber-500 rounded-lg outline-none text-right transition-colors"
                />
              </div>

              {/* Unit: Inches / CM */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {t('unitLabel')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUnit('Inches')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors ${
                      unit === 'Inches'
                        ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Inches ({isUrdu ? 'انچ' : 'in'})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('CM')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors ${
                      unit === 'CM'
                        ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    CM ({isUrdu ? 'سینٹی میٹر' : 'cm'})
                  </button>
                </div>
              </div>

              {/* Optional Reference Image */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">
                  {t('referenceImageLabel')}
                </label>

                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-md overflow-hidden border border-slate-300 bg-white flex items-center justify-center shrink-0">
                    {image ? (
                      <img
                        src={image}
                        alt="Reference"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded text-xs transition-colors shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-600" />
                        <span>{isUploading ? 'Uploading...' : t('uploadImageBtn')}</span>
                      </button>

                      {image && (
                        <button
                          type="button"
                          onClick={handleResetImage}
                          className="flex items-center gap-1 px-2 py-1 text-slate-500 hover:text-rose-600 text-xs font-semibold transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{t('resetDefaultBtn')}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {isUrdu
                        ? 'اپنے کمپیوٹر سے رہنمائی تصویر منتخب کریں'
                        : 'Select a guide image from your computer (auto-compressed)'}
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('saveCustomMeasurementBtn')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-4 space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-sm font-black text-slate-900">
                {t('deleteCustomMeasurementBtn')}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('deleteCustomMeasurementConfirm')}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                {t('deleteBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-xl overflow-hidden max-w-lg w-full shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="font-bold text-xs truncate">{previewImage.title}</div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={previewImage.src}
                alt={previewImage.title}
                className="max-h-[65vh] w-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
