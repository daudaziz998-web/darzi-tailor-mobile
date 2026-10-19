import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { OrderPaymentRecord, PaymentTransaction } from '../types';
import { getCustomerCurrentBills } from '../utils/balance';
import { 
  CreditCard, 
  Search, 
  DollarSign, 
  X,
  History,
  CheckCircle2
} from 'lucide-react';

export const PaymentSection: React.FC = () => {
  const { payments, recordPayment, settings, language, t } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'partial' | 'paid'>('all');

  const [activePaymentRecord, setActivePaymentRecord] = useState<OrderPaymentRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentTransaction['method']>('cash');
  const [paymentNote, setPaymentNote] = useState('');
  const [amountError, setAmountError] = useState('');

  const [historyModalCustomerId, setHistoryModalCustomerId] = useState<string | null>(null);

  // Group orders by customer: each customer has ONE current bill, older orders remain in history
  const { currentBills, pastOrdersByCustomer } = useMemo(() => {
    return getCustomerCurrentBills(payments);
  }, [payments]);

  const totalBilled = payments.reduce((sum, p) => sum + (Number(p.totalPrice) || 0), 0);
  const totalCollected = payments.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
  const totalPending = currentBills.reduce((sum, b) => sum + (Number(b.remainingAmount) || 0), 0);

  const filteredPayments = useMemo(() => {
    return currentBills.filter((p) => {
      const matchSearch =
        p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.orderSummary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [currentBills, searchTerm, statusFilter]);

  const handleOpenReceiveModal = (record: OrderPaymentRecord) => {
    setActivePaymentRecord(record);
    setPaymentAmount(record.remainingAmount.toString());
    setPaymentNote(language === 'ur' ? 'بقایا وصولی' : 'Balance payment');
    setAmountError('');
  };

  const handleCloseModal = () => {
    setActivePaymentRecord(null);
    setPaymentAmount('');
    setPaymentNote('');
    setAmountError('');
  };

  const handleConfirmReceivePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentRecord) return;

    const amt = Number(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      setAmountError(language === 'ur' ? 'درست رقم درج کریں' : 'Please enter a valid amount');
      return;
    }

    if (amt > activePaymentRecord.remainingAmount) {
      setAmountError(
        language === 'ur'
          ? `رقم بقایا (${settings.currency} ${activePaymentRecord.remainingAmount}) سے زیادہ نہیں ہوسکتی`
          : `Amount cannot exceed balance of ${settings.currency} ${activePaymentRecord.remainingAmount}`
      );
      return;
    }

    await recordPayment(
      activePaymentRecord.orderId,
      activePaymentRecord.customerId,
      amt,
      paymentMethod,
      paymentNote
    );
    handleCloseModal();
  };

  return (
    <div className="space-y-3 pb-8">
      {/* 3 Compact Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">{t('totalBilled')}</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
            {settings.currency} {totalBilled.toLocaleString()}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase">{t('totalCollected')}</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-0.5">
            {settings.currency} {totalCollected.toLocaleString()}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-[11px] font-bold text-rose-700 uppercase">{t('totalPending')}</div>
          <div className="text-xl sm:text-2xl font-black text-rose-700 font-mono mt-0.5">
            {settings.currency} {totalPending.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 start-0 flex items-center ps-2.5 pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ur' ? 'گاہک یا آرڈر تلاش کریں...' : 'Search customer or garment...'}
            className="w-full text-xs ps-8 pe-6 py-1.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded outline-none h-8 font-medium"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 end-0 flex items-center pe-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 text-xs font-bold rounded ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            {t('filterAll')}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-2.5 py-1 text-xs font-bold rounded ${
              statusFilter === 'pending' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600'
            }`}
          >
            {t('filterPending')}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('partial')}
            className={`px-2.5 py-1 text-xs font-bold rounded ${
              statusFilter === 'partial' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'text-slate-600'
            }`}
          >
            {t('filterPartial')}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('paid')}
            className={`px-2.5 py-1 text-xs font-bold rounded ${
              statusFilter === 'paid' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
            }`}
          >
            {t('filterPaid')}
          </button>
        </div>
      </div>

      {/* Orders & Payments Table (Mobile Cards + Desktop Table) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Mobile Card List (sm:hidden) */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filteredPayments.map((p) => {
            const prev = Number(p.previousBalance) || 0;
            const due = Number(p.totalDue) || (Number(p.totalPrice) + prev);
            const hasPending = p.remainingAmount > 0;
            return (
              <div key={p.id} className="p-3 space-y-2.5">
                {/* Header: Customer, Order, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-black text-sm text-slate-900 truncate">{p.customerName}</div>
                    <div className="text-xs text-slate-700 font-medium truncate">{p.orderSummary}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-mono">{p.date}</span>
                      {pastOrdersByCustomer.get(p.customerId) && pastOrdersByCustomer.get(p.customerId)!.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setHistoryModalCustomerId(p.customerId)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded transition-colors"
                        >
                          <History className="w-2.5 h-2.5 text-amber-600" />
                          <span>
                            {pastOrdersByCustomer.get(p.customerId)!.length} {language === 'ur' ? 'سابقہ آرڈر' : 'past'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                    p.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : p.status === 'partial'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {p.status === 'paid' ? t('statusPaid') : p.status === 'partial' ? t('statusPartial') : t('statusPending')}
                  </span>
                </div>

                {/* Financial breakdown */}
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

                {/* Receive Payment Action Button */}
                {hasPending ? (
                  <button
                    type="button"
                    onClick={() => handleOpenReceiveModal(p)}
                    className="w-full py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <span>{t('receivePaymentBtn')}</span>
                    <span className="font-mono">({settings.currency} {Number(p.remainingAmount).toLocaleString()})</span>
                  </button>
                ) : (
                  <div className="text-emerald-700 text-xs font-bold flex items-center justify-center gap-1 py-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('statusPaid')}</span>
                  </div>
                )}
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
                <th className="py-2 px-3">Order / Garment</th>
                <th className="py-2 px-3 text-end">{t('orderTotal')}</th>
                <th className="py-2 px-3 text-end">{t('previousBalance')}</th>
                <th className="py-2 px-3 text-end">{t('totalDue')}</th>
                <th className="py-2 px-3 text-end">{t('paidAmount')}</th>
                <th className="py-2 px-3 text-end">{t('remainingAmount')}</th>
                <th className="py-2 px-3 text-center">{t('paymentStatus')}</th>
                <th className="py-2 px-3 text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => {
                const prev = Number(p.previousBalance) || 0;
                const due = Number(p.totalDue) || (Number(p.totalPrice) + prev);
                const hasPending = p.remainingAmount > 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-900">
                      {p.customerName}
                    </td>
                    <td className="py-2 px-3 text-slate-700">
                      <div className="font-medium text-slate-900">{p.orderSummary}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-mono">{p.date}</span>
                        {pastOrdersByCustomer.get(p.customerId) && pastOrdersByCustomer.get(p.customerId)!.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setHistoryModalCustomerId(p.customerId)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded transition-colors"
                            title={language === 'ur' ? 'سابقہ آرڈر تاریخ' : 'View past order history'}
                          >
                            <History className="w-2.5 h-2.5 text-amber-600" />
                            <span>
                              {pastOrdersByCustomer.get(p.customerId)!.length}{' '}
                              {language === 'ur' ? 'سابقہ آرڈر' : 'past orders'}
                            </span>
                          </button>
                        )}
                      </div>
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
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        p.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {p.status === 'paid' ? t('statusPaid') : p.status === 'partial' ? t('statusPartial') : t('statusPending')}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-end">
                      {hasPending ? (
                        <button
                          type="button"
                          onClick={() => handleOpenReceiveModal(p)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-xs transition-colors"
                        >
                          {t('receivePaymentBtn')}
                        </button>
                      ) : (
                        <span className="text-emerald-700 text-xs font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Paid</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receive Payment Modal */}
      {activePaymentRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-300 w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>{t('recordPaymentTitle')}</span>
              </div>
              <button type="button" onClick={handleCloseModal} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReceivePayment} className="p-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 text-sm">{activePaymentRecord.customerName}</div>
                <div className="text-slate-600">{activePaymentRecord.orderSummary}</div>
                
                <div className="pt-2 mt-1 border-t border-slate-200 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>{t('orderTotal')}:</span>
                    <span>{settings.currency} {Number(activePaymentRecord.totalPrice).toLocaleString()}</span>
                  </div>
                  {Number(activePaymentRecord.previousBalance) > 0 && (
                    <div className="flex justify-between text-amber-900 font-semibold">
                      <span>{t('previousBalance')}:</span>
                      <span>{settings.currency} {Number(activePaymentRecord.previousBalance).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-indigo-950">
                    <span>{t('totalDue')}:</span>
                    <span>{settings.currency} {Number(activePaymentRecord.totalDue || (activePaymentRecord.totalPrice + (activePaymentRecord.previousBalance || 0))).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>{t('paidAmount')}:</span>
                    <span>{settings.currency} {Number(activePaymentRecord.paidAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-black text-rose-700 text-xs pt-1 border-t border-slate-200">
                    <span>{t('remainingAmount')}:</span>
                    <span>{settings.currency} {Number(activePaymentRecord.remainingAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {amountError && (
                <div className="p-2 bg-rose-50 border border-rose-300 rounded text-rose-800 font-bold">
                  {amountError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {t('enterAmountToPay')} ({settings.currency})
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={activePaymentRecord.remainingAmount}
                  value={paymentAmount}
                  onChange={(e) => {
                    setPaymentAmount(e.target.value);
                    setAmountError('');
                  }}
                  className="w-full text-xl font-mono font-black px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded outline-none h-9"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {t('paymentMethod')}
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {(['cash', 'jazzcash', 'easypaisa', 'bank'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-1.5 text-center rounded font-bold uppercase text-[10px] border transition-colors ${
                        paymentMethod === m
                          ? 'bg-amber-500 text-slate-950 border-amber-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {t('paymentNote')}
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder={t('paymentNotePlaceholder')}
                  className="w-full px-2.5 py-1 bg-slate-50 border border-slate-300 rounded outline-none h-8 text-xs"
                />
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
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded shadow-xs"
                >
                  {t('confirmPayment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Past Orders History Modal */}
      {historyModalCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-300 w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <History className="w-4 h-4 text-amber-400" />
                <span>
                  {language === 'ur' ? 'سابقہ آرڈر و ادائیگی تاریخ' : 'Past Order & Payment History'} - {payments.find(p => p.customerId === historyModalCustomerId)?.customerName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalCustomerId(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs max-h-[70vh] overflow-y-auto">
              <p className="text-[11px] text-slate-500">
                {language === 'ur' 
                  ? 'یہ گاہک کے تمام سابقہ آرڈرز کا محفوظ ریکارڈ ہے:'
                  : 'Permanently saved historical orders for this customer:'}
              </p>

              <table className="w-full text-left rtl:text-right border-collapse text-xs border border-slate-200 rounded">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2 px-2.5">Date</th>
                    <th className="py-2 px-2.5">Order</th>
                    <th className="py-2 px-2.5 text-end">{t('orderTotal')}</th>
                    <th className="py-2 px-2.5 text-end">{t('previousBalance')}</th>
                    <th className="py-2 px-2.5 text-end">{t('totalDue')}</th>
                    <th className="py-2 px-2.5 text-end">{t('paidAmount')}</th>
                    <th className="py-2 px-2.5 text-end">{t('remainingAmount')}</th>
                    <th className="py-2 px-2.5 text-center">{t('paymentStatus')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments
                    .filter((p) => p.customerId === historyModalCustomerId)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((p, idx) => (
                      <tr key={p.id} className={idx === 0 ? 'bg-amber-50/50 font-bold' : ''}>
                        <td className="py-2 px-2.5 font-mono text-slate-500 whitespace-nowrap">
                          {p.date}
                          {idx === 0 && (
                            <span className="ms-1 text-[9px] bg-amber-500 text-slate-950 px-1 py-0.2 rounded font-black uppercase">
                              Current
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2.5 text-slate-800">{p.orderSummary}</td>
                        <td className="py-2 px-2.5 text-end font-mono font-bold">{settings.currency} {Number(p.totalPrice).toLocaleString()}</td>
                        <td className="py-2 px-2.5 text-end font-mono text-amber-900">{Number(p.previousBalance) > 0 ? `${settings.currency} ${Number(p.previousBalance).toLocaleString()}` : '-'}</td>
                        <td className="py-2 px-2.5 text-end font-mono font-black text-indigo-900">{settings.currency} {Number(p.totalDue || (p.totalPrice + (p.previousBalance || 0))).toLocaleString()}</td>
                        <td className="py-2 px-2.5 text-end font-mono font-bold text-emerald-700">{settings.currency} {Number(p.paidAmount).toLocaleString()}</td>
                        <td className="py-2 px-2.5 text-end font-mono font-black text-rose-700">{settings.currency} {Number(p.remainingAmount).toLocaleString()}</td>
                        <td className="py-2 px-2.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                            p.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setHistoryModalCustomerId(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded text-xs"
                >
                  {language === 'ur' ? 'بند کریں' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
