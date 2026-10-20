import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Ruler, 
  CreditCard, 
  Tag, 
  UserPlus, 
  ArrowRight,
  ArrowLeft,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    customers, 
    measurements, 
    payments, 
    settings, 
    setScreen, 
    language, 
    t 
  } = useApp();

  const isRtl = language === 'ur';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const totalCustomersCount = customers.length;
  const totalMeasurementsCount = measurements.length;
  const pendingAmount = payments.reduce((sum, p) => sum + (Number(p.remainingAmount) || 0), 0);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrdersCount = measurements.filter((m) => m.date === todayStr).length;

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-6">
      {/* Compact Header Bar with Quick Add Action */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
            {language === 'ur' ? 'اویس ٹیلر ہاؤس — ڈیش بورڈ' : 'Awais Tailor House — Main Dashboard'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {settings.location} · {settings.phone}
          </p>
        </div>

        {/* Compact + Add Customer CTA */}
        <button
          type="button"
          onClick={() => setScreen('add-customer')}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('addNewCustomer')}</span>
        </button>
      </div>

      {/* 4 Compact Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Customers */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500">{t('totalCustomers')}</div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums leading-none mt-1">
              {totalCustomersCount}
            </div>
          </div>
          <div className="p-2.5 bg-sky-50 text-sky-700 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Total Measurements */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500">{t('totalMeasurements')}</div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums leading-none mt-1">
              {totalMeasurementsCount}
            </div>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
            <Ruler className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500">{t('pendingPayments')}</div>
            <div className="text-lg sm:text-xl font-black text-rose-700 font-mono tabular-nums leading-none mt-1 truncate max-w-[140px]">
              {settings.currency} {pendingAmount.toLocaleString()}
            </div>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Today's Orders */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500">{t('todayOrders')}</div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums leading-none mt-1">
              {todayOrdersCount}
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4 Main Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Customers Card */}
        <button
          type="button"
          onClick={() => setScreen('customers')}
          className="group text-left rtl:text-right bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-800 rounded-xl p-4 shadow-xs transition-all focus:outline-none flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <ArrowIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
            </div>
            <div className="text-base font-black text-slate-900">
              1. {t('customers')}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
              {language === 'ur' ? 'گاہک اندراج و ناپ ڈائریکٹری' : 'Customer records & directory'}
            </p>
          </div>
        </button>

        {/* 2. Measurements Card */}
        <button
          type="button"
          onClick={() => {
            if (customers.length > 0) {
              setScreen('measurement', customers[0].id);
            } else {
              setScreen('add-customer');
            }
          }}
          className="group text-left rtl:text-right bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-800 rounded-xl p-4 shadow-xs transition-all focus:outline-none flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-colors">
                <Ruler className="w-5 h-5" />
              </div>
              <ArrowIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
            </div>
            <div className="text-base font-black text-slate-900">
              2. {t('measurements')}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
              {language === 'ur' ? 'درزی ناپ اور کسٹم پیمائش' : 'Customer tailoring measurements'}
            </p>
          </div>
        </button>

        {/* 3. Payments Card */}
        <button
          type="button"
          onClick={() => setScreen('payments')}
          className="group text-left rtl:text-right bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-800 rounded-xl p-4 shadow-xs transition-all focus:outline-none flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                <CreditCard className="w-5 h-5" />
              </div>
              <ArrowIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
            </div>
            <div className="text-base font-black text-slate-900">
              3. {t('payments')}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
              {language === 'ur' ? 'ادائیگی اور بقایا جات' : 'Dues ledger & cash records'}
            </p>
          </div>
        </button>

        {/* 4. Price Management Card */}
        <button
          type="button"
          onClick={() => setScreen('prices')}
          className="group text-left rtl:text-right bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-800 rounded-xl p-4 shadow-xs transition-all focus:outline-none flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors">
                <Tag className="w-5 h-5" />
              </div>
              <ArrowIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
            </div>
            <div className="text-base font-black text-slate-900">
              4. {t('priceManagement')}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
              {language === 'ur' ? 'سلائی ریٹ لسٹ' : 'Garment stitching price list'}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
