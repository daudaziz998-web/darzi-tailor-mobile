import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Ruler, 
  CreditCard, 
  Tag, 
  Settings as SettingsIcon, 
  LayoutDashboard,
  Calendar,
  Phone,
  MapPin,
  Database
} from 'lucide-react';
import { ActiveScreen } from '../types';

export const Header: React.FC = () => {
  const { 
    currentScreen, 
    setScreen, 
    language, 
    setLanguage, 
    settings, 
    dbLocation,
    t 
  } = useApp();

  const isUrdu = language === 'ur';

  const today = new Date();
  const formattedDate = isUrdu
    ? today.toLocaleDateString('ur-PK', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const shopTitle = isUrdu ? settings.shopNameUr : settings.shopNameEn;

  const navItems: Array<{ id: ActiveScreen; labelKey: any; icon: React.ReactNode }> = [
    { id: 'dashboard', labelKey: 'dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'customers', labelKey: 'customers', icon: <Users className="w-4 h-4" /> },
    { id: 'custom-measurements', labelKey: 'customMeasurementsNav', icon: <Ruler className="w-4 h-4" /> },
    { id: 'payments', labelKey: 'payments', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'prices', labelKey: 'priceManagement', icon: <Tag className="w-4 h-4" /> },
    { id: 'settings', labelKey: 'settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-xs no-print">
      {/* Compact Main Top Row (Optimized for 1366x768 screens) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
        {/* Left: Branding */}
        <div className="flex items-center gap-2 min-w-0">
          <button 
            type="button"
            onClick={() => setScreen('dashboard')}
            className="text-left rtl:text-right flex items-center gap-2 group focus:outline-none min-w-0"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-xs shrink-0">
              ✂
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-lg font-black tracking-tight text-white group-hover:text-amber-400 transition-colors leading-tight truncate">
                {shopTitle}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1.5 leading-none truncate">
                <span className="flex items-center gap-0.5 text-amber-400 font-medium truncate">
                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{settings.location}</span>
                </span>
                <span className="text-slate-600">·</span>
                <span className="flex items-center gap-0.5 font-mono shrink-0">
                  <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  <span>{settings.phone}</span>
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Center: Compact Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setScreen(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.icon}
                <span>{t(item.labelKey)}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Date, Language Toggle & Settings */}
        <div className="flex items-center gap-2">
          {/* Compact Date */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-300 font-mono font-medium">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{formattedDate}</span>
          </div>

          {/* Compact True Language Switcher */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-md border border-slate-700">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                language === 'en'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ur')}
              className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                language === 'ur'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              اردو
            </button>
          </div>

          {/* Mobile Navigation Menu Trigger */}
          <button
            type="button"
            onClick={() => setScreen('settings')}
            className={`p-1.5 rounded-md border md:hidden transition-colors ${
              currentScreen === 'settings'
                ? 'bg-amber-500 text-slate-950 border-amber-600'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title={t('settings')}
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Sub-nav if viewport is narrow */}
      <div className="md:hidden bg-slate-950 border-t border-slate-800 px-2 py-1.5 flex overflow-x-auto no-scrollbar gap-1.5 touch-pan-x">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setScreen(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                isActive ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span>{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
