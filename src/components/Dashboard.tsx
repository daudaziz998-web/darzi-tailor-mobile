import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Ruler, 
  CreditCard, 
  Tag, 
  UserPlus, 
  Clock, 
  Phone, 
  MapPin,
  ArrowRight,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Printer
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    customers, 
    measurements, 
    payments, 
    settings, 
    setScreen, 
    openPrintModal,
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
    <div className="space-y-4">
      {/* Compact Header Bar with Quick Add Action */}
      <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
            {language === 'ur' ? 'اویس ٹیلر ہاؤس — ڈیش بورڈ' : 'Awais Tailor House — Main Dashboard'}
          </h1>
          <p className="text-xs text-slate-500">
            {settings.location} · {settings.phone}
          </p>
        </div>

        {/* Compact + Add Customer CTA */}
        <button
          type="button"
          onClick={() => setScreen('add-customer')}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('addNewCustomer')}</span>
        </button>
      </div>

      {/* 4 Compact Summary Stat Cards (Height ~60-70px, fits easily on 768px laptop screen) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Customers */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500">{t('totalCustomers')}</div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums leading-none mt-1">
              {totalCustomersCount}
            </div>
          </div>
          <div className="p-2 bg-sky-50 text-sky-700 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Total Measurements */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500">{t('totalMeasurements')}</div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums leading-none mt-1">
              {totalMeasurementsCount}
            </div>
          </div>
          <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
            <Ruler className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500">{t('pendingPayments')}</div>
            <div className="text-xl sm:text-2xl font-black text-rose-700 font-mono tabular-nums leading-none mt-1 truncate">
              {settings.currency} {pendingAmount.toLocaleString()}
            </div>
          </div>
          <div className="p-2 bg-rose-50 text-rose-700 rounded-lg">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Today's Orders */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500">{t('todayOrders')}</div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums leading-none mt-1">
              {todayOrdersCount}
            </div>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4 Main Cards: Compact Desktop Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Customers Card */}
        <button
          type="button"
          onClick={() => setScreen('customers')}
          className="group text-left rtl:text-right bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-800 rounded-xl p-3.5 shadow-xs transition-all focus:outline-none"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <ArrowIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
          </div>
          <div className="text-base font-black text-slate-900">
            1. {t('customers')}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium line-clamp-1">
            {language === 'ur' ? 'گاہک اندراج و ناپ' : 'Customer records & directory'}
          </p>
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
          className="group text-left rtl:text-right bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-800 rounded-xl p-3.5 shadow-xs transition-all focus:outline-none"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-colors">
              <Ruler className="w-5 h-5" />
            </div>
            <ArrowIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
          </div>
          <div className="text-base font-black text-slate-900">
            2. {t('measurements')}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium line-clamp-1">
            {language === 'ur' ? 'درزی ناپ اور کسٹم پیمائش' : 'Customer tailoring measurements'}
          </p>
        </button>

        {/* 3. Payments Card */}
        <button
          type="button"
          onClick={() => setScreen('payments')}
          className="group text-left rtl:text-right bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-800 rounded-xl p-3.5 shadow-xs transition-all focus:outline-none"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
              <CreditCard className="w-5 h-5" />
            </div>
            <ArrowIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
          </div>
          <div className="text-base font-black text-slate-900">
            3. {t('payments')}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium line-clamp-1">
            {language === 'ur' ? 'ادائیگی اور بقایا جات' : 'Dues ledger & cash records'}
          </p>
        </button>

        {/* 4. Price Management Card */}
        <button
          type="button"
          onClick={() => setScreen('prices')}
          className="group text-left rtl:text-right bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-800 rounded-xl p-3.5 shadow-xs transition-all focus:outline-none"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors">
              <Tag className="w-5 h-5" />
            </div>
            <ArrowIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
          </div>
          <div className="text-base font-black text-slate-900">
            4. {t('priceManagement')}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium line-clamp-1">
            {language === 'ur' ? 'سلائی ریٹ لسٹ' : 'Garment stitching price list'}
          </p>
        </button>
      </div>

      {/* Recent Customers Section: Compact Table with internal scrolling */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{t('recentCustomers')}</span>
          </div>
          <button
            type="button"
            onClick={() => setScreen('customers')}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            <span>{t('viewAllCustomers')}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {customers.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs font-medium">
            {t('noRecentCustomers')}
          </div>
        ) : (
          <div>
            {/* Mobile Card List (sm:hidden) */}
            <div className="sm:hidden divide-y divide-slate-100">
              {customers.slice(0, 5).map((cust) => {
                const custMeasurements = measurements.filter((m) => m.customerId === cust.id);
                const latestMeas = custMeasurements[0];

                return (
                  <div key={cust.id} className="py-2.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setScreen('customer-profile', cust.id)}
                          className="font-bold text-xs sm:text-sm text-slate-900 hover:text-amber-600 block truncate text-start"
                        >
                          {cust.name}
                        </button>
                        <div className="text-[11px] font-mono text-slate-600 flex items-center gap-1 mt-0.5">
                          <span>{cust.phone}</span>
                          {cust.address && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="text-slate-500 font-sans truncate max-w-[130px]">{cust.address}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                        {custMeasurements.length} {language === 'ur' ? 'ناپ' : 'sizes'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setScreen('customer-profile', cust.id)}
                        className="flex-1 py-1 px-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-center transition-colors"
                      >
                        {t('viewCustomer')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setScreen('measurement', cust.id)}
                        className="flex-1 py-1 px-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded text-center transition-colors"
                      >
                        {latestMeas ? t('measurements') : `+ ${t('measurements')}`}
                      </button>
                      {latestMeas && (
                        <button
                          type="button"
                          onClick={() => openPrintModal(latestMeas)}
                          className="p-1 px-2 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-amber-400 rounded transition-colors shrink-0"
                          title={t('printBtn')}
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (hidden sm:block) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-2 px-2.5">{t('customerName')}</th>
                    <th className="py-2 px-2.5">{t('phoneNumber')}</th>
                    <th className="py-2 px-2.5">{t('address')}</th>
                    <th className="py-2 px-2.5 text-center">{t('measurements')}</th>
                    <th className="py-2 px-2.5 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.slice(0, 5).map((cust) => {
                    const custMeasurements = measurements.filter((m) => m.customerId === cust.id);
                    const latestMeas = custMeasurements[0];

                    return (
                      <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-2.5 font-bold text-slate-900">
                          {cust.name}
                        </td>
                        <td className="py-2 px-2.5 font-mono text-slate-700">
                          {cust.phone}
                        </td>
                        <td className="py-2 px-2.5 text-slate-600 truncate max-w-[200px]">
                          {cust.address || '-'}
                        </td>
                        <td className="py-2 px-2.5 text-center font-bold text-slate-700">
                          {custMeasurements.length}
                        </td>
                        <td className="py-2 px-2.5 text-end space-x-1.5 rtl:space-x-reverse whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setScreen('customer-profile', cust.id)}
                            className="px-2 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition-colors"
                          >
                            {t('viewCustomer')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setScreen('measurement', cust.id)}
                            className="px-2 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded transition-colors"
                          >
                            {latestMeas ? t('measurements') : `+ ${t('measurements')}`}
                          </button>
                          {latestMeas && (
                            <button
                              type="button"
                              onClick={() => openPrintModal(latestMeas)}
                              className="px-2 py-1 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded transition-colors"
                              title={t('printBtn')}
                            >
                              <Printer className="w-3.5 h-3.5 inline-block -mt-0.5" />
                            </button>
                          )}
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
    </div>
  );
};
