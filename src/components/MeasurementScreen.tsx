import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Customer, 
  CustomMeasurement, 
  OrderClothingItem, 
  StandardMeasurements,
  MeasurementRecord,
  CustomMeasurementDefinition
} from '../types';
import { defaultStandardMeasurements } from '../context/AppContext';
import { CustomMeasurementFieldCard } from './CustomMeasurementFieldCard';
import {
  getStoredCustomImages,
  saveStoredCustomImage,
  removeStoredCustomImage,
} from '../utils/measurementImageStorage';
import { getCustomerPreviousBalance } from '../utils/balance';
import { 
  Ruler, 
  User, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Printer, 
  Calendar,
  ShoppingBag,
  Sparkles,
  Edit,
  History,
  FileText,
  Scissors,
  Palette,
  ChevronDown,
  ChevronUp,
  Shirt,
  Check
} from 'lucide-react';

export const MeasurementScreen: React.FC = () => {
  const { 
    customers, 
    selectedCustomerId, 
    selectedMeasurementId,
    measurements,
    payments,
    prices, 
    settings, 
    setScreen, 
    saveMeasurementRecord,
    openPrintModal,
    customMeasurementDefinitions,
    updateCustomMeasurementDefinition,
    language, 
    t 
  } = useApp();

  const isRtl = language === 'ur';

  const currentCustomer: Customer | undefined = customers.find(
    (c) => c.id === selectedCustomerId
  ) || customers[0];

  // All historical measurements for this customer
  const customerRecords = measurements.filter(
    (m) => m.customerId === currentCustomer?.id
  );

  const isNewOrderRequested = selectedMeasurementId === 'new' || selectedMeasurementId === 'new-order';
  const [isNewOrderMode, setIsNewOrderMode] = useState(isNewOrderRequested);

  // If user explicitly requested 'new', existingRecord is undefined.
  // If 'new-order' is requested, we use customer's latest measurement as starting values, but create a new separate order record.
  const existingRecord: MeasurementRecord | undefined =
    selectedMeasurementId === 'new'
      ? undefined
      : (selectedMeasurementId && selectedMeasurementId !== 'new-order'
          ? measurements.find((m) => m.id === selectedMeasurementId)
          : customerRecords[0]);

  const isEditingExisting = !!existingRecord && !isNewOrderMode;

  // Existing order linked to this measurement record
  const linkedOrder = useMemo(() => {
    if (!existingRecord) return undefined;
    return payments.find(
      (p) =>
        p.id === 'ord-' + existingRecord.id ||
        p.orderId === 'ord-' + existingRecord.id ||
        p.measurementId === existingRecord.id
    );
  }, [existingRecord?.id, payments]);

  // Form States
  const [recordTitle, setRecordTitle] = useState(existingRecord?.title || '');
  const [deliveryDate, setDeliveryDate] = useState(existingRecord?.deliveryDate || '');
  const [notes, setNotes] = useState(existingRecord?.notes || '');

  // The 13 Standard Measurements
  const [stdMeasurements, setStdMeasurements] = useState<StandardMeasurements>(
    existingRecord?.measurements || defaultStandardMeasurements
  );

  // Custom Measurements
  const [customMeasurements, setCustomMeasurements] = useState<CustomMeasurement[]>(
    existingRecord?.customMeasurements || []
  );

  // Clothing Items
  const [clothingItems, setClothingItems] = useState<OrderClothingItem[]>(
    existingRecord?.clothingItems && existingRecord.clothingItems.length > 0
      ? existingRecord.clothingItems
      : [
          {
            id: 'item-' + Date.now(),
            clothingType: language === 'ur' ? (prices[0]?.nameUr || 'شلوار قمیض') : (prices[0]?.nameEn || 'Shalwar Kameez'),
            quantity: 1,
            price: prices[0]?.defaultPrice || 1500,
            total: (prices[0]?.defaultPrice || 1500) * 1,
            specialInstructions: '',
          },
        ]
  );

  const [advancePayment, setAdvancePayment] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'jazzcash' | 'easypaisa' | 'bank'>('cash');
  const [savedSuccessRecord, setSavedSuccessRecord] = useState<MeasurementRecord | null>(null);

  // Persistent Custom Reference Images per customer & measurement
  const [customImages, setCustomImages] = useState<Record<string, string>>(() => {
    return getStoredCustomImages(currentCustomer?.id);
  });

  // When customer changes, load their saved custom reference images
  useEffect(() => {
    setCustomImages(getStoredCustomImages(currentCustomer?.id));
  }, [currentCustomer?.id]);

  const handleUploadImage = (field: keyof StandardMeasurements, dataUrl: string) => {
    setCustomImages((prev) => ({ ...prev, [field]: dataUrl }));
    saveStoredCustomImage(currentCustomer?.id, field, dataUrl);
  };

  const handleResetImage = (field: keyof StandardMeasurements) => {
    setCustomImages((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
    removeStoredCustomImage(currentCustomer?.id, field);
  };

  // When active record or customer changes, synchronize form state
  useEffect(() => {
    if (selectedMeasurementId === 'new' || selectedMeasurementId === 'new-order') {
      setIsNewOrderMode(true);
      setAdvancePayment('0');
    } else if (selectedMeasurementId) {
      setIsNewOrderMode(false);
      setAdvancePayment('0');
    }

    if (existingRecord) {
      setRecordTitle(existingRecord.title);
      setDeliveryDate(existingRecord.deliveryDate || '');
      setNotes(existingRecord.notes || '');
      setStdMeasurements(existingRecord.measurements);
      setCustomMeasurements(existingRecord.customMeasurements || []);
      setClothingItems(existingRecord.clothingItems || []);
      if (!isNewOrderMode && linkedOrder) {
        setAdvancePayment((linkedOrder.paidAmount || 0).toString());
      }
      setSavedSuccessRecord(null);
    } else {
      // Starting a new measurement record
      setRecordTitle(language === 'ur' ? 'نیا ناپ' : 'New Measurement Record');
      setDeliveryDate('');
      setNotes('');
      // If customer has previous measurements, pre-fill as starting point for convenience
      if (customerRecords.length > 0) {
        setStdMeasurements(customerRecords[0].measurements);
        setCustomMeasurements(
          (customerRecords[0].customMeasurements || []).map((cm) => ({
            ...cm,
            id: 'cm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8),
          }))
        );
      } else {
        setStdMeasurements(defaultStandardMeasurements);
        setCustomMeasurements([]);
      }
      setClothingItems([
        {
          id: 'item-' + Date.now(),
          clothingType: language === 'ur' ? (prices[0]?.nameUr || 'شلوار قمیض') : (prices[0]?.nameEn || 'Shalwar Kameez'),
          quantity: 1,
          price: prices[0]?.defaultPrice || 1500,
          total: (prices[0]?.defaultPrice || 1500) * 1,
          specialInstructions: '',
        },
      ]);
      setSavedSuccessRecord(null);
    }
  }, [existingRecord?.id, selectedMeasurementId, currentCustomer?.id, language]);

  const COLOR_PRESETS = [
    { nameUr: 'سیاہ (کالا)', nameEn: 'Black', hex: '#0f172a' },
    { nameUr: 'سفید', nameEn: 'White', hex: '#ffffff' },
    { nameUr: 'کریم / آف وائٹ', nameEn: 'Cream', hex: '#fef3c7' },
    { nameUr: 'نیوی بلیو', nameEn: 'Navy', hex: '#1e3a8a' },
    { nameUr: 'براؤن / خاکی', nameEn: 'Brown', hex: '#78350f' },
    { nameUr: 'مہرون', nameEn: 'Maroon', hex: '#881337' },
    { nameUr: 'سرمئی / گرے', nameEn: 'Grey', hex: '#475569' },
    { nameUr: 'مہندی / زیتون', nameEn: 'Olive', hex: '#3f6212' },
  ];

  const updateMeasurementValue = (field: keyof StandardMeasurements, val: string) => {
    setStdMeasurements((prev) => ({ ...prev, [field]: val }));
  };

  const updateMainMeasurement = (
    primary: keyof StandardMeasurements,
    val: string,
    alias?: keyof StandardMeasurements
  ) => {
    setStdMeasurements((prev) => {
      const copy = { ...prev, [primary]: val };
      if (alias) {
        (copy as any)[alias] = val;
      }
      return copy;
    });
  };

  const updateOption = <K extends keyof StandardMeasurements>(field: K, val: StandardMeasurements[K]) => {
    setStdMeasurements((prev) => ({ ...prev, [field]: val }));
  };

  // Custom Measurements management
  const handleAddCustom = (name = '', value = '', unit = 'inches') => {
    const newItem: CustomMeasurement = {
      id: 'cm-' + Date.now() + Math.random().toString(36).substring(2, 6),
      name,
      value,
      unit,
      notes: '',
    };
    setCustomMeasurements((prev) => [...prev, newItem]);
  };

  const handleUpdateCustom = (id: string, field: keyof CustomMeasurement, val: string) => {
    setCustomMeasurements((prev) =>
      prev.map((cm) => (cm.id === id ? { ...cm, [field]: val } : cm))
    );
  };

  const handleDeleteCustom = (id: string) => {
    setCustomMeasurements((prev) => prev.filter((cm) => cm.id !== id));
  };

  // Defined Custom Measurements handlers
  const handleUpdateDefinedCustomValue = (def: CustomMeasurementDefinition, val: string) => {
    setCustomMeasurements((prev) => {
      const matchIndex = prev.findIndex(
        (cm) => cm.name.trim().toLowerCase() === def.name.trim().toLowerCase()
      );
      if (matchIndex >= 0) {
        const copy = [...prev];
        copy[matchIndex] = {
          ...copy[matchIndex],
          value: val,
          unit: def.unit,
        };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: 'cm-' + Date.now() + '-' + def.id,
            name: def.name,
            value: val,
            unit: def.unit,
            notes: '',
          },
        ];
      }
    });
  };

  const handleUpdateDefinitionImage = (def: CustomMeasurementDefinition, newImage: string) => {
    updateCustomMeasurementDefinition({
      ...def,
      image: newImage,
      updatedAt: new Date().toISOString(),
    });
  };

  // Legacy/ad-hoc custom measurements not matching any current definition
  const extraCustomMeasurements = customMeasurements.filter(
    (cm) =>
      !customMeasurementDefinitions.some(
        (def) => def.name.trim().toLowerCase() === cm.name.trim().toLowerCase()
      )
  );

  // Clothing Items management
  const handleAddClothingItem = () => {
    const defaultP = prices[0];
    const newItem: OrderClothingItem = {
      id: 'item-' + Date.now() + Math.random().toString(36).substring(2, 6),
      clothingType: defaultP 
        ? (language === 'ur' ? defaultP.nameUr : defaultP.nameEn)
        : (language === 'ur' ? 'شلوار قمیض' : 'Shalwar Kameez'),
      quantity: 1,
      price: defaultP ? defaultP.defaultPrice : 1500,
      total: defaultP ? defaultP.defaultPrice : 1500,
      specialInstructions: '',
    };
    setClothingItems((prev) => [...prev, newItem]);
  };

  const handleSelectPrice = (idx: number, priceId: string) => {
    const p = prices.find((item) => item.id === priceId);
    if (!p) return;
    setClothingItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[idx] };
      item.clothingType = language === 'ur' ? p.nameUr : p.nameEn;
      item.price = p.defaultPrice;
      item.total = p.defaultPrice * item.quantity;
      copy[idx] = item;
      return copy;
    });
  };

  const handleUpdateClothingItem = (idx: number, field: keyof OrderClothingItem, val: any) => {
    setClothingItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[idx] };
      if (field === 'quantity') {
        const q = Math.max(1, Number(val) || 1);
        item.quantity = q;
        item.total = item.price * q;
      } else if (field === 'price') {
        const p = Math.max(0, Number(val) || 0);
        item.price = p;
        item.total = p * item.quantity;
      } else {
        (item as any)[field] = val;
      }
      copy[idx] = item;
      return copy;
    });
  };

  const handleDeleteClothingItem = (idx: number) => {
    setClothingItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Requirement 1 & 3: Automatic previous balance calculation
  const previousBalance = useMemo(() => {
    if (!currentCustomer) return 0;
    if (isEditingExisting && linkedOrder) {
      return Number(linkedOrder.previousBalance) || 0;
    }
    return getCustomerPreviousBalance(currentCustomer.id, payments);
  }, [currentCustomer?.id, payments, isEditingExisting, linkedOrder]);

  const grandTotal = clothingItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const totalDue = previousBalance + grandTotal;
  const remainingBalance = Math.max(0, totalDue - (Number(advancePayment) || 0));

  // Requirement 2: Save / Edit Measurement & Separate Order
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;

    const todayDate = new Date().toISOString().split('T')[0];
    const isSeparate = isNewOrderMode || !existingRecord || isNewOrderRequested;

    const saved = await saveMeasurementRecord(
      {
        id: isSeparate ? undefined : existingRecord?.id,
        customerId: currentCustomer.id,
        date: isSeparate ? todayDate : (existingRecord?.date || todayDate),
        title: recordTitle || (language === 'ur' ? 'ناپ' : 'Measurement'),
        deliveryDate,
        notes,
        measurements: stdMeasurements,
        customMeasurements: customMeasurements.filter((cm) => cm.name.trim() || cm.value.trim()),
        clothingItems,
      },
      Number(advancePayment) || 0,
      paymentMethod,
      {
        orderId: isSeparate ? undefined : linkedOrder?.id,
        isNewOrder: isSeparate,
        previousBalance: previousBalance,
        totalDue: totalDue,
      }
    );

    setSavedSuccessRecord(saved);
    setScreen('measurement', currentCustomer.id, saved.id);
    setIsNewOrderMode(false);
  };

  if (!currentCustomer) {
    return (
      <div className="bg-white border border-slate-300 rounded-xl p-8 text-center">
        <User className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <div className="text-base font-bold text-slate-800">
          {language === 'ur' ? 'گاہک منتخب نہیں ہوا' : 'No customer selected'}
        </div>
        <button
          type="button"
          onClick={() => setScreen('add-customer')}
          className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold rounded-lg"
        >
          {t('addNewCustomer')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-8">
      {/* Customer & Measurement Status Banner */}
      <div className="bg-slate-900 text-white rounded-xl px-4 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2.5 no-print">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
            {currentCustomer.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base sm:text-lg font-black text-white truncate max-w-full">{currentCustomer.name}</span>
              <span className="text-amber-400 font-mono font-bold text-sm shrink-0">· {currentCustomer.phone}</span>
            </div>

            {/* Existing Saved Record vs New Record Indicator */}
            <div className="flex items-center gap-2 text-xs mt-0.5 flex-wrap">
              {isEditingExisting ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80 whitespace-normal break-words max-w-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="break-words">
                    {language === 'ur' ? 'محفوظ ناپ (تبدیل کریں)' : 'Saved Measurement Record'} · {existingRecord.date}
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-300 font-semibold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80 whitespace-normal break-words max-w-full">
                  <Plus className="w-3 h-3 shrink-0" />
                  <span className="break-words">{language === 'ur' ? 'نیا ناپ ریکارڈ' : 'New Measurement Record'}</span>
                </span>
              )}

              {/* Record Selector Dropdown if customer has records */}
              {customerRecords.length >= 1 && (
                <select
                  value={existingRecord?.id || 'new'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setScreen('measurement', currentCustomer.id, val);
                  }}
                  className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] font-medium outline-none max-w-full truncate"
                >
                  {customerRecords.map((r, i) => (
                    <option key={r.id} value={r.id}>
                      Record {customerRecords.length - i}: {r.date} ({r.title || 'Fitting'})
                    </option>
                  ))}
                  <option value="new">+ {language === 'ur' ? 'نیا ناپ بنائیں' : 'New Record'}</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons: New Order, New Measurement, Print & Back (Responsive 2-column on mobile) */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-1.5 w-full sm:w-auto mt-2 md:mt-0">
          {/* Button to start a separate new order/bill record */}
          <button
            type="button"
            onClick={() => {
              setIsNewOrderMode(true);
              setClothingItems([
                {
                  id: 'item-' + Date.now(),
                  clothingType: language === 'ur' ? (prices[0]?.nameUr || 'شلوار قمیض') : (prices[0]?.nameEn || 'Shalwar Kameez'),
                  quantity: 1,
                  price: prices[0]?.defaultPrice || 1500,
                  total: (prices[0]?.defaultPrice || 1500) * 1,
                  specialInstructions: '',
                },
              ]);
              setRecordTitle(
                language === 'ur'
                  ? `نیا آرڈر - ${new Date().toISOString().split('T')[0]}`
                  : `New Order - ${new Date().toISOString().split('T')[0]}`
              );
            }}
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg transition-colors shadow-2xs w-full sm:w-auto"
            title="Start a separate new order for this customer"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t('newOrderBtn')}</span>
          </button>

          {/* Button to create a separate new measurement record */}
          <button
            type="button"
            onClick={() => setScreen('measurement', currentCustomer.id, 'new')}
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs w-full sm:w-auto"
            title="Start a separate new measurement record for this customer"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t('addNewMeasurementBtn')}</span>
          </button>

          {existingRecord && (
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => openPrintModal(existingRecord)}
                className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg transition-colors shadow-2xs flex-1 sm:flex-initial"
                title="Print measurement record"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t('printRecord')}</span>
              </button>
              <button
                type="button"
                onClick={() => openPrintModal(existingRecord)}
                className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs flex-1 sm:flex-initial"
                title="Save measurement as PDF"
              >
                <FileText className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span className="truncate">{t('saveAsPdf')}</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setScreen('customer-profile', currentCustomer.id)}
            className="flex items-center justify-center px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors w-full sm:w-auto"
          >
            <span className="truncate">{t('backToProfile')}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Bar */}
      {savedSuccessRecord && (
        <div className="bg-emerald-50 border border-emerald-400 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isEditingExisting 
                ? (language === 'ur' ? 'ناپ اپ ڈیٹ ہوگیا اور محفوظ ہے!' : 'Measurement updated and permanently saved!') 
                : t('measurementsSavedSuccess')}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={() => openPrintModal(savedSuccessRecord)}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded transition-colors flex items-center gap-1 shadow-2xs"
            >
              <Printer className="w-3 h-3 shrink-0" />
              <span>{t('printRecord')}</span>
            </button>
            <button
              type="button"
              onClick={() => openPrintModal(savedSuccessRecord)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded transition-colors flex items-center gap-1 shadow-2xs"
            >
              <FileText className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{t('saveAsPdf')}</span>
            </button>
            <button
              type="button"
              onClick={() => setScreen('customer-profile', currentCustomer.id)}
              className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 font-bold text-xs rounded transition-colors"
            >
              {t('backToProfile')}
            </button>
          </div>
        </div>
      )}

      {/* Main Measurement Form */}
      <form onSubmit={handleSave} className="space-y-3">
        {/* Record Overview & Delivery Date */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-0.5">
                {t('measurementTitle')}
              </label>
              <input
                type="text"
                value={recordTitle}
                onChange={(e) => setRecordTitle(e.target.value)}
                placeholder={t('measurementTitlePlaceholder')}
                className="w-full text-sm font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded outline-none h-8"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-0.5">
                {t('deliveryDate')}
              </label>
              <input
                type="text"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                placeholder={t('deliveryDatePlaceholder')}
                className="w-full text-sm font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded outline-none h-8 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-0.5">
                {language === 'ur' ? 'اضافی نوٹ' : 'Fitting Notes'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Loose fit, double cuff"
                className="w-full text-sm px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded outline-none h-8"
              />
            </div>
          </div>
        </div>

        {/* --- HANDWRITTEN MEASUREMENT FORM DESIGN --- */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{language === 'ur' ? 'پیمائش و کٹنگ تفصیلات' : 'Customer Measurements'}</span>
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  {language === 'ur'
                    ? 'قمیض شلوار اور درزی کٹنگ کا مکمل ناپ'
                    : 'Garment measurements and tailored cut preferences'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md shrink-0">
              {language === 'ur' ? `اکائی: ${settings.unit === 'cm' ? 'سینٹی میٹر' : 'انچ'}` : `Unit: ${settings.unit}`}
            </span>
          </div>

          {/* 9 MAIN HANDWRITTEN MEASUREMENTS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* 1. لمبائی (Length) + سادہ لامن / گول لامن */}
            <div className="bg-slate-50/80 border border-slate-200 hover:border-amber-400/80 rounded-xl p-3 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">1</span>
                  <label className="text-sm font-black text-slate-900">
                    لمبائی <span className="text-xs font-semibold text-slate-500">(Length)</span>
                  </label>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{settings.unit}</span>
              </div>

              <input
                type="text"
                value={stdMeasurements.totalLength || ''}
                onChange={(e) => updateMainMeasurement('totalLength', e.target.value)}
                placeholder="مثلاً 40"
                className="w-full text-base sm:text-lg font-mono font-bold px-3 py-1.5 bg-white border border-slate-300 focus:border-amber-500 rounded-lg outline-none transition-shadow"
              />

              {/* Daman Style Choice Chips */}
              <div className="pt-1">
                <div className="text-[11px] font-bold text-slate-600 mb-1 flex items-center justify-between">
                  <span>دامن / لامن اسٹائل:</span>
                  <span className="text-amber-800 font-extrabold text-[10px]">
                    {stdMeasurements.damanStyle === 'round' ? 'گول لامن' : 'سادہ لامن'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateOption('damanStyle', 'simple')}
                    className={`py-1.5 px-2 text-xs rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
                      stdMeasurements.damanStyle !== 'round'
                        ? 'bg-amber-600 text-white shadow-xs border border-amber-700'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {stdMeasurements.damanStyle !== 'round' && <Check className="w-3 h-3" />}
                    <span>سادہ لامن</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateOption('damanStyle', 'round')}
                    className={`py-1.5 px-2 text-xs rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
                      stdMeasurements.damanStyle === 'round'
                        ? 'bg-amber-600 text-white shadow-xs border border-amber-700'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {stdMeasurements.damanStyle === 'round' && <Check className="w-3 h-3" />}
                    <span>گول لامن</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. بازو (Sleeve) + سادہ کف / گول کف / کھلا بازو */}
            <div className="bg-slate-50/80 border border-slate-200 hover:border-amber-400/80 rounded-xl p-3 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">2</span>
                  <label className="text-sm font-black text-slate-900">
                    بازو <span className="text-xs font-semibold text-slate-500">(Sleeve)</span>
                  </label>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{settings.unit}</span>
              </div>

              <input
                type="text"
                value={stdMeasurements.sleeveLength || ''}
                onChange={(e) => updateMainMeasurement('sleeveLength', e.target.value)}
                placeholder="مثلاً 24"
                className="w-full text-base sm:text-lg font-mono font-bold px-3 py-1.5 bg-white border border-slate-300 focus:border-amber-500 rounded-lg outline-none transition-shadow"
              />

              {/* Cuff Style Choice Chips */}
              <div className="pt-1">
                <div className="text-[11px] font-bold text-slate-600 mb-1 flex items-center justify-between">
                  <span>کف کا اسٹائل:</span>
                  <span className="text-amber-800 font-extrabold text-[10px]">
                    {stdMeasurements.cuffStyle === 'round' ? 'گول کف' : stdMeasurements.cuffStyle === 'open' ? 'کھلا بازو' : 'سادہ کف'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => updateOption('cuffStyle', 'simple')}
                    className={`py-1.5 px-1 text-[11px] rounded-lg font-bold transition-all text-center ${
                      stdMeasurements.cuffStyle !== 'round' && stdMeasurements.cuffStyle !== 'open'
                        ? 'bg-amber-600 text-white shadow-xs border border-amber-700'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    سادہ کف
                  </button>
                  <button
                    type="button"
                    onClick={() => updateOption('cuffStyle', 'round')}
                    className={`py-1.5 px-1 text-[11px] rounded-lg font-bold transition-all text-center ${
                      stdMeasurements.cuffStyle === 'round'
                        ? 'bg-amber-600 text-white shadow-xs border border-amber-700'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    گول کف
                  </button>
                  <button
                    type="button"
                    onClick={() => updateOption('cuffStyle', 'open')}
                    className={`py-1.5 px-1 text-[11px] rounded-lg font-bold transition-all text-center ${
                      stdMeasurements.cuffStyle === 'open'
                        ? 'bg-amber-600 text-white shadow-xs border border-amber-700'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    کھلا بازو
                  </button>
                </div>
              </div>
            </div>

            {/* 3. تیرا (Tira) */}
            <div className="bg-slate-50/80 border border-slate-200 hover:border-amber-400/80 rounded-xl p-3 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">3</span>
                  <label className="text-sm font-black text-slate-900">
                    تیرا <span className="text-xs font-semibold text-slate-500">(Tira / Shoulder)</span>
                  </label>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{settings.unit}</span>
              </div>

              <input
                type="text"
                value={stdMeasurements.tira || stdMeasurements.shoulder || ''}
                onChange={(e) => updateMainMeasurement('tira', e.target.value, 'shoulder')}
                placeholder="مثلاً 18"
                className="w-full text-base sm:text-lg font-mono font-bold px-3 py-1.5 bg-white border border-slate-300 focus:border-amber-500 rounded-lg outline-none transition-shadow"
              />
              <p className="text-[11px] text-slate-500 italic">کندھے سے کندھے کا ناپ</p>
            </div>

            {/* 4. کالر (Collar) + بین (Bain / BAN) / کالر (Collar) */}
            <div className="bg-slate-50/80 border border-slate-200 hover:border-amber-400/80 rounded-xl p-3 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">4</span>
                  <label className="text-sm font-black text-slate-900">
                    کالر <span className="text-xs font-semibold text-slate-500">(Collar)</span>
                  </label>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{settings.unit}</span>
              </div>

              <input
                type="text"
                value={stdMeasurements.collar || stdMeasurements.neck || ''}
                onChange={(e) => updateMainMeasurement('collar', e.target.value, 'neck')}
                placeholder="مثلاً 16"
                className="w-full text-base sm:text-lg font-mono font-bold px-3 py-1.5 bg-white border border-slate-300 focus:border-amber-500 rounded-lg outline-none transition-shadow"
              />

              {/* Collar Style Choice: بین (Bain / BAN) یا کالر (Collar) */}
              <div className="pt-1">
                <div className="text-[11px] font-bold text-slate-600 mb-1 flex items-center justify-between">
                  <span>کالر اسٹائل:</span>
                  <span className="text-amber-800 font-extrabold text-[10px]">
                    {stdMeasurements.collarStyle === 'collar' ? 'کالر (Collar)' : 'بین (Bain / BAN)'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateOption('collarStyle', 'ban')}
                    className={`py-1.5 px-2 text-xs rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
                      stdMeasurements.collarStyle !== 'collar'
                        ? 'bg-amber-600 text-white shadow-xs border border-amber-700'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {stdMeasurements.collarStyle !== 'collar' && <Check className="w-3 h-3" />}
                    <span>بین (BAN)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateOption('collarStyle', 'collar')}
                    className={`py-1.5 px-2 text-xs rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
                      stdMeasurements.collarStyle === 'collar'
                        ? 'bg-amber-600 text-white shadow-xs border border-amber-700'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {stdMeasurements.collarStyle === 'collar' && <Check className="w-3 h-3" />}
                    <span>کالر (Collar)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 5. چھاتی (Chest) */}
            <div className="bg-slate-50/80 border border-slate-200 hover:border-amber-400/80 rounded-xl p-3 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">5</span>
                  <label className="text-sm font-black text-slate-900">
                    چھاتی <span className="text-xs font-semibold text-slate-500">(Chest / سینہ)</span>
                  </label>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{settings.unit}</span>
              </div>

              <input
                type="text"
                value={stdMeasurements.chati || stdMeasurements.chest || ''}
                onChange={(e) => updateMainMeasurement('chati', e.target.value, 'chest')}
                placeholder="مثلاً 40"
                className="w-full text-base sm:text-lg font-mono font-bold px-3 py-1.5 bg-white border border-slate-300 focus:border-amber-500 rounded-lg outline-none transition-shadow"
              />
              <p className="text-[11px] text-slate-500 italic">سینہ کے اردگرد کا ناپ</p>
            </div>

            {/* 6. چوڑائی (Width / کمر) */}
            <div className="bg-slate-50/80 border border-slate-200 hover:border-amber-400/80 rounded-xl p-3 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">6</span>
                  <label className="text-sm font-black text-slate-900">
                    چوڑائی <span className="text-xs font-semibold text-slate-500">(Width / کمر)</span>
                  </label>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{settings.unit}</span>
              </div>

              <input
                type="text"
                value={stdMeasurements.chodai || stdMeasurements.waist || ''}
                onChange={(e) => updateMainMeasurement('chodai', e.target.value, 'waist')}
                placeholder="مثلاً 36"
                className="w-full text-base sm:text-lg font-mono font-bold px-3 py-1.5 bg-white border border-slate-300 focus:border-amber-500 rounded-lg outline-none transition-shadow"
              />
              <p className="text-[11px] text-slate-500 italic">قمیض کی فٹنگ / چوڑائی</p>
            </div>

            {/* 7. گھیرا (Ghera) */}
            <div className="bg-slate-50/80 border border-slate-200 hover:border-amber-400/80 rounded-xl p-3 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">7</span>
                  <label className="text-sm font-black text-slate-900">
                    گھیرا <span className="text-xs font-semibold text-slate-500">(Ghera / دامن چوڑائی)</span>
                  </label>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{settings.unit}</span>
              </div>

              <input
                type="text"
                value={stdMeasurements.ghera || stdMeasurements.backWidth || ''}
                onChange={(e) => updateMainMeasurement('ghera', e.target.value, 'backWidth')}
                placeholder="مثلاً 24"
                className="w-full text-base sm:text-lg font-mono font-bold px-3 py-1.5 bg-white border border-slate-300 focus:border-amber-500 rounded-lg outline-none transition-shadow"
              />
              <p className="text-[11px] text-slate-500 italic">دامن کی چوڑائی / کھلا پن</p>
            </div>

            {/* 8. شلوار (Shalwar) + جیب: ہاں / نہیں */}
            <div className="bg-slate-50/80 border border-slate-200 hover:border-amber-400/80 rounded-xl p-3 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">8</span>
                  <label className="text-sm font-black text-slate-900">
                    شلوار <span className="text-xs font-semibold text-slate-500">(Shalwar Length)</span>
                  </label>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{settings.unit}</span>
              </div>

              <input
                type="text"
                value={stdMeasurements.shalwar || ''}
                onChange={(e) => updateMainMeasurement('shalwar', e.target.value)}
                placeholder="مثلاً 38"
                className="w-full text-base sm:text-lg font-mono font-bold px-3 py-1.5 bg-white border border-slate-300 focus:border-amber-500 rounded-lg outline-none transition-shadow"
              />

              {/* Shalwar Pocket Choice: جیب ہاں / نہیں */}
              <div className="pt-1">
                <div className="text-[11px] font-bold text-slate-600 mb-1 flex items-center justify-between">
                  <span>شلوار جیب (Shalwar Pocket):</span>
                  <span className="text-amber-800 font-extrabold text-[10px]">
                    {stdMeasurements.shalwarPocket === 'yes' ? 'جیب: ہاں' : 'جیب: نہیں'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateOption('shalwarPocket', 'yes')}
                    className={`py-1.5 px-2 text-xs rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
                      stdMeasurements.shalwarPocket === 'yes'
                        ? 'bg-amber-600 text-white shadow-xs border border-amber-700'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {stdMeasurements.shalwarPocket === 'yes' && <Check className="w-3 h-3" />}
                    <span>جیب: ہاں</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateOption('shalwarPocket', 'no')}
                    className={`py-1.5 px-2 text-xs rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
                      stdMeasurements.shalwarPocket !== 'yes'
                        ? 'bg-amber-600 text-white shadow-xs border border-amber-700'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {stdMeasurements.shalwarPocket !== 'yes' && <Check className="w-3 h-3" />}
                    <span>جیب: نہیں</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 9. پانچہ (Paancha) */}
            <div className="bg-slate-50/80 border border-slate-200 hover:border-amber-400/80 rounded-xl p-3 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">9</span>
                  <label className="text-sm font-black text-slate-900">
                    پانچہ <span className="text-xs font-semibold text-slate-500">(Paancha / Bottom)</span>
                  </label>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{settings.unit}</span>
              </div>

              <input
                type="text"
                value={stdMeasurements.paancha || stdMeasurements.bottom || ''}
                onChange={(e) => updateMainMeasurement('paancha', e.target.value, 'bottom')}
                placeholder="مثلاً 8.5"
                className="w-full text-base sm:text-lg font-mono font-bold px-3 py-1.5 bg-white border border-slate-300 focus:border-amber-500 rounded-lg outline-none transition-shadow"
              />
              <p className="text-[11px] text-slate-500 italic">شلوار کے نچلے پائنچے کا ناپ</p>
            </div>

            {/* Configured Custom Measurements directly alongside standard measurements */}
            {customMeasurementDefinitions.map((def, idx) => {
              const matchedVal =
                customMeasurements.find(
                  (cm) => cm.name.trim().toLowerCase() === def.name.trim().toLowerCase()
                )?.value || '';

              const fieldNum = 10 + idx;
              const titleUr = def.nameUr || def.name;
              const titleEn = def.name;
              const unitText = def.unit || settings.unit;

              return (
                <div
                  key={def.id}
                  className="bg-slate-50/80 border border-slate-200 hover:border-amber-400/80 rounded-xl p-3 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">
                        {fieldNum}
                      </span>
                      <label className="text-sm font-black text-slate-900">
                        {language === 'ur' ? titleUr : titleEn}{' '}
                        <span className="text-xs font-semibold text-slate-500">
                          ({language === 'ur' ? titleEn : titleUr})
                        </span>
                      </label>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{unitText}</span>
                  </div>

                  <input
                    type="text"
                    value={matchedVal}
                    onChange={(e) => handleUpdateDefinedCustomValue(def, e.target.value)}
                    placeholder="0"
                    className="w-full text-base sm:text-lg font-mono font-bold px-3 py-1.5 bg-white border border-slate-300 focus:border-amber-500 rounded-lg outline-none transition-shadow"
                  />

                  {def.image && (
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                      <img
                        src={def.image}
                        alt={titleEn}
                        className="w-7 h-7 rounded object-cover border border-slate-300 shrink-0"
                      />
                      <span className="truncate">{titleUr}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ADDITIONAL OPTIONS FROM HANDWRITTEN DESIGN */}
          <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-3 sm:p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Shirt className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight">
                {language === 'ur' ? 'درزی کٹنگ و اضافی ترجیحات (Styling & Tailoring Details)' : 'Tailoring & Styling Options'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* سامنے جیب (Front Pocket) */}
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-1.5">
                <label className="font-bold text-slate-800 block text-xs">
                  سامنے جیب <span className="text-slate-500 font-normal">(Front Pocket)</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateOption('frontPocket', 'yes')}
                    className={`py-1.5 px-2 rounded-md font-bold transition-all text-center ${
                      stdMeasurements.frontPocket !== 'no'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ہاں (Yes)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateOption('frontPocket', 'no')}
                    className={`py-1.5 px-2 rounded-md font-bold transition-all text-center ${
                      stdMeasurements.frontPocket === 'no'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    نہیں (No)
                  </button>
                </div>
              </div>

              {/* سائیڈ جیب (Side Pocket: None / One / Two) */}
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-1.5">
                <label className="font-bold text-slate-800 block text-xs">
                  سائیڈ جیب <span className="text-slate-500 font-normal">(Side Pocket)</span>
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => updateOption('sidePocket', 'none')}
                    className={`py-1.5 px-1 rounded-md font-bold transition-all text-center text-[11px] ${
                      stdMeasurements.sidePocket === 'none'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    کوئی نہیں
                  </button>
                  <button
                    type="button"
                    onClick={() => updateOption('sidePocket', 'one')}
                    className={`py-1.5 px-1 rounded-md font-bold transition-all text-center text-[11px] ${
                      stdMeasurements.sidePocket !== 'none' && stdMeasurements.sidePocket !== 'two'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    1 جیب
                  </button>
                  <button
                    type="button"
                    onClick={() => updateOption('sidePocket', 'two')}
                    className={`py-1.5 px-1 rounded-md font-bold transition-all text-center text-[11px] ${
                      stdMeasurements.sidePocket === 'two'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    2 جیبیں
                  </button>
                </div>
              </div>

              {/* کوٹ اسٹائل (Coat style: Simple / Shiny with Yes/No) */}
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-1.5">
                <label className="font-bold text-slate-800 block text-xs">
                  کوٹ اسٹائل <span className="text-slate-500 font-normal">(Coat Style)</span>
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => updateOption('coatStyle', 'none')}
                    className={`py-1.5 px-1 rounded-md font-bold transition-all text-center text-[11px] ${
                      stdMeasurements.coatStyle === 'none'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    شامل نہیں
                  </button>
                  <button
                    type="button"
                    onClick={() => updateOption('coatStyle', 'simple')}
                    className={`py-1.5 px-1 rounded-md font-bold transition-all text-center text-[11px] ${
                      stdMeasurements.coatStyle === 'simple'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    سادہ
                  </button>
                  <button
                    type="button"
                    onClick={() => updateOption('coatStyle', 'shiny')}
                    className={`py-1.5 px-1 rounded-md font-bold transition-all text-center text-[11px] ${
                      stdMeasurements.coatStyle === 'shiny'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    چمکدار
                  </button>
                </div>
              </div>

              {/* بٹن انتخاب (Button choices: سادہ / فینسی / میٹل / دھاگہ) */}
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-1.5">
                <label className="font-bold text-slate-800 block text-xs">
                  بٹن ترجیح <span className="text-slate-500 font-normal">(Buttons)</span>
                </label>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => updateOption('buttonType', 'simple')}
                    className={`py-1.5 px-1.5 rounded-md font-bold transition-all text-center ${
                      stdMeasurements.buttonType !== 'fancy' && stdMeasurements.buttonType !== 'metal' && stdMeasurements.buttonType !== 'fabric'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    سادہ بٹن
                  </button>
                  <button
                    type="button"
                    onClick={() => updateOption('buttonType', 'fancy')}
                    className={`py-1.5 px-1.5 rounded-md font-bold transition-all text-center ${
                      stdMeasurements.buttonType === 'fancy'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    فینسی بٹن
                  </button>
                  <button
                    type="button"
                    onClick={() => updateOption('buttonType', 'metal')}
                    className={`py-1.5 px-1.5 rounded-md font-bold transition-all text-center ${
                      stdMeasurements.buttonType === 'metal'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    میٹل بٹن
                  </button>
                  <button
                    type="button"
                    onClick={() => updateOption('buttonType', 'fabric')}
                    className={`py-1.5 px-1.5 rounded-md font-bold transition-all text-center ${
                      stdMeasurements.buttonType === 'fabric'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    دھاگہ / ٹانکا
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Extra / Ad-hoc Measurements (Keeps customer history 100% safe) */}
          {extraCustomMeasurements.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="text-xs font-black text-slate-800">
                {language === 'ur' ? 'اضافی ناپ فیلڈز' : 'Additional Measurements'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {extraCustomMeasurements.map((cm) => (
                  <div key={cm.id} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <input
                      type="text"
                      value={cm.name}
                      onChange={(e) => handleUpdateCustom(cm.id, 'name', e.target.value)}
                      placeholder={t('fieldNamePlaceholder')}
                      className="w-1/2 text-xs font-bold px-2 py-1 bg-slate-50 border border-slate-300 rounded outline-none"
                    />
                    <input
                      type="text"
                      value={cm.value}
                      onChange={(e) => handleUpdateCustom(cm.id, 'value', e.target.value)}
                      placeholder="0"
                      className="w-1/3 text-xs font-mono font-bold px-2 py-1 bg-slate-50 border border-slate-300 rounded outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteCustom(cm.id)}
                      className="p-1 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick-add new measurement field button or manage in settings */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200">
            <button
              type="button"
              onClick={() => handleAddCustom()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? '+ نیا ناپ فیلڈ شامل کریں' : '+ Add Custom Measurement'}</span>
            </button>
            <button
              type="button"
              onClick={() => setScreen('custom-measurements')}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:underline"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'کسٹم ناپ مینیجر' : 'Custom Measurement Manager'}</span>
            </button>
          </div>
        </div>

        {/* Clothing Items & Order Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                {t('clothingOrderTitle')}
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAddClothingItem}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addItemBtn')}</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {clothingItems.map((ci, idx) => (
              <div key={ci.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded border border-slate-200 text-xs">
                {/* Garment Selector */}
                <div className="col-span-4 sm:col-span-3">
                  <select
                    value={prices.find((p) => (language === 'ur' ? p.nameUr : p.nameEn) === ci.clothingType)?.id || ''}
                    onChange={(e) => handleSelectPrice(idx, e.target.value)}
                    className="w-full text-xs font-bold px-2 py-1 bg-white border border-slate-300 rounded outline-none h-7"
                  >
                    {prices.map((p) => (
                      <option key={p.id} value={p.id}>
                        {language === 'ur' ? p.nameUr : p.nameEn} ({settings.currency} {p.defaultPrice})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Qty */}
                <div className="col-span-2 sm:col-span-1">
                  <input
                    type="number"
                    min="1"
                    value={ci.quantity}
                    onChange={(e) => handleUpdateClothingItem(idx, 'quantity', e.target.value)}
                    className="w-full text-xs font-bold font-mono px-1 py-1 bg-white border border-slate-300 rounded outline-none h-7 text-center"
                  />
                </div>

                {/* Unit Price */}
                <div className="col-span-3 sm:col-span-2">
                  <input
                    type="number"
                    min="0"
                    value={ci.price}
                    onChange={(e) => handleUpdateClothingItem(idx, 'price', e.target.value)}
                    className="w-full text-xs font-bold font-mono px-2 py-1 bg-white border border-slate-300 rounded outline-none h-7"
                  />
                </div>

                {/* Line Total */}
                <div className="col-span-2 sm:col-span-2 font-mono font-bold text-emerald-800">
                  {settings.currency} {ci.total}
                </div>

                {/* Special Instructions */}
                <div className="col-span-11 sm:col-span-3">
                  <input
                    type="text"
                    value={ci.specialInstructions || ''}
                    onChange={(e) => handleUpdateClothingItem(idx, 'specialInstructions', e.target.value)}
                    placeholder={t('specialInstructionsPlaceholder')}
                    className="w-full text-xs px-2 py-1 bg-white border border-slate-300 rounded outline-none h-7 text-slate-600"
                  />
                </div>

                <div className="col-span-1 text-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteClothingItem(idx)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Grand Total, Previous Balance, Total Due & Payment Breakdown */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-200">
            {/* Financial Summary Breakdown */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-bold block text-[10px] uppercase">
                  {t('orderTotal')}:
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-slate-900">
                  {settings.currency} {grandTotal.toLocaleString()}
                </span>
              </div>

              {previousBalance > 0 && (
                <div className="border-s ps-3 border-slate-200">
                  <span className="text-amber-800 font-bold block text-[10px] uppercase">
                    {t('previousBalance')}:
                  </span>
                  <span className="text-sm sm:text-base font-black font-mono text-amber-900">
                    {settings.currency} {previousBalance.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="border-s ps-3 border-slate-200">
                <span className="text-indigo-900 font-black block text-[10px] uppercase">
                  {t('totalDue')}:
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-indigo-900">
                  {settings.currency} {totalDue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Advance / Current Payment Input */}
            {grandTotal > 0 && (
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block text-[10px] mb-0.5">
                    {language === 'ur' ? 'وصول رقم / ادائیگی:' : 'Paid / Cash:'}
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max={totalDue}
                      value={advancePayment}
                      onChange={(e) => setAdvancePayment(e.target.value)}
                      className="w-24 font-bold font-mono px-2 py-1 bg-white border border-slate-300 rounded h-7 text-xs text-slate-900 outline-none focus:border-amber-500"
                      placeholder="0"
                    />
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="px-2 py-1 bg-white border border-slate-300 rounded h-7 text-xs font-bold"
                    >
                      <option value="cash">{t('cash')}</option>
                      <option value="jazzcash">{t('jazzcash')}</option>
                      <option value="easypaisa">{t('easypaisa')}</option>
                      <option value="bank">{t('bank')}</option>
                    </select>
                  </div>
                </div>

                {/* Remaining Balance */}
                <div className="border-s ps-2.5 border-slate-200">
                  <span className="font-bold text-slate-500 block text-[10px] mb-0.5">
                    {t('remainingAmount')}:
                  </span>
                  <span
                    className={`text-sm sm:text-base font-black font-mono ${
                      remainingBalance > 0 ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {settings.currency} {remainingBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions: Save / Update Measurement */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <div className="text-xs text-slate-500 font-medium">
            {isEditingExisting 
              ? (language === 'ur' ? 'موجودہ ناپ اپ ڈیٹ ہو جائے گا' : 'Updates and preserves this existing measurement record')
              : (language === 'ur' ? 'نیا ناپ ریکارڈ بنایا جائے گا' : 'Will create a new measurement record')}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setScreen('customer-profile', currentCustomer.id)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {t('cancel')}
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-black rounded-lg shadow-md transition-all active:scale-98"
            >
              <Ruler className="w-4 h-4" />
              <span>
                {isEditingExisting
                  ? (language === 'ur' ? 'ناپ محفوظ کریں (اپ ڈیٹ)' : 'Save Measurement (Update)')
                  : t('saveMeasurementsBtn')}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
