import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PriceItem } from '../types';
import { Tag, Plus, Edit3, Trash2, X } from 'lucide-react';

export const PriceManagement: React.FC = () => {
  const { prices, addPriceItem, updatePriceItem, deletePriceItem, settings, language, t } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceItem | null>(null);

  const [nameEn, setNameEn] = useState('');
  const [nameUr, setNameUr] = useState('');
  const [price, setPrice] = useState<string>('1500');
  const [category, setCategory] = useState<'men' | 'women' | 'general'>('men');
  const [errorMessage, setErrorMessage] = useState('');

  const handleOpenAdd = () => {
    setEditingItem(null);
    setNameEn('');
    setNameUr('');
    setPrice('1500');
    setCategory('men');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PriceItem) => {
    setEditingItem(item);
    setNameEn(item.nameEn);
    setNameUr(item.nameUr);
    setPrice(item.defaultPrice.toString());
    setCategory(item.category);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() && !nameUr.trim()) {
      setErrorMessage(language === 'ur' ? 'آئٹم کا نام درج کریں' : 'Please provide item name');
      return;
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setErrorMessage(language === 'ur' ? 'درست قیمت درج کریں' : 'Please enter a valid price');
      return;
    }

    if (editingItem) {
      await updatePriceItem({
        ...editingItem,
        nameEn: nameEn.trim() || nameUr.trim(),
        nameUr: nameUr.trim() || nameEn.trim(),
        defaultPrice: priceNum,
        category,
      });
    } else {
      await addPriceItem({
        nameEn: nameEn.trim() || nameUr.trim(),
        nameUr: nameUr.trim() || nameEn.trim(),
        defaultPrice: priceNum,
        category,
      });
    }

    handleCloseModal();
  };

  const handleDelete = async (item: PriceItem) => {
    if (window.confirm(t('deletePriceConfirm'))) {
      await deletePriceItem(item.id);
    }
  };

  return (
    <div className="space-y-3 pb-8">
      {/* Top Bar with Add Price Action */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
            {t('priceManagementHeader')}
          </h1>
          <p className="text-xs text-slate-500">
            {settings.shopNameEn} · Rates automatically auto-fill in orders
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-sm font-bold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addNewPriceBtn')}</span>
        </button>
      </div>

      {/* Compact Cards Grid for Prices */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {prices.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded">
                  {item.category === 'men' ? "Men's" : item.category === 'women' ? "Women's" : 'General'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                    title={t('editBtn')}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="p-1 text-rose-400 hover:text-rose-700"
                    title={t('deleteBtn')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-2">
                <div className="text-sm font-black text-slate-900 leading-tight">
                  {language === 'ur' ? item.nameUr : item.nameEn}
                </div>
                <div className="text-[11px] text-slate-400">
                  {language === 'ur' ? item.nameEn : item.nameUr}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-baseline justify-between font-mono">
              <span className="text-[10px] text-slate-400 uppercase font-sans">Rate</span>
              <div className="text-base sm:text-lg font-black text-emerald-800">
                {settings.currency} {item.defaultPrice.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Price Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-300 w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>{editingItem ? t('editPriceTitle') : t('addPriceTitle')}</span>
              </div>
              <button type="button" onClick={handleCloseModal} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
              {errorMessage && (
                <div className="p-2 bg-rose-50 border border-rose-300 rounded text-rose-800 font-bold">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">{t('itemNameUr')}</label>
                <input
                  type="text"
                  value={nameUr}
                  onChange={(e) => setNameUr(e.target.value)}
                  placeholder="مثلاً: شلوار قمیض"
                  className="w-full text-sm font-bold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded outline-none h-8"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">{t('itemNameEn')}</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Shalwar Kameez"
                  className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded outline-none h-8"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {t('stitchingPrice')} ({settings.currency})
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full text-lg font-mono font-black px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded outline-none h-9"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">{t('category')}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded outline-none h-8 font-semibold"
                >
                  <option value="men">{t('categoryMen')}</option>
                  <option value="women">{t('categoryWomen')}</option>
                  <option value="general">{t('categoryGeneral')}</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-3 py-1.5 text-slate-600 font-bold rounded"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded shadow-xs"
                >
                  {t('savePriceBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
