import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { ArrowRight, ArrowLeft, X, User, Phone, MapPin, FileText } from 'lucide-react';

interface Props {
  customerToEdit?: Customer | null;
  onClose: () => void;
}

export const AddCustomerModal: React.FC<Props> = ({ customerToEdit, onClose }) => {
  const { addCustomer, updateCustomer, setScreen, language, t } = useApp();

  const isEditing = !!customerToEdit;
  const isRtl = language === 'ur';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [name, setName] = useState(customerToEdit?.name || '');
  const [phone, setPhone] = useState(customerToEdit?.phone || '');
  const [address, setAddress] = useState(customerToEdit?.address || '');
  const [notes, setNotes] = useState(customerToEdit?.notes || '');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      setErrorMessage(t('namePhoneRequired'));
      return;
    }

    if (isEditing && customerToEdit) {
      await updateCustomer({
        ...customerToEdit,
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim(),
      });
      onClose();
    } else {
      const newCustomer = await addCustomer({
        name,
        phone,
        address,
        notes,
      });

      onClose();
      // Automatically open Measurement Screen for this newly created customer!
      setScreen('measurement', newCustomer.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-300 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold">
              {isEditing ? t('editCustomerTitle') : t('addCustomerTitle')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form (Compact) */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3">
          {errorMessage && (
            <div className="p-2 bg-rose-50 border border-rose-300 rounded text-rose-800 text-xs font-bold">
              {errorMessage}
            </div>
          )}

          {/* Customer Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              {t('customerName')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder={t('customerNamePlaceholder')}
              className="w-full text-sm font-semibold px-3 py-1.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded outline-none h-9"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              {t('phoneNumber')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder={t('phoneNumberPlaceholder')}
              className="w-full text-sm font-mono font-bold px-3 py-1.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded outline-none h-9"
            />
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              {t('address')}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('addressPlaceholder')}
              className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded outline-none h-8"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              {t('notes')}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notesPlaceholder')}
              className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded outline-none h-8"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-sm font-black rounded-lg shadow-xs transition-colors"
            >
              <span>{isEditing ? t('saveCustomer') : t('nextStep')}</span>
              {!isEditing && <ArrowIcon className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
