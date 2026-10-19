import React from 'react';
import { useApp } from '../context/AppContext';
import { Customer, OrderPaymentRecord, PrintFormat } from '../types';
import { Printer, X, Scissors, Phone, MapPin, Calendar, FileText, Check } from 'lucide-react';

export const PrintPreviewModal: React.FC = () => {
  const { 
    activePrintRecord, 
    activePrintFormat, 
    setActivePrintFormat, 
    closePrintModal, 
    customers, 
    payments, 
    settings, 
    customMeasurementDefinitions,
    language, 
    t 
  } = useApp();

  if (!activePrintRecord) return null;

  const customer: Customer | undefined = customers.find(
    (c) => c.id === activePrintRecord.customerId
  );

  const payment: OrderPaymentRecord | undefined = 
    payments.find((p) => p.id === activePrintRecord.id || p.orderId === 'ord-' + activePrintRecord.id || p.measurementId === activePrintRecord.id) ||
    payments.filter((p) => p.customerId === activePrintRecord.customerId).sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
      return timeB - timeA;
    })[0];

  const handlePrint = () => {
    window.print();
  };

  const m = activePrintRecord.measurements;

  // The primary handwritten slip measurements
  const baseMeasurementRows = [
    { key: 'totalLength', en: 'Length', ur: 'لمبائی', val: m.totalLength || (m as any).lambai || '', opt: m.damanStyle === 'round' ? 'گول لامن' : 'سادہ لامن' },
    { key: 'sleeveLength', en: 'Sleeve', ur: 'بازو', val: m.sleeveLength || (m as any).bazu || '', opt: m.cuffStyle === 'round' ? 'گول کف' : m.cuffStyle === 'open' ? 'کھلا بازو' : 'سادہ کف' },
    { key: 'tira', en: 'Tira', ur: 'تیرا', val: m.tira || m.shoulder || '', opt: '' },
    { key: 'collar', en: 'Collar', ur: 'کالر', val: m.collar || m.neck || '', opt: m.collarStyle === 'collar' ? 'کالر (Collar)' : 'بین (BAN)' },
    { key: 'chati', en: 'Chest', ur: 'چھاتی', val: m.chati || m.chest || '', opt: '' },
    { key: 'chodai', en: 'Width', ur: 'چوڑائی', val: m.chodai || m.waist || '', opt: '' },
    { key: 'ghera', en: 'Ghera', ur: 'گھیرا', val: m.ghera || m.backWidth || '', opt: '' },
    { key: 'shalwar', en: 'Shalwar', ur: 'شلوار', val: m.shalwar || '', opt: m.shalwarPocket === 'yes' ? 'شلوار جیب: ہاں' : 'شلوار جیب: نہیں' },
    { key: 'paancha', en: 'Paancha', ur: 'پانچہ', val: m.paancha || m.bottom || '', opt: '' },
  ];

  // Seamlessly integrate custom measurements as first-class measurements
  const customRows = (activePrintRecord.customMeasurements || []).map((cm) => {
    const def = customMeasurementDefinitions.find(
      (d) => d.name.trim().toLowerCase() === cm.name.trim().toLowerCase()
    );
    return {
      key: cm.id,
      en: def?.name || cm.name,
      ur: def?.nameUr || cm.name,
      val: cm.value,
      opt: cm.notes || '',
    };
  });

  const allMeasurementRows = [...baseMeasurementRows, ...customRows];

  const isUrdu = language === 'ur';

  // Dedicated one-option-per-line Tailoring Details (clean single-language format)
  const tailoringOptions: Array<{ label: string; val: string }> = [];

  // 1. Daman Style (always first)
  tailoringOptions.push({
    label: isUrdu ? 'دامن اسٹائل' : 'Daman Style',
    val: isUrdu
      ? (m.damanStyle === 'round' ? 'گول لامن' : 'سادہ لامن')
      : (m.damanStyle === 'round' ? 'Round' : 'Simple'),
  });

  // 2. Sleeve Cuff Style
  tailoringOptions.push({
    label: isUrdu ? 'کف اسٹائل' : 'Sleeve Cuff Style',
    val: isUrdu
      ? (m.cuffStyle === 'round' ? 'گول کف' : m.cuffStyle === 'open' ? 'کھلا بازو' : 'سادہ کف')
      : (m.cuffStyle === 'round' ? 'Round Cuff' : m.cuffStyle === 'open' ? 'Open Sleeve' : 'Simple Cuff'),
  });

  // 3. Collar Style
  tailoringOptions.push({
    label: isUrdu ? 'کالر اسٹائل' : 'Collar Style',
    val: isUrdu
      ? (m.collarStyle === 'collar' ? 'کالر' : 'بین (BAN)')
      : (m.collarStyle === 'collar' ? 'Collar' : 'Bain (BAN)'),
  });

  // 4. Front Pocket - show Yes/ہاں only when selected; if not selected ('no'), do not print
  if (m.frontPocket && m.frontPocket !== 'no') {
    tailoringOptions.push({
      label: isUrdu ? 'سامنے جیب' : 'Front Pocket',
      val: isUrdu ? 'ہاں' : 'Yes',
    });
  }

  // 5. Side Pocket - show selected quantity; if not selected ('none'), do not print
  if (m.sidePocket && m.sidePocket !== 'none') {
    tailoringOptions.push({
      label: isUrdu ? 'سائیڈ جیب' : 'Side Pocket',
      val: isUrdu
        ? (m.sidePocket === 'two' ? '2 جیبیں' : '1 جیب')
        : (m.sidePocket === 'two' ? '2 Pockets' : '1 Pocket'),
    });
  }

  // 6. Shalwar Pocket - show Yes/ہاں only when selected; if not selected, do not print
  if (m.shalwarPocket === 'yes') {
    tailoringOptions.push({
      label: isUrdu ? 'شلوار جیب' : 'Shalwar Pocket',
      val: isUrdu ? 'ہاں' : 'Yes',
    });
  }

  // 7. Coat Style - show only if selected and not 'none'
  if (m.coatStyle && m.coatStyle !== 'none') {
    tailoringOptions.push({
      label: isUrdu ? 'کوٹ اسٹائل' : 'Coat Style',
      val: isUrdu
        ? (m.coatStyle === 'shiny' ? 'چمکدار' : 'سادہ')
        : (m.coatStyle === 'shiny' ? 'Shiny' : 'Simple'),
    });
  }

  // 8. Button Style - clean single language
  if (m.buttonType) {
    tailoringOptions.push({
      label: isUrdu ? 'بٹن اسٹائل' : 'Button Style',
      val: isUrdu
        ? (m.buttonType === 'fancy' ? 'فینسی بٹن' : m.buttonType === 'metal' ? 'میٹل بٹن' : m.buttonType === 'fabric' ? 'دھاگہ / ٹانکا' : 'سادہ بٹن')
        : (m.buttonType === 'fancy' ? 'Fancy' : m.buttonType === 'metal' ? 'Metal' : m.buttonType === 'fabric' ? 'Fabric' : 'Simple'),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-4 bg-slate-950/85 backdrop-blur-xs overflow-hidden">
      <div className="bg-white rounded-xl border border-slate-300 w-full max-w-4xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[96vh]">
        {/* Modal Controls Bar (Hidden in print) - Responsive and guaranteed visible on narrow mobile */}
        <div className="bg-slate-900 text-white p-2.5 sm:px-4 sm:py-2.5 no-print shrink-0 border-b border-slate-800 space-y-2">
          {/* Top Row: Title + Accessible Close Button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-bold text-xs sm:text-sm truncate">
                {t('printPreviewTitle')}
              </span>
            </div>
            <button
              type="button"
              onClick={closePrintModal}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
              title="Close"
            >
              <span className="text-[11px] sm:hidden">Close</span>
              <X className="w-4 h-4 shrink-0" />
            </button>
          </div>

          {/* Bottom Row / Wrap Row: Format Selector + Prominent Print Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
            {/* Format Selector: Thermal 58mm, Thermal 80mm, A4 Sheet */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setActivePrintFormat('thermal-58')}
                className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                  activePrintFormat === 'thermal-58'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                58mm
              </button>
              <button
                type="button"
                onClick={() => setActivePrintFormat('thermal-80')}
                className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                  activePrintFormat === 'thermal-80'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                80mm
              </button>
              <button
                type="button"
                onClick={() => setActivePrintFormat('a4')}
                className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                  activePrintFormat === 'a4'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                A4 Sheet
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs sm:text-sm shadow-xs transition-colors shrink-0"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span>{t('printMeasurement')}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Preview Container */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100 flex justify-center items-start flex-1">
          {/* FORMAT 1 & 2: Thermal Receipt (58mm or 80mm) */}
          {(activePrintFormat === 'thermal-58' || activePrintFormat === 'thermal-80') && (
            <div
              className={`bg-white text-black p-4 shadow-md font-mono text-xs border border-slate-300 mx-auto print-receipt ${
                activePrintFormat === 'thermal-58' ? 'max-w-[280px] w-full text-[11px]' : 'max-w-[360px] w-full text-xs'
              }`}
              id="printable-thermal"
            >
              {/* Thermal Header */}
              <div className="text-center border-b border-black pb-2 mb-2">
                <div className="font-black text-sm uppercase tracking-wide">
                  {settings.shopNameEn}
                </div>
                <div className="font-bold text-xs">{settings.shopNameUr}</div>
                <div className="text-[10px] mt-0.5">{settings.location}</div>
                <div className="text-[10px]">Ph: {settings.phone}</div>
                <div className="text-[9px] uppercase mt-1 tracking-widest border-t border-dotted border-black pt-1">
                  *** MEASUREMENT SLIP ***
                </div>
              </div>

              {/* Customer Box */}
              <div className="border-b border-dashed border-black pb-1.5 mb-2 text-[11px]">
                <div className="flex justify-between font-bold">
                  <span>CUST:</span>
                  <span className="truncate max-w-[180px]">{customer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>TEL:</span>
                  <span>{customer?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{activePrintRecord.date}</span>
                </div>
                {activePrintRecord.deliveryDate && (
                  <div className="flex justify-between font-bold">
                    <span>DELIVERY:</span>
                    <span>{activePrintRecord.deliveryDate}</span>
                  </div>
                )}
              </div>

              {/* Measurements in Clean Tabular Thermal Format */}
              <div className="border-b border-black pb-2 mb-2">
                <div className="font-bold text-[10px] uppercase border-b border-dotted border-black pb-0.5 mb-1 flex justify-between">
                  <span>MEASUREMENT</span>
                  <span>SIZE ({settings.unit})</span>
                </div>
                <div className="space-y-1">
                  {allMeasurementRows.map((row) => (
                    <div key={row.key} className="flex justify-between items-baseline border-b border-dotted border-slate-200 pb-0.5">
                      <div>
                        <span className="font-bold">{row.ur}</span> <span className="text-[10px] text-slate-500 uppercase">({row.en})</span>
                        {row.opt && <span className="block text-[10px] text-amber-900 font-semibold">{row.opt}</span>}
                      </div>
                      <span className="font-black text-sm">{row.val || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tailoring & Styling Details in Thermal - One detail per line */}
              {tailoringOptions.length > 0 && (
                <div className="border-b border-black pb-2 mb-2 text-[11px]">
                  <div className="font-bold uppercase text-[10px] mb-1.5 border-b border-dotted border-black pb-0.5">
                    {isUrdu ? 'سلائی کی ترجیحات' : 'TAILORING DETAILS'}
                  </div>
                  <div className="space-y-1">
                    {tailoringOptions.map((opt, i) => (
                      <div key={i} className="flex justify-between items-baseline border-b border-dotted border-slate-200 pb-0.5">
                        <span className="font-semibold text-slate-800">{opt.label}:</span>
                        <span className="font-bold text-end shrink-0 ps-2">{opt.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Garments / Order details */}
              {activePrintRecord.clothingItems && activePrintRecord.clothingItems.length > 0 && (
                <div className="border-b border-black pb-2 mb-2 text-[11px]">
                  <div className="font-bold uppercase text-[10px] mb-1">GARMENTS:</div>
                  {activePrintRecord.clothingItems.map((ci) => (
                    <div key={ci.id} className="mb-1">
                      <div className="flex justify-between font-bold">
                        <span>{ci.quantity}x {ci.clothingType}</span>
                        <span>{settings.currency} {ci.total}</span>
                      </div>
                      {ci.specialInstructions && (
                        <div className="text-[10px] italic">Note: {ci.specialInstructions}</div>
                      )}
                    </div>
                  ))}
                  {payment && (
                    <div className="border-t border-dotted border-black pt-1 mt-1 text-[11px]">
                      <div className="flex justify-between">
                        <span>ORDER:</span>
                        <span className="font-bold">{settings.currency} {Number(payment.totalPrice).toLocaleString()}</span>
                      </div>
                      {payment.previousBalance !== undefined && payment.previousBalance > 0 && (
                        <div className="flex justify-between">
                          <span>PREV BAL:</span>
                          <span className="font-bold">{settings.currency} {Number(payment.previousBalance).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold">
                        <span>TOTAL DUE:</span>
                        <span>{settings.currency} {Number(payment.totalDue || (payment.totalPrice + (payment.previousBalance || 0))).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PAID:</span>
                        <span>{settings.currency} {Number(payment.paidAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-black text-xs">
                        <span>BAL DUE:</span>
                        <span>{settings.currency} {Number(payment.remainingAmount).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Thermal Footer */}
              <div className="text-center text-[10px] pt-1">
                <div>Awais Tailor House</div>
                <div>Thank you for your trust!</div>
              </div>
            </div>
          )}

          {/* FORMAT 3: Full Professional A4 Sheet */}
          {activePrintFormat === 'a4' && (
            <div
              className="bg-white text-slate-900 p-8 shadow-md border border-slate-300 w-full max-w-[800px] mx-auto print-a4 font-sans text-sm"
              id="printable-a4"
            >
              {/* A4 Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Scissors className="w-5 h-5 text-amber-600" />
                  <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                    {settings.shopNameEn}
                  </h1>
                </div>
                <div className="text-lg font-bold text-amber-950">{settings.shopNameUr}</div>
                <div className="text-xs text-slate-600 flex items-center justify-center gap-3 mt-1 font-medium">
                  <span>{settings.location}</span>
                  <span>·</span>
                  <span>Phone: {settings.phone}</span>
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-700 bg-slate-100 inline-block px-4 py-0.5 rounded mt-2 border border-slate-300">
                  TAILOR MEASUREMENT SHEET / ناپ پرچی
                </div>
              </div>

              {/* Customer Box */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200 mb-4 text-xs">
                <div>
                  <div className="font-bold text-slate-500 uppercase text-[10px]">Customer Information</div>
                  <div className="text-base font-black text-slate-900">{customer?.name}</div>
                  <div className="font-mono text-slate-700 font-bold">{customer?.phone}</div>
                  <div className="text-slate-600">{customer?.address || settings.location}</div>
                </div>
                <div className="text-end">
                  <div className="font-bold text-slate-500 uppercase text-[10px]">Order Details</div>
                  <div className="font-bold">Record Date: <span className="font-mono">{activePrintRecord.date}</span></div>
                  {activePrintRecord.deliveryDate && (
                    <div className="font-bold text-amber-900">Delivery: <span className="font-mono">{activePrintRecord.deliveryDate}</span></div>
                  )}
                  {activePrintRecord.title && (
                    <div className="text-slate-600">{activePrintRecord.title}</div>
                  )}
                </div>
              </div>

              {/* Garment Measurements */}
              <div className="mb-4">
                <div className="text-xs font-black text-slate-900 uppercase border-b-2 border-slate-300 pb-1 mb-2 flex justify-between">
                  <span>Garment Measurements ({settings.unit})</span>
                  <span>پیمائش و ناپ تفصیلات</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-3">
                  {allMeasurementRows.map((row) => (
                    <div key={row.key} className="border border-slate-200 p-2 rounded-lg bg-slate-50/70 flex items-center justify-between">
                      <div>
                        <div className="font-black text-slate-900 text-sm">{row.ur}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{row.en}</div>
                        {row.opt && <div className="text-[10px] font-bold text-amber-800 mt-0.5">{row.opt}</div>}
                      </div>
                      <div className="font-mono font-black text-lg text-slate-900">
                        {row.val || '-'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tailoring & Styling Details - One option per line */}
                {tailoringOptions.length > 0 && (
                  <div className="bg-white p-3 rounded-lg border border-slate-300 text-xs">
                    <div className="font-bold text-xs uppercase tracking-wide mb-2 border-b border-slate-300 pb-1 text-slate-900">
                      {isUrdu ? 'سلائی کی ترجیحات' : 'TAILORING DETAILS'}
                    </div>
                    <div className="divide-y divide-slate-200">
                      {tailoringOptions.map((opt, i) => (
                        <div key={i} className="flex items-center justify-between py-1 text-xs">
                          <span className="font-bold text-slate-700">{opt.label}:</span>
                          <span className="font-black text-slate-900 font-mono text-end">{opt.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Clothing Items & Financials */}
              {activePrintRecord.clothingItems && activePrintRecord.clothingItems.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs font-black text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2">
                    Garments & Stitching Bill / کپڑے اور بل
                  </div>
                  <table className="w-full text-xs text-left rtl:text-right border-collapse mb-2">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600 font-bold">
                        <th className="py-1">Garment</th>
                        <th className="py-1 text-center">Qty</th>
                        <th className="py-1 text-end">Rate</th>
                        <th className="py-1 text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activePrintRecord.clothingItems.map((ci) => (
                        <tr key={ci.id}>
                          <td className="py-1 font-bold">
                            {ci.clothingType}
                            {ci.specialInstructions && (
                              <span className="text-[10px] text-slate-500 font-normal block">
                                {ci.specialInstructions}
                              </span>
                            )}
                          </td>
                          <td className="py-1 text-center font-mono">{ci.quantity}</td>
                          <td className="py-1 text-end font-mono">{settings.currency} {ci.price}</td>
                          <td className="py-1 text-end font-mono font-bold">{settings.currency} {ci.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {payment && (
                    <div className="bg-slate-900 text-white p-2.5 rounded-lg flex flex-wrap justify-between items-center text-xs font-mono gap-2">
                      <span>Order: {settings.currency} {Number(payment.totalPrice).toLocaleString()}</span>
                      {payment.previousBalance !== undefined && payment.previousBalance > 0 && (
                        <span>Prev Bal: {settings.currency} {Number(payment.previousBalance).toLocaleString()}</span>
                      )}
                      <span className="font-bold text-amber-300">Total Due: {settings.currency} {Number(payment.totalDue || (payment.totalPrice + (payment.previousBalance || 0))).toLocaleString()}</span>
                      <span className="text-emerald-300">Paid: {settings.currency} {Number(payment.paidAmount).toLocaleString()}</span>
                      <span className="text-amber-400 font-black">Bal Due: {settings.currency} {Number(payment.remainingAmount).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Signatures (Section 12 requirement) */}
              <div className="grid grid-cols-2 gap-8 pt-8 mt-4 border-t border-slate-300 text-xs">
                <div className="text-center">
                  <div className="border-t border-slate-400 w-40 mx-auto mb-1"></div>
                  <div className="font-bold text-slate-700">{t('tailorSignature')}</div>
                  <div className="text-[10px] text-slate-400">Awais Tailor House</div>
                </div>

                <div className="text-center">
                  <div className="border-t border-slate-400 w-40 mx-auto mb-1"></div>
                  <div className="font-bold text-slate-700">{t('customerSignature')}</div>
                  <div className="text-[10px] text-slate-400">{customer?.name}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
