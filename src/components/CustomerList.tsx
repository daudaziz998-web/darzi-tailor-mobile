import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { 
  UserPlus, 
  Search, 
  Phone, 
  MapPin, 
  User, 
  Ruler, 
  CreditCard, 
  Edit3, 
  Trash2, 
  Printer,
  X 
} from 'lucide-react';
import { AddCustomerModal } from './AddCustomerModal';

export const CustomerList: React.FC = () => {
  const { 
    customers, 
    measurements, 
    payments, 
    setScreen, 
    deleteCustomer, 
    openPrintModal,
    language, 
    t 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  // Search by Name or Phone
  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.phone.replace(/\s+/g, '').includes(term.replace(/\s+/g, ''))
    );
  }, [customers, searchTerm]);

  const handleDelete = async (customer: Customer) => {
    if (window.confirm(t('confirmDeleteCustomer'))) {
      await deleteCustomer(customer.id);
    }
  };

  return (
    <div className="space-y-3 pb-8">
      {/* Top Compact Bar: Search and + Add Customer */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchCustomerPlaceholder')}
            className="w-full text-xs sm:text-sm ps-9 pe-8 py-1.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-lg outline-none h-9 font-medium"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 end-0 flex items-center pe-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Add Customer Button */}
        <button
          type="button"
          onClick={() => {
            setCustomerToEdit(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('addNewCustomer')}</span>
        </button>
      </div>

      {/* Compact Customers Table / Cards */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-black uppercase text-slate-700">
            {t('allCustomers')} ({filteredCustomers.length})
          </span>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            {t('noCustomersFound')}
          </div>
        ) : (
          <div>
            {/* Mobile Card List (sm:hidden) */}
            <div className="sm:hidden divide-y divide-slate-100">
              {filteredCustomers.map((cust) => {
                const custMeas = measurements.filter((m) => m.customerId === cust.id);
                const custPays = payments.filter((p) => p.customerId === cust.id);
                const due = custPays.reduce((sum, p) => sum + (Number(p.remainingAmount) || 0), 0);
                const latestMeas = custMeas[0];

                return (
                  <div key={cust.id} className="p-3 space-y-2.5">
                    {/* Header: Name, Phone & Due */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setScreen('customer-profile', cust.id)}
                          className="font-black text-sm text-slate-900 hover:text-amber-600 text-start block truncate"
                        >
                          {cust.name}
                        </button>
                        <div className="text-xs font-mono font-bold text-slate-600 flex items-center gap-1 mt-0.5">
                          <span>{cust.phone}</span>
                          {cust.address && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="text-slate-500 font-sans truncate max-w-[140px]">{cust.address}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-end shrink-0">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          due > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-50 text-slate-500'
                        }`}>
                          {payments[0]?.totalPrice !== undefined ? `Rs. ${due.toLocaleString()}` : '-'}
                        </span>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {custMeas.length} {language === 'ur' ? 'ناپ' : 'sizes'}
                        </div>
                      </div>
                    </div>

                    {/* Responsive Actions Row */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setScreen('customer-profile', cust.id)}
                        className="flex-1 py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded text-xs text-center transition-colors"
                      >
                        {t('viewCustomer')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setScreen('measurement', cust.id)}
                        className="flex-1 py-1 px-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-xs text-center transition-colors"
                      >
                        {latestMeas ? t('measurementsBtn') : `+ ${t('measurementsBtn')}`}
                      </button>
                      {latestMeas && (
                        <button
                          type="button"
                          onClick={() => openPrintModal(latestMeas)}
                          className="py-1 px-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded text-xs transition-colors shrink-0"
                          title={t('printBtn')}
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerToEdit(cust);
                          setIsAddModalOpen(true);
                        }}
                        className="p-1 text-slate-500 hover:text-slate-800 rounded shrink-0"
                        title={t('editBtn')}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cust)}
                        className="p-1 text-rose-500 hover:text-rose-700 rounded shrink-0"
                        title={t('deleteBtn')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (hidden sm:block) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] bg-slate-50/50">
                    <th className="py-2 px-3">{t('customerName')}</th>
                    <th className="py-2 px-3">{t('phoneNumber')}</th>
                    <th className="py-2 px-3">{t('address')}</th>
                    <th className="py-2 px-3 text-center">{t('measurements')}</th>
                    <th className="py-2 px-3 text-end">{t('remainingAmount')}</th>
                    <th className="py-2 px-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((cust) => {
                    const custMeas = measurements.filter((m) => m.customerId === cust.id);
                    const custPays = payments.filter((p) => p.customerId === cust.id);
                    const due = custPays.reduce((sum, p) => sum + (Number(p.remainingAmount) || 0), 0);
                    const latestMeas = custMeas[0];

                    return (
                      <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 font-bold text-slate-900">
                          {cust.name}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-700 font-semibold">
                          {cust.phone}
                        </td>
                        <td className="py-2 px-3 text-slate-600 truncate max-w-[200px]">
                          {cust.address || '-'}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-slate-700">
                          {custMeas.length}
                        </td>
                        <td className="py-2 px-3 text-end font-mono font-bold">
                          <span className={due > 0 ? 'text-rose-700' : 'text-slate-400'}>
                            {payments[0]?.totalPrice !== undefined ? `Rs. ${due.toLocaleString()}` : '-'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-end space-x-1 rtl:space-x-reverse whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setScreen('customer-profile', cust.id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded text-[11px]"
                            title={t('viewCustomer')}
                          >
                            {t('viewCustomer')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setScreen('measurement', cust.id)}
                            className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[11px]"
                            title={t('measurementsBtn')}
                          >
                            {latestMeas ? t('measurementsBtn') : `+ ${t('measurementsBtn')}`}
                          </button>
                          {latestMeas && (
                            <button
                              type="button"
                              onClick={() => openPrintModal(latestMeas)}
                              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-[11px]"
                              title={t('printBtn')}
                            >
                              <Printer className="w-3.5 h-3.5 inline-block -mt-0.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setCustomerToEdit(cust);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800 rounded"
                            title={t('editBtn')}
                          >
                            <Edit3 className="w-3.5 h-3.5 inline-block" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cust)}
                            className="p-1 text-rose-500 hover:text-rose-700 rounded"
                            title={t('deleteBtn')}
                          >
                            <Trash2 className="w-3.5 h-3.5 inline-block" />
                          </button>
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

      {/* Add / Edit Customer Modal */}
      {isAddModalOpen && (
        <AddCustomerModal
          customerToEdit={customerToEdit}
          onClose={() => {
            setIsAddModalOpen(false);
            setCustomerToEdit(null);
          }}
        />
      )}
    </div>
  );
};
