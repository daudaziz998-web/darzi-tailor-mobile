import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CustomerList } from './components/CustomerList';
import { CustomerProfile } from './components/CustomerProfile';
import { MeasurementScreen } from './components/MeasurementScreen';
import { PaymentSection } from './components/PaymentSection';
import { PriceManagement } from './components/PriceManagement';
import { SettingsScreen } from './components/SettingsScreen';
import { CustomMeasurementsScreen } from './components/CustomMeasurementsScreen';
import { AddCustomerModal } from './components/AddCustomerModal';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { LicenseGate } from './components/LicenseGate';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    currentScreen, 
    setScreen, 
    toast, 
    activePrintRecord,
    settings,
    language,
    t
  } = useApp();

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col font-sans">
      {/* Compact Desktop Header */}
      <Header />

      {/* Main Content Area (Laptop-fitted with comfortable max-w-7xl) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {currentScreen === 'dashboard' && <Dashboard />}
        {currentScreen === 'customers' && <CustomerList />}
        {currentScreen === 'customer-profile' && <CustomerProfile />}
        {currentScreen === 'add-customer' && (
          <div className="space-y-3">
            <CustomerList />
            <AddCustomerModal onClose={() => setScreen('customers')} />
          </div>
        )}
        {currentScreen === 'measurement' && <MeasurementScreen />}
        {currentScreen === 'payments' && <PaymentSection />}
        {currentScreen === 'prices' && <PriceManagement />}
        {currentScreen === 'custom-measurements' && <CustomMeasurementsScreen />}
        {currentScreen === 'settings' && <SettingsScreen />}
      </main>

      {/* Quiet Compact Footer (No print) */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-2.5 px-4 text-xs no-print mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">
              {language === 'ur' ? settings.shopNameUr : settings.shopNameEn}
            </span>
            <span>·</span>
            <span>{settings.location}</span>
            <span>·</span>
            <span className="font-mono">{settings.phone}</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Awais Tailor House — Tailor Shop Management System
          </div>
        </div>
      </footer>

      {/* Global Toast Alert */}
      {toast && (
        <div className="fixed bottom-4 start-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-150 no-print">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 text-white rounded-lg shadow-xl border border-slate-700 font-bold text-xs">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-amber-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Complete Printing Modal (Thermal 58mm, 80mm & A4) */}
      {activePrintRecord && <PrintPreviewModal />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <LicenseGate>
        <AppContent />
      </LicenseGate>
    </AppProvider>
  );
}
