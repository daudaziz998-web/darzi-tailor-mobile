import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ActiveScreen,
  Customer,
  Language,
  MeasurementRecord,
  OrderPaymentRecord,
  PaymentTransaction,
  PriceItem,
  PrintFormat,
  ShopSettings,
  StandardMeasurements,
  CustomMeasurementDefinition,
} from '../types';
import { translations, TranslationKey } from '../translations';
import { apiFetch } from '../services/api';

export const defaultShopSettings: ShopSettings = {
  shopNameEn: 'Awais Tailor House',
  shopNameUr: 'اویس ٹیلر ہاؤس',
  location: 'Talash, Shamshi Khan',
  phone: '0300-1234567',
  currency: 'Rs.',
  unit: 'inches',
  language: 'en',
  thermalWidth: '80mm',
};

export const defaultStandardMeasurements: StandardMeasurements = {
  neck: '',
  chest: '',
  waist: '',
  hip: '',
  totalLength: '',
  sleeveLength: '',
  bottom: '',
  shoulder: '',
  backWidth: '',
  upperArm: '',
  lowerArm: '',
  wrist: '',
  cuff: '',
  damanStyle: 'simple',
  cuffStyle: 'simple',
  collarStyle: 'ban',
  collarPattiStyle: 'simple',
  selectedColor: '#1e293b',
  shalwarPocket: 'no',
  frontPocket: 'yes',
  sidePocket: 'one',
  coatStyle: 'none',
  buttonType: 'simple',
  shalwar: '',
  tira: '',
  collar: '',
  chati: '',
  chodai: '',
  ghera: '',
  paancha: '',
};

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface AppContextType {
  // Navigation & View State
  currentScreen: ActiveScreen;
  selectedCustomerId: string | null;
  selectedMeasurementId: string | null;
  setScreen: (screen: ActiveScreen, customerId?: string, measurementId?: string) => void;
  goBack: () => void;
  previousScreen: ActiveScreen | null;

  // Language & Translation
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;

  // Settings
  settings: ShopSettings;
  updateSettings: (newSettings: Partial<ShopSettings>) => Promise<void>;

  // Data
  customers: Customer[];
  measurements: MeasurementRecord[];
  payments: OrderPaymentRecord[];
  prices: PriceItem[];
  dbLocation: string;

  // CRUD Operations
  addCustomer: (data: { name: string; phone: string; address: string; notes?: string }) => Promise<Customer>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  saveMeasurementRecord: (
    recordData: Omit<MeasurementRecord, 'id'> & { id?: string },
    advancePayment?: number,
    paymentMethod?: PaymentTransaction['method'],
    orderOptions?: {
      orderId?: string;
      isNewOrder?: boolean;
      previousBalance?: number;
      totalDue?: number;
    }
  ) => Promise<MeasurementRecord>;
  deleteMeasurementRecord: (id: string) => Promise<void>;

  recordPayment: (
    orderId: string,
    customerId: string,
    amount: number,
    method: PaymentTransaction['method'],
    note?: string
  ) => Promise<void>;

  addPriceItem: (item: Omit<PriceItem, 'id'>) => Promise<void>;
  updatePriceItem: (item: PriceItem) => Promise<void>;
  deletePriceItem: (id: string) => Promise<void>;

  // Custom Measurement Definitions
  customMeasurementDefinitions: CustomMeasurementDefinition[];
  addCustomMeasurementDefinition: (
    def: Omit<CustomMeasurementDefinition, 'id'>
  ) => Promise<CustomMeasurementDefinition>;
  updateCustomMeasurementDefinition: (
    def: CustomMeasurementDefinition
  ) => Promise<void>;
  deleteCustomMeasurementDefinition: (id: string) => Promise<void>;

  resetToSampleData: () => Promise<void>;
  exportBackup: () => Promise<void>;
  restoreBackup: (fileContent: string) => Promise<boolean>;

  // Toast
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;

  // Print Preview Modal
  activePrintRecord: MeasurementRecord | null;
  activePrintFormat: PrintFormat;
  setActivePrintFormat: (format: PrintFormat) => void;
  openPrintModal: (record: MeasurementRecord, defaultFormat?: PrintFormat) => void;
  closePrintModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Settings & Language
  const [settings, setSettings] = useState<ShopSettings>(() => {
    try {
      const saved = localStorage.getItem('awais_settings');
      return saved ? JSON.parse(saved) : defaultShopSettings;
    } catch {
      return defaultShopSettings;
    }
  });

  const [language, setLanguageState] = useState<Language>(() => settings.language || 'en');
  const [dbLocation, setDbLocation] = useState<string>('');

  // 2. Navigation State
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('dashboard');
  const [previousScreen, setPreviousScreen] = useState<ActiveScreen | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedMeasurementId, setSelectedMeasurementId] = useState<string | null>(null);

  // 3. Printing Modal State
  const [activePrintRecord, setActivePrintRecord] = useState<MeasurementRecord | null>(null);
  const [activePrintFormat, setActivePrintFormat] = useState<PrintFormat>('thermal-80');

  // 4. Data States (with LocalStorage cache for Android offline persistence)
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('awais_customers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>(() => {
    try {
      const saved = localStorage.getItem('awais_measurements');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [payments, setPayments] = useState<OrderPaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('awais_payments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [prices, setPrices] = useState<PriceItem[]>(() => {
    try {
      const saved = localStorage.getItem('awais_prices');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [customMeasurementDefinitions, setCustomMeasurementDefinitions] = useState<CustomMeasurementDefinition[]>(() => {
    try {
      const saved = localStorage.getItem('awais_custom_definitions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Mirror to localStorage for offline Android persistence
  useEffect(() => {
    try {
      if (customers.length > 0) localStorage.setItem('awais_customers', JSON.stringify(customers));
    } catch (_) {}
  }, [customers]);

  useEffect(() => {
    try {
      if (measurements.length > 0) localStorage.setItem('awais_measurements', JSON.stringify(measurements));
    } catch (_) {}
  }, [measurements]);

  useEffect(() => {
    try {
      if (payments.length > 0) localStorage.setItem('awais_payments', JSON.stringify(payments));
    } catch (_) {}
  }, [payments]);

  useEffect(() => {
    try {
      if (prices.length > 0) localStorage.setItem('awais_prices', JSON.stringify(prices));
    } catch (_) {}
  }, [prices]);

  useEffect(() => {
    try {
      if (customMeasurementDefinitions.length > 0) localStorage.setItem('awais_custom_definitions', JSON.stringify(customMeasurementDefinitions));
    } catch (_) {}
  }, [customMeasurementDefinitions]);

  // 5. Toast Notification
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((cur) => (cur?.id === id ? null : cur));
    }, 3000);
  };

  // Sync <html> dir and lang attributes
  useEffect(() => {
    document.documentElement.setAttribute('dir', language === 'ur' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    updateSettings({ language: newLang });
  };

  // Fetch initial data from SQLite via /api/bootstrap
  const loadDatabaseData = async () => {
    try {
      const res = await apiFetch('/api/bootstrap');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.dbPath) {
            setDbLocation(data.dbPath);
          }

          if (data.settings) {
            const mappedSettings: ShopSettings = {
              shopNameEn: data.settings.shop_name_en || defaultShopSettings.shopNameEn,
              shopNameUr: data.settings.shop_name_ur || defaultShopSettings.shopNameUr,
              location: data.settings.location || defaultShopSettings.location,
              phone: data.settings.phone || defaultShopSettings.phone,
              currency: data.settings.currency || defaultShopSettings.currency,
              unit: data.settings.unit || defaultShopSettings.unit,
              language: data.settings.language || defaultShopSettings.language,
              thermalWidth: data.settings.thermal_width || defaultShopSettings.thermalWidth,
            };
            setSettings(mappedSettings);
            setLanguageState(mappedSettings.language);
          }

          // Customers
          if (Array.isArray(data.customers)) {
            setCustomers(
              data.customers.map((c: any) => ({
                id: c.id,
                name: c.name,
                phone: c.phone,
                address: c.address || '',
                notes: c.notes || '',
                createdAt: c.created_at || '',
              }))
            );
          }

          // Measurements mapped with custom measurements & clothing items
          if (Array.isArray(data.measurements)) {
            const customList = Array.isArray(data.customMeasurements) ? data.customMeasurements : [];
            const clothingList = Array.isArray(data.clothingItems) ? data.clothingItems : [];

            setMeasurements(
              data.measurements.map((m: any) => {
                const customs = customList.filter((cm: any) => cm.measurement_id === m.id);
                // Clothing items linked by order
                const relatedOrder = (data.orders || []).find((o: any) => o.measurement_id === m.id);
                const items = relatedOrder
                  ? clothingList
                      .filter((ci: any) => ci.order_id === relatedOrder.id)
                      .map((ci: any) => ({
                        id: ci.id,
                        clothingType: ci.clothing_type,
                        quantity: ci.quantity,
                        price: ci.price,
                        total: ci.total,
                        specialInstructions: ci.special_instructions,
                      }))
                  : [];

                return {
                  id: m.id,
                  customerId: m.customer_id,
                  date: m.date,
                  title: m.title || '',
                  deliveryDate: m.delivery_date || '',
                  notes: m.notes || '',
                  measurements: {
                    neck: m.neck || m.collar || '',
                    chest: m.chest || m.chati || '',
                    waist: m.waist || m.chodai || '',
                    hip: m.hip || '',
                    totalLength: m.total_length || m.lambai || '',
                    sleeveLength: m.sleeve_length || m.bazu || '',
                    bottom: m.bottom || m.paancha || '',
                    shoulder: m.shoulder || m.tira || '',
                    backWidth: m.back_width || m.ghera || '',
                    upperArm: m.upper_arm || '',
                    lowerArm: m.lower_arm || '',
                    wrist: m.wrist || '',
                    cuff: m.cuff || '',
                    damanStyle: m.daman_style || 'simple',
                    cuffStyle: m.cuff_style || 'simple',
                    collarStyle: (m.collar_style as any) || (m.collar_patti_style === 'color' || m.collar_patti_style === 'pencil' ? 'ban' : (m.collar_patti_style as any)) || 'ban',
                    collarPattiStyle: m.collar_patti_style || 'simple',
                    selectedColor: m.selected_color || '#1e293b',
                    shalwarPocket: m.shalwar_pocket || 'no',
                    frontPocket: m.front_pocket || 'yes',
                    sidePocket: m.side_pocket || 'one',
                    coatStyle: m.coat_style || 'none',
                    buttonType: m.button_type || 'simple',
                    shalwar: m.shalwar || '',
                    tira: m.tira || m.shoulder || '',
                    collar: m.collar || m.neck || '',
                    chati: m.chati || m.chest || '',
                    chodai: m.chodai || m.waist || '',
                    ghera: m.ghera || m.back_width || '',
                    paancha: m.paancha || m.bottom || '',
                  },
                  customMeasurements: customs.map((cm: any) => ({
                    id: cm.id,
                    name: cm.name,
                    value: cm.value,
                    unit: cm.unit,
                    notes: cm.notes,
                  })),
                  clothingItems: items,
                };
              })
            );
          }

          // Orders / Payments mapped
          if (Array.isArray(data.orders)) {
            const paymentsList = Array.isArray(data.payments) ? data.payments : [];
            const custMap = new Map((data.customers || []).map((c: any) => [c.id, c.name]));

            setPayments(
              data.orders.map((o: any) => {
                const history = paymentsList
                  .filter((p: any) => p.order_id === o.id)
                  .map((p: any) => ({
                    id: p.id,
                    date: p.date,
                    amount: p.amount,
                    method: p.method,
                    note: p.note,
                  }));

                return {
                  id: o.id,
                  orderId: o.id,
                  customerId: o.customer_id,
                  customerName: custMap.get(o.customer_id) || 'Customer',
                  orderSummary: o.order_summary,
                  totalPrice: Number(o.total_price) || 0,
                  previousBalance: Number(o.previous_balance) || 0,
                  totalDue: Number(o.total_due) || ((Number(o.total_price) || 0) + (Number(o.previous_balance) || 0)),
                  paidAmount: Number(o.paid_amount) || 0,
                  remainingAmount: Number(o.remaining_amount) || 0,
                  status: o.status,
                  date: o.date,
                  createdAt: o.created_at || o.date,
                  measurementId: o.measurement_id || '',
                  paymentHistory: history,
                };
              })
            );
          }

          // Prices
          if (Array.isArray(data.prices)) {
            setPrices(
              data.prices.map((p: any) => ({
                id: p.id,
                nameEn: p.name_en,
                nameUr: p.name_ur,
                defaultPrice: p.default_price,
                category: p.category,
              }))
            );
          }

          // Custom Measurement Definitions
          if (Array.isArray(data.customMeasurementDefinitions)) {
            setCustomMeasurementDefinitions(
              data.customMeasurementDefinitions.map((cmd: any) => ({
                id: cmd.id,
                name: cmd.name,
                nameUr: cmd.name_ur || cmd.nameUr || '',
                unit: (cmd.unit === 'CM' ? 'CM' : 'Inches') as 'Inches' | 'CM',
                image: cmd.image || '',
                createdAt: cmd.created_at || cmd.createdAt || '',
                updatedAt: cmd.updated_at || cmd.updatedAt || '',
              }))
            );
          }
        }
      }
    } catch (err) {
      console.warn('[SQLite] Backend bootstrap not reachable, using local storage state.', err);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, []);

  // Translation accessor
  const t = (key: TranslationKey): string => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || String(key);
  };

  // Screen Switcher
  const setScreen = (screen: ActiveScreen, customerId?: string, measurementId?: string) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
    if (customerId !== undefined) {
      setSelectedCustomerId(customerId);
    }
    if (measurementId !== undefined) {
      setSelectedMeasurementId(measurementId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (previousScreen) {
      setCurrentScreen(previousScreen);
      setPreviousScreen(null);
    } else {
      setCurrentScreen('dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Customer Actions (Sync to SQLite)
  const addCustomer = async (data: { name: string; phone: string; address: string; notes?: string }): Promise<Customer> => {
    const newCustomer: Customer = {
      id: 'cust-' + Date.now(),
      name: data.name.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      notes: data.notes?.trim(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCustomers((prev) => [newCustomer, ...prev]);

    try {
      await apiFetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });
    } catch (e) {
      console.error('Failed to sync customer to SQLite:', e);
    }

    showToast(language === 'ur' ? 'نیا گاہک درج ہوگیا' : 'Customer added successfully');
    return newCustomer;
  };

  const updateCustomer = async (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    try {
      await apiFetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.error('Failed to update customer in SQLite:', e);
    }
    showToast(language === 'ur' ? 'معلومات محفوظ ہوگئیں' : 'Customer details updated');
  };

  const deleteCustomer = async (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setMeasurements((prev) => prev.filter((m) => m.customerId !== id));
    setPayments((prev) => prev.filter((p) => p.customerId !== id));

    try {
      await apiFetch(`/api/customers/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete customer in SQLite:', e);
    }

    if (selectedCustomerId === id) {
      setSelectedCustomerId(null);
      setCurrentScreen('customers');
    }
    showToast(language === 'ur' ? 'گاہک حذف ہوگیا' : 'Customer deleted');
  };

  // Measurement Actions (Sync to SQLite)
  const saveMeasurementRecord = async (
    recordData: Omit<MeasurementRecord, 'id'> & { id?: string },
    advancePayment = 0,
    paymentMethod: PaymentTransaction['method'] = 'cash',
    orderOptions?: {
      orderId?: string;
      isNewOrder?: boolean;
      previousBalance?: number;
      totalDue?: number;
    }
  ): Promise<MeasurementRecord> => {
    const measId = recordData.id || 'meas-' + Date.now();
    const completeRecord: MeasurementRecord = {
      ...recordData,
      id: measId,
    };

    setMeasurements((prev) => {
      const idx = prev.findIndex((m) => m.id === measId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = completeRecord;
        return copy;
      }
      return [completeRecord, ...prev];
    });

    try {
      await apiFetch('/api/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: measId,
          orderId: orderOptions?.orderId,
          isNewOrder: orderOptions?.isNewOrder,
          previousBalance: orderOptions?.previousBalance,
          totalDue: orderOptions?.totalDue,
          customerId: recordData.customerId,
          date: recordData.date,
          title: recordData.title,
          deliveryDate: recordData.deliveryDate,
          notes: recordData.notes,
          ...recordData.measurements,
          customMeasurements: recordData.customMeasurements,
          clothingItems: recordData.clothingItems,
          advancePayment,
          paymentMethod,
        }),
      });

      // Reload fresh SQLite state
      await loadDatabaseData();
    } catch (e) {
      console.error('Failed to save measurement to SQLite:', e);
    }

    showToast(t('measurementsSavedSuccess'));
    return completeRecord;
  };

  const deleteMeasurementRecord = async (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
    try {
      await apiFetch(`/api/measurements/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete measurement in SQLite:', e);
    }
    showToast(language === 'ur' ? 'ناپ حذف ہوگیا' : 'Measurement deleted');
  };

  // Payment Recording (Sync to SQLite)
  const recordPayment = async (
    orderId: string,
    customerId: string,
    amount: number,
    method: PaymentTransaction['method'] = 'cash',
    note?: string
  ) => {
    try {
      const res = await apiFetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerId,
          amount,
          method,
          note,
        }),
      });
      if (res.ok) {
        await loadDatabaseData();
      }
    } catch (e) {
      console.error('Failed to record payment in SQLite:', e);
    }
    showToast(t('paymentSuccessMsg'));
  };

  // Price Actions (Sync to SQLite)
  const addPriceItem = async (item: Omit<PriceItem, 'id'>) => {
    const id = 'price-' + Date.now();
    const newItem: PriceItem = { ...item, id };
    setPrices((prev) => [...prev, newItem]);
    try {
      await apiFetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
    } catch (e) {
      console.error('Failed to add price in SQLite:', e);
    }
    showToast(language === 'ur' ? 'نیا ریٹ شامل ہوگیا' : 'Price item added');
  };

  const updatePriceItem = async (item: PriceItem) => {
    setPrices((prev) => prev.map((p) => (p.id === item.id ? item : p)));
    try {
      await apiFetch(`/api/prices/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
    } catch (e) {
      console.error('Failed to update price in SQLite:', e);
    }
    showToast(language === 'ur' ? 'ریٹ اپ ڈیٹ ہوگیا' : 'Price item updated');
  };

  const deletePriceItem = async (id: string) => {
    setPrices((prev) => prev.filter((p) => p.id !== id));
    try {
      await apiFetch(`/api/prices/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete price in SQLite:', e);
    }
    showToast(language === 'ur' ? 'ریٹ حذف ہوگیا' : 'Price item deleted');
  };

  // Custom Measurement Definitions Actions
  const addCustomMeasurementDefinition = async (
    def: Omit<CustomMeasurementDefinition, 'id'>
  ): Promise<CustomMeasurementDefinition> => {
    const id = 'cmd-' + Date.now();
    const nowIso = new Date().toISOString();
    const newDef: CustomMeasurementDefinition = {
      ...def,
      id,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setCustomMeasurementDefinitions((prev) => [...prev, newDef]);

    try {
      await apiFetch('/api/custom-measurement-definitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDef),
      });
      await loadDatabaseData();
    } catch (e) {
      console.error('Failed to add custom measurement definition:', e);
    }
    showToast(language === 'ur' ? 'نیا کسٹم ناپ شامل ہو گیا' : 'Custom measurement added successfully');
    return newDef;
  };

  const updateCustomMeasurementDefinition = async (def: CustomMeasurementDefinition) => {
    setCustomMeasurementDefinitions((prev) =>
      prev.map((d) => (d.id === def.id ? def : d))
    );

    try {
      await apiFetch(`/api/custom-measurement-definitions/${def.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(def),
      });
      await loadDatabaseData();
    } catch (e) {
      console.error('Failed to update custom measurement definition:', e);
    }
    showToast(language === 'ur' ? 'کسٹم ناپ اپ ڈیٹ ہو گیا' : 'Custom measurement updated');
  };

  const deleteCustomMeasurementDefinition = async (id: string) => {
    // Only remove definition template; old customer measurements remain completely safe!
    setCustomMeasurementDefinitions((prev) => prev.filter((d) => d.id !== id));

    try {
      await apiFetch(`/api/custom-measurement-definitions/${id}`, {
        method: 'DELETE',
      });
      await loadDatabaseData();
    } catch (e) {
      console.error('Failed to delete custom measurement definition:', e);
    }
    showToast(language === 'ur' ? 'کسٹم ناپ حذف ہو گیا' : 'Custom measurement deleted');
  };

  // Settings Actions (Sync to SQLite)
  const updateSettings = async (newSettings: Partial<ShopSettings>) => {
    const merged: ShopSettings = { ...settings, ...newSettings };
    setSettings(merged);
    localStorage.setItem('awais_settings', JSON.stringify(merged));

    try {
      await apiFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      });
    } catch (e) {
      console.error('Failed to save settings in SQLite:', e);
    }
    showToast(t('settingsSavedSuccess'));
  };

  // Reset to default sample records
  const resetToSampleData = async () => {
    try {
      await apiFetch('/api/reset', { method: 'POST' });
      await loadDatabaseData();
    } catch (e) {
      console.error('Failed to reset SQLite data:', e);
    }
    showToast(language === 'ur' ? 'ڈیٹا ری سیٹ ہوگیا' : 'Sample records restored');
  };

  // Export Complete Backup Data
  const exportBackup = async () => {
    try {
      const res = await apiFetch('/api/backup');
      if (!res.ok) throw new Error('Backup request failed');
      const backupJson = await res.json();
      const blob = new Blob([JSON.stringify(backupJson, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Awais_Tailor_House_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(language === 'ur' ? 'بیک اپ فائل تیار ہو گئی' : 'Backup created successfully.');
    } catch (e) {
      console.error('Backup error:', e);
      const fallbackBackup = {
        version: '1.0',
        app: 'Awais Tailor House',
        exportDate: new Date().toISOString(),
        data: {
          settings,
          customers,
          measurements,
          orders: payments,
          prices,
        },
      };
      const blob = new Blob([JSON.stringify(fallbackBackup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Awais_Tailor_House_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(language === 'ur' ? 'بیک اپ فائل تیار ہو گئی' : 'Backup created successfully.');
    }
  };

  // Restore Complete Backup Data
  const restoreBackup = async (fileContent: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(fileContent);
      const res = await apiFetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Restore failed');
      }

      await loadDatabaseData();
      showToast(language === 'ur' ? 'ڈیٹا بحال ہو گیا' : 'Data restored successfully.');
      return true;
    } catch (e: any) {
      console.error('Restore error:', e);
      showToast(language === 'ur' ? 'ڈیٹا بحال کرنے میں خرابی ہوئی' : 'Failed to restore backup file.', 'error');
      return false;
    }
  };

  // Printing Modal Controls
  const openPrintModal = (record: MeasurementRecord, defaultFormat: PrintFormat = 'thermal-80') => {
    setActivePrintRecord(record);
    setActivePrintFormat(defaultFormat);
  };

  const closePrintModal = () => {
    setActivePrintRecord(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        selectedCustomerId,
        selectedMeasurementId,
        setScreen,
        goBack,
        previousScreen,
        language,
        setLanguage,
        t,
        settings,
        updateSettings,
        customers,
        measurements,
        payments,
        prices,
        dbLocation,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        saveMeasurementRecord,
        deleteMeasurementRecord,
        recordPayment,
        addPriceItem,
        updatePriceItem,
        deletePriceItem,
        customMeasurementDefinitions,
        addCustomMeasurementDefinition,
        updateCustomMeasurementDefinition,
        deleteCustomMeasurementDefinition,
        resetToSampleData,
        exportBackup,
        restoreBackup,
        toast,
        showToast,
        activePrintRecord,
        activePrintFormat,
        setActivePrintFormat,
        openPrintModal,
        closePrintModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
