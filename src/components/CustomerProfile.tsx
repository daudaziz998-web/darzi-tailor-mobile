import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Customer, MeasurementRecord, OrderPaymentRecord } from '../types';
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Ruler, 
  CreditCard, 
  Plus, 
  Printer, 
  Trash2, 
  Edit3, 
  ArrowLeft,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { AddCustomerModal } from './AddCustomerModal';

export const CustomerProfile: React.FC = () => {
  const { 
    customers, 
    selectedCustomerId, 
    measurements, 
    payments, 
    settings, 
    setScreen, 
    deleteMeasurementRecord, 
    openPrintModal,
    customMeasurementDefinitions,
    language, 
    t 
  } = useApp();

  const isRtl = language === 'ur';
  const ArrowIcon = isRtl ? ArrowRight : ArrowLeft;

  const [activeTab, setActiveTab] = useState<'measurements' | 'orders' | 'payments'>('measurements');
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);

  const customer: Customer | undefined = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  if (!customer) {
    return (
      <div className="bg-white border border-slate-300 rounded-xl p-8 text-center text-xs">
        <User className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <div className="font-bold text-slate-800">
          {language === 'ur' ? 'گاہک نہیں ملا' : 'Customer Not Found'}
        </div>
        <button
          type="button"
          onClick={() => setScreen('customers')}
          className="mt-3 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded"
        >
          {t('backToCustomers')}
        </button>
      </div>
    );
  }

  const customerMeasurements: MeasurementRecord[] = measurements.filter(
    (m) => m.customerId === customer.id
  );

  const customerPayments: OrderPaymentRecord[] = payments.filter(
    (p) => p.customerId === customer.id
  );

  const totalBilled = customerPayments.reduce((sum, p) => sum + (Number(p.totalPrice) || 0), 0);
  const totalPaid = customerPayments.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
  const totalPending = customerPayments.reduce((sum, p) => sum + (Number(p.remainingAmount) || 0), 0);

  const handleDeleteRecord = async (recordId: string) => {
    if (window.confirm(language === 'ur' ? 'کیا آپ واقعی یہ ناپ حذف کرنا چاہتے ہیں؟' : 'Delete this measurement record permanently?')) {
      await deleteMeasurementRecord(recordId);
    }
  };

  return (
    <div className="space-y-3 pb-8">
      {/* Top Bar Navigation - Responsive for mobile screens */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setScreen('customers')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:border-slate-400 px-3 py-1.5 rounded-lg shadow-2xs"
        >
          <ArrowIcon className="w-3.5 h-3.5" />
          <span>{t('backToCustomers')}</span>
        </button>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Separate New Order button */}
          <button
            type="button"
            onClick={() => setScreen('measurement', customer.id, 'new-order')}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-black rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('newOrderBtn')}</span>
          </button>

          <button
            type="button"
            onClick={() => setScreen('measurement', customer.id, 'new')}
            className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('addNewMeasurementBtn')}</span>
          </button>
        </div>
      </div>

      {/* Customer Header Card (Compact) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-amber-400 font-black text-lg flex items-center justify-center shrink-0">
            {customer.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 leading-tight">
                {customer.name}
              </h1>
              <button
                type="button"
                onClick={() => setIsEditCustomerOpen(true)}
                className="p-1 text-slate-400 hover:text-slate-700"
                title={t('editBtn')}
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
              <span className="font-mono font-bold text-slate-800">{customer.phone}</span>
              <span>·</span>
              <span>{customer.address || settings.location}</span>
              <span>·</span>
              <span>Joined: {customer.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Quick Balance Pills */}
        <div className="flex items-center gap-3 text-xs bg-slate-50 p-2 rounded-lg border border-slate-200">
          <div>
            <span className="text-slate-400">Total:</span>{' '}
            <strong className="font-mono">{settings.currency} {totalBilled.toLocaleString()}</strong>
          </div>
          <div>
            <span className="text-slate-400">Paid:</span>{' '}
            <strong className="font-mono text-emerald-700">{settings.currency} {totalPaid.toLocaleString()}</strong>
          </div>
          <div>
            <span className="text-slate-400">Due:</span>{' '}
            <strong className={`font-mono ${totalPending > 0 ? 'text-rose-700 font-black' : 'text-slate-400'}`}>
              {settings.currency} {totalPending.toLocaleString()}
            </strong>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center border-b border-slate-200 gap-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('measurements')}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 -mb-px transition-colors ${
            activeTab === 'measurements'
              ? 'border-amber-500 text-slate-950 font-black bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>{t('previousMeasurements')} ({customerMeasurements.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 -mb-px transition-colors ${
            activeTab === 'orders'
              ? 'border-amber-500 text-slate-950 font-black bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{t('ordersHistory')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 -mb-px transition-colors ${
            activeTab === 'payments'
              ? 'border-amber-500 text-slate-950 font-black bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>{t('paymentRecords')} ({customerPayments.length})</span>
        </button>
      </div>

      {/* TAB 1: Measurements with direct PRINT button per record (Section 14 requirement) */}
      {activeTab === 'measurements' && (
        <div className="space-y-2.5">
          {customerMeasurements.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
              {t('noMeasurementsYet')}
            </div>
          ) : (
            customerMeasurements.map((rec) => (
              <div
                key={rec.id}
                className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2"
              >
                {/* Header with Title, Date, and Print Buttons */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">{rec.title}</span>
                    <span className="text-[11px] font-mono font-bold text-slate-500">· {rec.date}</span>
                    {rec.deliveryDate && (
                      <span className="text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded">
                        Delivery: {rec.deliveryDate}
                      </span>
                    )}
                  </div>

                  {/* Actions: View / Edit & Print */}
                  <div className="flex items-center gap-1.5">
                    {/* Direct Print Button (Section 14) */}
                    <button
                      type="button"
                      onClick={() => openPrintModal(rec)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-xs transition-colors"
                      title={t('printBtn')}
                    >
                      <Printer className="w-3 h-3 text-amber-400" />
                      <span>{t('printBtn')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setScreen('measurement', customer.id, rec.id)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded text-xs transition-colors"
                      title={t('editBtn')}
                    >
                      {t('editBtn')}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRecord(rec.id)}
                      className="p-1 text-rose-500 hover:text-rose-700"
                      title={t('deleteBtn')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 9 Primary Tailoring Measurements Grid (Mobile Responsive) */}
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5 text-xs text-center">
                  {/* 1. لمبائی */}
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">لمبائی (Length)</div>
                    <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                      {rec.measurements.totalLength || '-'}
                    </div>
                  </div>
                  {/* 2. بازو */}
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">بازو (Sleeve)</div>
                    <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                      {rec.measurements.sleeveLength || '-'}
                    </div>
                  </div>
                  {/* 3. تیرا */}
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">تیرا (Tira)</div>
                    <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                      {rec.measurements.tira || rec.measurements.shoulder || '-'}
                    </div>
                  </div>
                  {/* 4. کالر */}
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">کالر (Collar)</div>
                    <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                      {rec.measurements.collar || rec.measurements.neck || '-'}
                    </div>
                  </div>
                  {/* 5. چھاتی */}
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">چھاتی (Chest)</div>
                    <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                      {rec.measurements.chati || rec.measurements.chest || '-'}
                    </div>
                  </div>
                  {/* 6. چوڑائی */}
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">چوڑائی (Width)</div>
                    <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                      {rec.measurements.chodai || rec.measurements.waist || '-'}
                    </div>
                  </div>
                  {/* 7. گھیرا */}
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">گھیرا (Ghera)</div>
                    <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                      {rec.measurements.ghera || rec.measurements.backWidth || '-'}
                    </div>
                  </div>
                  {/* 8. شلوار */}
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">شلوار (Shalwar)</div>
                    <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                      {rec.measurements.shalwar || '-'}
                    </div>
                  </div>
                  {/* 9. پانچہ */}
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">پانچہ (Paancha)</div>
                    <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                      {rec.measurements.paancha || rec.measurements.bottom || '-'}
                    </div>
                  </div>
                </div>

                {/* Tailoring & Style Choices Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
                  {/* Collar Style */}
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-md">
                    کالر: {rec.measurements.collarStyle === 'collar' ? 'کالر (Collar)' : 'بین (Bain / BAN)'}
                  </span>
                  {/* Daman */}
                  <span className="bg-slate-100 text-slate-800 border border-slate-200 font-semibold px-2 py-0.5 rounded-md">
                    دامن: {rec.measurements.damanStyle === 'round' ? 'گول لامن' : 'سادہ لامن'}
                  </span>
                  {/* Cuff */}
                  <span className="bg-slate-100 text-slate-800 border border-slate-200 font-semibold px-2 py-0.5 rounded-md">
                    کف: {rec.measurements.cuffStyle === 'round' ? 'گول کف' : rec.measurements.cuffStyle === 'open' ? 'کھلا بازو' : 'سادہ کف'}
                  </span>
                  {/* Front Pocket */}
                  <span className="bg-slate-100 text-slate-800 border border-slate-200 font-semibold px-2 py-0.5 rounded-md">
                    سامنے جیب: {rec.measurements.frontPocket === 'no' ? 'نہیں' : 'ہاں'}
                  </span>
                  {/* Side Pocket */}
                  <span className="bg-slate-100 text-slate-800 border border-slate-200 font-semibold px-2 py-0.5 rounded-md">
                    سائیڈ جیب: {rec.measurements.sidePocket === 'two' ? '2 جیبیں' : rec.measurements.sidePocket === 'none' ? 'کوئی نہیں' : '1 جیب'}
                  </span>
                  {/* Shalwar Pocket */}
                  {rec.measurements.shalwarPocket === 'yes' && (
                    <span className="bg-slate-100 text-slate-800 border border-slate-200 font-semibold px-2 py-0.5 rounded-md">
                      شلوار جیب: ہاں
                    </span>
                  )}
                </div>

                {/* Custom Measurements with Actual Urdu & English Names */}
                {rec.customMeasurements && rec.customMeasurements.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">کسٹم ناپ:</span>
                    {rec.customMeasurements.map((cm) => {
                      const def = customMeasurementDefinitions.find(
                        (d) => d.name.trim().toLowerCase() === cm.name.trim().toLowerCase()
                      );
                      const displayName = isRtl
                        ? (def?.nameUr || cm.name)
                        : (def?.name || cm.name);
                      return (
                        <span key={cm.id} className="bg-amber-50 text-amber-950 border border-amber-300 font-bold px-2 py-0.5 rounded-md shadow-2xs">
                          <span>{displayName}:</span> <span className="font-mono font-black">{cm.value}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-2">
          {customerMeasurements.filter((m) => m.clothingItems && m.clothingItems.length > 0).length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
              No garments recorded yet.
            </div>
          ) : (
            customerMeasurements.map((m) => (
              <div key={m.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-700 border-b pb-1">
                  <span>{m.title}</span>
                  <span className="font-mono text-slate-500">{m.date}</span>
                </div>
                {m.clothingItems.map((ci) => (
                  <div key={ci.id} className="flex justify-between">
                    <span>{ci.quantity}x {ci.clothingType}</span>
                    <span className="font-mono font-bold">{settings.currency} {ci.total}</span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Payments */}
      {activeTab === 'payments' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              {language === 'ur' ? 'گاہک کی ادائیگی و آرڈر تاریخ' : 'Customer Payment & Order History'}
            </span>
            <button
              type="button"
              onClick={() => setScreen('measurement', customer.id, 'new-order')}
              className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('newOrderBtn')}</span>
            </button>
          </div>

          {customerPayments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
              {language === 'ur' ? 'کوئی ادائیگی ریکارڈ نہیں ملا۔' : 'No payment transactions yet.'}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              {/* Mobile Card List (sm:hidden) */}
              <div className="sm:hidden divide-y divide-slate-100">
                {customerPayments.map((p) => {
                  const prev = Number(p.previousBalance) || 0;
                  const due = Number(p.totalDue) || (Number(p.totalPrice) + prev);
                  const hasPending = p.remainingAmount > 0;
                  return (
                    <div key={p.id} className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{p.orderSummary}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            p.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {p.status === 'paid' ? t('statusPaid') : p.status === 'partial' ? t('statusPartial') : t('statusPending')}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">Date: {p.date}</div>

                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-sans">Total Due:</span>
                          <span className="font-black text-indigo-900">{settings.currency} {due.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-sans">Paid:</span>
                          <span className="font-bold text-emerald-700">{settings.currency} {Number(p.paidAmount).toLocaleString()}</span>
                        </div>
                        {prev > 0 && (
                          <div>
                            <span className="text-amber-800 block text-[10px] font-sans">Prev Bal:</span>
                            <span className="font-semibold text-amber-900">{settings.currency} {prev.toLocaleString()}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-400 block text-[10px] font-sans">Remaining:</span>
                          <span className={`font-black ${hasPending ? 'text-rose-700' : 'text-slate-400'}`}>
                            {settings.currency} {Number(p.remainingAmount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table (hidden sm:block) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left rtl:text-right border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] bg-slate-50/70">
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Order</th>
                      <th className="py-2 px-3 text-end">{t('orderTotal')}</th>
                      <th className="py-2 px-3 text-end">{t('previousBalance')}</th>
                      <th className="py-2 px-3 text-end">{t('totalDue')}</th>
                      <th className="py-2 px-3 text-end">{t('paidAmount')}</th>
                      <th className="py-2 px-3 text-end">{t('remainingAmount')}</th>
                      <th className="py-2 px-3 text-center">{t('paymentStatus')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customerPayments.map((p) => {
                      const prev = Number(p.previousBalance) || 0;
                      const due = Number(p.totalDue) || (Number(p.totalPrice) + prev);
                      const hasPending = p.remainingAmount > 0;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2 px-3 font-mono text-slate-500 whitespace-nowrap">
                            {p.date}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900">
                            {p.orderSummary}
                          </td>
                          <td className="py-2 px-3 text-end font-mono font-bold text-slate-800">
                            {settings.currency} {Number(p.totalPrice).toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-end font-mono font-semibold text-amber-900">
                            {prev > 0 ? `${settings.currency} ${prev.toLocaleString()}` : '-'}
                          </td>
                          <td className="py-2 px-3 text-end font-mono font-black text-indigo-900">
                            {settings.currency} {due.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-end font-mono font-bold text-emerald-700">
                            {settings.currency} {Number(p.paidAmount).toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-end font-mono font-black">
                            <span className={hasPending ? 'text-rose-700' : 'text-slate-400'}>
                              {settings.currency} {Number(p.remainingAmount).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                p.status === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.status === 'partial'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {p.status === 'paid' ? t('statusPaid') : p.status === 'partial' ? t('statusPartial') : t('statusPending')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditCustomerOpen && (
        <AddCustomerModal
          customerToEdit={customer}
          onClose={() => setIsEditCustomerOpen(false)}
        />
      )}
    </div>
  );
};
