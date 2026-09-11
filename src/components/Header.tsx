import React from 'react';
import {
  PersonaType,
  SupportedLanguage,
  AlertNotification
} from '../types';
import { translations } from '../services/i18n';
import {
  ShieldAlert,
  Wifi,
  WifiOff,
  Globe,
  UserCheck,
  Sparkles,
  Layers,
  MapPin,
  Truck,
  Activity,
  Radio,
  FileCheck2,
  Database
} from 'lucide-react';

interface HeaderProps {
  currentPersona: PersonaType;
  onSelectPersona: (p: PersonaType) => void;
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (l: SupportedLanguage) => void;
  isOnline: boolean;
  onToggleOnline: () => void;
  offlineQueueCount: number;
  activeAlerts: AlertNotification[];
  onOpenAIBriefing: () => void;
  activeTab: string;
  onChangeTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPersona,
  onSelectPersona,
  currentLanguage,
  onSelectLanguage,
  isOnline,
  onToggleOnline,
  offlineQueueCount,
  activeAlerts,
  onOpenAIBriefing,
  activeTab,
  onChangeTab
}) => {
  const t = translations[currentLanguage];
  const criticalAlert = activeAlerts.find((a) => a.severity === 'DANGER') || activeAlerts[0];

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-50">
      {/* Top emergency broadcast ticker */}
      {criticalAlert && (
        <div className="bg-rose-950/80 border-b border-rose-800/60 px-4 py-1.5 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wider uppercase flex items-center gap-1 animate-pulse">
              <Radio className="w-3 h-3" /> Live Alert
            </span>
            <span className="font-semibold text-rose-100 truncate">{criticalAlert.title}:</span>
            <span className="truncate text-rose-200/90 hidden sm:inline">{criticalAlert.message}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-rose-300/80 font-mono text-[11px]">{criticalAlert.timestamp}</span>
            <span className="bg-rose-900/60 border border-rose-700/50 rounded px-1.5 py-0.5 text-[10px]">
              SLA Delivery: {criticalAlert.deliverySuccessRate}%
            </span>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-md border border-emerald-500/30">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                  {t.appTitle}
                </h1>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  NER Pilot
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {t.appSubtitle} &bull; <span className="text-slate-300">Sikkim &bull; Meghalaya &bull; Assam</span>
              </p>
            </div>
          </div>

          {/* Quick controls: Persona, Language, Offline Toggle, AI Briefing */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Persona Switcher */}
            <div className="flex items-center bg-slate-800/90 rounded-lg border border-slate-700 p-1">
              <UserCheck className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              <select
                id="persona-select"
                aria-label="Active Persona Selector"
                value={currentPersona}
                onChange={(e) => onSelectPersona(e.target.value as PersonaType)}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none pr-2 cursor-pointer"
              >
                <option value="sdma_ndma" className="bg-slate-800">{t.personas.sdma_ndma}</option>
                <option value="pwd_official" className="bg-slate-800">{t.personas.pwd_official}</option>
                <option value="logistics_coord" className="bg-slate-800">{t.personas.logistics_coord}</option>
                <option value="transporter" className="bg-slate-800">{t.personas.transporter}</option>
                <option value="field_officer" className="bg-slate-800">{t.personas.field_officer}</option>
                <option value="citizen" className="bg-slate-800">{t.personas.citizen}</option>
              </select>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800/90 rounded-lg border border-slate-700 p-1">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              <select
                id="language-select"
                aria-label="Language Selector"
                value={currentLanguage}
                onChange={(e) => onSelectLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none pr-1 cursor-pointer"
              >
                <option value="en" className="bg-slate-800">English (EN)</option>
                <option value="as" className="bg-slate-800">অসমীয়া (AS)</option>
                <option value="bn" className="bg-slate-800">বাংলা (BN)</option>
                <option value="hi" className="bg-slate-800">हिन्दी (HI)</option>
                <option value="kha" className="bg-slate-800">Khasi (KHA)</option>
              </select>
            </div>

            {/* Offline Simulation Toggle */}
            <button
              id="offline-toggle-button"
              onClick={onToggleOnline}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
                isOnline
                  ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-amber-950/80 border-amber-600 text-amber-300 hover:bg-amber-900/80'
              }`}
              title={isOnline ? 'Network Connected' : 'Simulating Zero-Connectivity Zone'}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
              <span className="font-semibold">
                {isOnline ? 'Online' : 'Offline Mode'}
              </span>
              {offlineQueueCount > 0 && (
                <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                  {offlineQueueCount}
                </span>
              )}
            </button>

            {/* AI Situation Briefing Button */}
            <button
              id="ai-briefing-button"
              onClick={onOpenAIBriefing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-sm transition-all border border-blue-400/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Briefing</span>
            </button>
          </div>
        </div>

        {/* Phase / Navigation tabs */}
        <nav className="flex items-center gap-1 mt-3 pt-2 border-t border-slate-800 overflow-x-auto no-scrollbar text-xs font-medium text-slate-300">
          <button
            id="tab-gis-map"
            onClick={() => onChangeTab('gis-map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'gis-map'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>GIS Map</span>
          </button>

          <button
            id="tab-phase1-graph"
            onClick={() => onChangeTab('phase1-graph')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'phase1-graph'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Corridor Map</span>
          </button>

          <button
            id="tab-phase2-reports"
            onClick={() => onChangeTab('phase2-reports')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'phase2-reports'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Field Reports</span>
            {offlineQueueCount > 0 && (
              <span className="bg-amber-400 text-slate-950 font-bold px-1 rounded-full text-[10px]">
                {offlineQueueCount}
              </span>
            )}
          </button>

          <button
            id="tab-phase3-predictive"
            onClick={() => onChangeTab('phase3-predictive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'phase3-predictive'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Risk Prediction</span>
          </button>

          <button
            id="tab-phase4-routing"
            onClick={() => onChangeTab('phase4-routing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'phase4-routing'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Smart Routing</span>
          </button>

          <button
            id="tab-phase5-fleet"
            onClick={() => onChangeTab('phase5-fleet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'phase5-fleet'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Fleet Tracking</span>
          </button>

          <button
            id="tab-phase6-command"
            onClick={() => onChangeTab('phase6-command')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'phase6-command'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Command Center</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
