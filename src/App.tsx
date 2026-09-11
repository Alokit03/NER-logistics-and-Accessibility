import React, { useState, useEffect } from 'react';
import {
  NavigationTab,
  PersonaType,
  SupportedLanguage,
  RoadSegment,
  TrackedShipment,
  FieldReport,
  RouteOption,
  AlertNotification,
  BaseGraphVersion,
  RoadCondition
} from './types';
import {
  mockNodes,
  mockSegments,
  mockShipments,
  mockFieldReports,
  mockWeatherFeeds,
  mockBhuvanFeeds,
  mockGsiFeeds,
  mockCwcFeeds,
  mockDistrictMetrics,
  mockInterstateProtocols,
  mockDisasterAuditReports,
  mockBaseGraphVersions,
  initialAlerts
} from './data/mockData';
import { recomputeSegmentRisk, ModelWeights, defaultWeights } from './services/riskModel';
import { getOfflineQueueLength, syncOfflineQueue } from './services/offlineSync';
import { translations } from './services/i18n';

// Components
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { GISMap } from './components/GISMap';
import { BaseGraphView } from './components/BaseGraphView';
import { FieldReportingView } from './components/FieldReportingView';
import { PredictiveEngineView } from './components/PredictiveEngineView';
import { RoutePlannerView } from './components/RoutePlannerView';
import { FleetLogisticsView } from './components/FleetLogisticsView';
import { GovernanceDashboardView } from './components/GovernanceDashboardView';

import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Compass,
  FileCheck2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Truck,
  X
} from 'lucide-react';

export default function App() {
  // Navigation & Persona State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('gis-map');
  const [currentPersona, setCurrentPersona] = useState<PersonaType>('sdma_ndma');
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(() => getOfflineQueueLength());

  // Core Data State
  const [nodes] = useState(mockNodes);
  const [segments, setSegments] = useState<RoadSegment[]>(mockSegments);
  const [shipments, setShipments] = useState<TrackedShipment[]>(mockShipments);
  const [fieldReports, setFieldReports] = useState<FieldReport[]>(mockFieldReports);
  const [weatherFeeds] = useState(mockWeatherFeeds);
  const [bhuvanFeeds] = useState(mockBhuvanFeeds);
  const [gsiFeeds] = useState(mockGsiFeeds);
  const [cwcFeeds] = useState(mockCwcFeeds);
  const [districtMetrics] = useState(mockDistrictMetrics);
  const [interstateProtocols, setInterstateProtocols] = useState(mockInterstateProtocols);
  const [auditReports] = useState(mockDisasterAuditReports);
  const [graphVersions, setGraphVersions] = useState<BaseGraphVersion[]>(mockBaseGraphVersions);

  // Map & Routing selection state
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>('seg_nh10_sevoke_rangpo');
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [activeRouteOption, setActiveRouteOption] = useState<RouteOption | null>(null);
  const [riskThreshold, setRiskThreshold] = useState<number>(65);
  const [alerts, setAlerts] = useState<AlertNotification[]>(initialAlerts);

  // AI Situation Briefing Modal State
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiBriefingContent, setAiBriefingContent] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const t = translations[currentLanguage];

  // Refresh offline count whenever window storage triggers
  useEffect(() => {
    const handleStorage = () => {
      setOfflineQueueCount(getOfflineQueueLength());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // When online status toggles
  const handleToggleOnline = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (nextState) {
      syncOfflineQueue((synced) => {
        setFieldReports((prev) => [...synced, ...prev]);
        setOfflineQueueCount(getOfflineQueueLength());
      });
    }
  };

  // Phase 1: Update Segment from Admin Tool
  const handleUpdateSegment = (updated: RoadSegment) => {
    setSegments((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleAddGraphVersion = (newVer: BaseGraphVersion) => {
    setGraphVersions((prev) => [newVer, ...prev]);
  };

  // Phase 2: Submit New Field Report
  const handleSubmitNewReport = (newRep: FieldReport) => {
    setFieldReports((prev) => [newRep, ...prev]);
    const targetSeg = segments.find((s) => s.id === newRep.nearestSegmentId);
    if (targetSeg) {
      const updatedRisk = recomputeSegmentRisk(targetSeg, defaultWeights, [newRep, ...fieldReports]);
      handleUpdateSegment(updatedRisk);
    }
  };

  // Phase 2: Moderate Report
  const handleModerateReport = (reportId: string, action: 'VERIFY' | 'DISMISS') => {
    setFieldReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          return {
            ...r,
            status: action === 'VERIFY' ? 'VERIFIED' : 'DISMISSED',
            verifiedBy: 'PWD Command Desk'
          };
        }
        return r;
      })
    );
  };

  const handleSyncComplete = (synced: FieldReport[]) => {
    setFieldReports((prev) => [...synced, ...prev]);
    setOfflineQueueCount(getOfflineQueueLength());
  };

  // Phase 3: Recalculate ML Risk Scores across all segments
  const handleRecalculateScores = (weights: ModelWeights) => {
    setSegments((prev) =>
      prev.map((seg) => recomputeSegmentRisk(seg, weights, fieldReports))
    );
  };

  // Phase 4: Authority Override Road
  const handleAuthorityOverrideRoad = (
    segmentId: string,
    status: RoadCondition,
    reason: string,
    orderNo: string
  ) => {
    setSegments((prev) =>
      prev.map((seg) => {
        if (seg.id === segmentId) {
          return {
            ...seg,
            currentCondition: status,
            authorityOverride: {
              isOverridden: true,
              overriddenStatus: status,
              reason,
              officialName: 'District Magistrate & DDMA Chair',
              department: 'State Disaster Management Authority',
              timestamp: new Date().toLocaleString(),
              orderNumber: orderNo
            }
          };
        }
        return seg;
      })
    );
  };

  // Phase 4: Send Alert Broadcast
  const handleSendAlert = (alert: AlertNotification) => {
    setAlerts((prev) => [alert, ...prev]);
  };

  // Phase 5: Update Shipment
  const handleUpdateShipment = (updated: TrackedShipment) => {
    setShipments((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  // Phase 6: Update Interstate Protocol
  const handleUpdateProtocol = (protocol: any) => {
    setInterstateProtocols((prev) =>
      prev.map((p) => (p.id === protocol.id ? protocol : p))
    );
  };

  // Server-side AI Situation Briefing via /api/briefing
  const handleGenerateAiBriefing = async () => {
    setShowAiModal(true);
    setAiLoading(true);
    try {
      const blocked = segments.filter((s) => s.currentCondition === 'BLOCKED').map((s) => s.name);
      const atRisk = segments.filter((s) => s.riskScore >= 65).map((s) => s.name);
      const delayed = shipments.filter((s) => s.status === 'DELAYED').map((s) => `${s.vehicleNumber} (${s.commodity})`);

      const res = await fetch('/api/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: currentPersona,
          language: currentLanguage,
          blockedSegments: blocked,
          atRiskSegments: atRisk,
          delayedShipments: delayed,
          weatherSummary: 'IMD Red Alert active for Mangan (84mm/6h) and Cherrapunji (142mm/6h). Teesta river above danger level.'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiBriefingContent(data.briefing || data.text || 'Briefing generated.');
      } else {
        // Fallback local synthesis if offline or server responding with fallback
        setAiBriefingContent(
          `**North Eastern Region Incident Command Briefing (${new Date().toLocaleTimeString()} IST)**\n\n` +
          `• **Critical Corridor Disruptions:** NH-10 (Sevoke - Rangpo) remains completely BLOCKED at 29th Mile due to active slope failure and Teesta river bank erosion. Clearance estimated in 8-12 hours by BRO Swastik.\n\n` +
          `• **Recommended Diversion SOP:** All Sikkim-bound essential supply convoys must divert via NH-717A (Lava-Algarah-Reshi). Traffic police deployed at Sevoke Coronation Bridge junction.\n\n` +
          `• **Lifeline Fleet Status:** ${shipments.length} tracked essential cargo vehicles in transit. Medicine vehicle SK-01-D-4412 successfully rerouted with cold-chain integrity intact.\n\n` +
          `• **Immediate Action Orders:** Maintain heavy machinery on 24-hour standby at Sonapur tunnel (NH-6) and Singtam-Dikchu bend.`
        );
      }
    } catch (err) {
      setAiBriefingContent(
        `**Operational Situation Summary (Local Fallback)**\n\n` +
        `• **NH-10 Sevoke-Rangpo:** Blocked at Km 29 due to debris collapse. Heavy traffic halted.\n` +
        `• **NH-717A Alternate Route:** Fully operational with minor delay (+40 mins). Priority clearance for medical supplies.\n` +
        `• **Hydrological Warning:** Teesta River level at 114.8m (0.6m above danger mark). Flood rescue teams alerted.`
      );
    } finally {
      setAiLoading(false);
    }
  };

  const blockedSegments = segments.filter((s) => s.currentCondition === 'BLOCKED');
  const atRiskSegments = segments.filter((s) => s.riskScore >= riskThreshold);
  const delayedShipments = shipments.filter((s) => s.status === 'DELAYED');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Global Header */}
      <Header
        currentPersona={currentPersona}
        onSelectPersona={setCurrentPersona}
        currentLanguage={currentLanguage}
        onSelectLanguage={setCurrentLanguage}
        isOnline={isOnline}
        onToggleOnline={handleToggleOnline}
        offlineQueueCount={offlineQueueCount}
        activeAlerts={alerts}
        onOpenAIBriefing={handleGenerateAiBriefing}
        activeTab={currentTab}
        onChangeTab={(tab) => setCurrentTab(tab as NavigationTab)}
      />

      {/* Real-time Emergency Warning Ribbon */}
      {blockedSegments.length > 0 && (
        <div className="bg-rose-950/90 border-b border-rose-800/80 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2 text-rose-200">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              CRITICAL ACCESS DISRUPTION:
            </span>
            <span>
              {blockedSegments.map((s) => `${s.highwayCode} (${s.name})`).join(', ')} currently impassable.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentTab('phase4-routing');
                setSelectedSegmentId(blockedSegments[0].id);
              }}
              className="bg-rose-800 hover:bg-rose-700 text-white font-semibold px-2.5 py-1 rounded text-[11px] flex items-center gap-1 transition-colors"
            >
              <span>{t.actions.planRoute} Detour</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB 1: GIS MAP & REGIONAL OVERVIEW */}
        {currentTab === 'gis-map' && (
          <div className="space-y-6">
            {/* KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                onClick={() => setCurrentTab('phase3-predictive')}
                className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Corridors At Risk
                  </span>
                  <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-white font-mono">
                    {atRiskSegments.length}
                  </span>
                  <span className="text-[10px] text-amber-400 font-semibold">
                    ({blockedSegments.length} Severed)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                  Score &gt; {riskThreshold} Threshold
                </span>
              </div>

              <div
                onClick={() => setCurrentTab('phase5-fleet')}
                className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Fleet Convoys
                  </span>
                  <Truck className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-white font-mono">
                    {shipments.length}
                  </span>
                  <span className="text-[10px] text-rose-400 font-semibold">
                    ({delayedShipments.length} Delayed)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Medicines & Relief in Transit
                </span>
              </div>

              <div
                onClick={() => setCurrentTab('phase2-reports')}
                className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Field Telemetry
                  </span>
                  <FileCheck2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-white font-mono">
                    {fieldReports.length}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Verified</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {offlineQueueCount} queued locally offline
                </span>
              </div>

              <div
                onClick={() => setCurrentTab('phase6-command')}
                className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Connectivity Index
                  </span>
                  <ShieldCheck className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-white font-mono">71%</span>
                  <span className="text-[10px] text-purple-400 font-semibold">Regional Avg</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  SDMA/DDMA Command Synced
                </span>
              </div>
            </div>

            {/* Interactive North Eastern GIS Map */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    {t.appTitle} &bull; GIS Spatial Canvas
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time visual layer of Sikkim, Meghalaya, and Assam corridors. Click any road segment, vehicle, or river gauge for inspection.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded hidden sm:inline-block">
                  Spatial Engine: PostGIS Projection Active
                </span>
              </div>

              <ErrorBoundary
                fallbackTitle="GIS Map Viewport"
                fallbackDescription="A display error occurred while rendering the GIS map viewport. Click Retry or refresh the component."
              >
                <GISMap
                  nodes={nodes}
                  segments={segments}
                  shipments={shipments}
                  fieldReports={fieldReports}
                  cwcFeeds={cwcFeeds}
                  weatherFeeds={weatherFeeds}
                  activeRouteOption={activeRouteOption}
                  selectedSegmentId={selectedSegmentId}
                  onSelectSegment={setSelectedSegmentId}
                  selectedShipmentId={selectedShipmentId}
                  onSelectShipment={setSelectedShipmentId}
                  currentPersona={currentPersona}
                  currentLanguage={currentLanguage}
                  onPlanRouteForSegment={(seg) => {
                    setSelectedSegmentId(seg.id);
                    setCurrentTab('phase4-routing');
                  }}
                />
              </ErrorBoundary>
            </div>

            {/* Bottom 2-Column Overview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Corridor Advisories */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> High-Priority Corridor Advisories
                  </h4>
                  <button
                    onClick={() => setCurrentTab('phase4-routing')}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Route Engine</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {segments
                    .filter((s) => s.currentCondition !== 'OPEN')
                    .slice(0, 3)
                    .map((seg) => (
                      <div
                        key={seg.id}
                        className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/70 flex items-start justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-emerald-400 font-bold bg-slate-900 px-1.5 py-0.2 rounded">
                              {seg.highwayCode}
                            </span>
                            <span className="font-bold text-white">{seg.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1">
                            {seg.riskFactors.primaryCause}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            seg.currentCondition === 'BLOCKED'
                              ? 'bg-rose-950 text-rose-300 border border-rose-700'
                              : 'bg-amber-950 text-amber-300 border border-amber-700'
                          }`}
                        >
                          {seg.currentCondition}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Essential Lifeline Convoys */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-400" /> Essential Lifeline Convoys
                  </h4>
                  <button
                    onClick={() => setCurrentTab('phase5-fleet')}
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Transporter Portal</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {shipments.slice(0, 3).map((ship) => (
                    <div
                      key={ship.id}
                      className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/70 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-950 text-blue-300 font-bold px-1.5 py-0.2 rounded text-[10px] border border-blue-800">
                            {ship.commodity}
                          </span>
                          <span className="font-bold text-white">{ship.vehicleNumber}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {ship.driverName} &bull; {ship.cargoDescription}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-white block">ETA: {ship.plannedEta}</span>
                        {ship.estimatedDelayMinutes > 0 ? (
                          <span className="text-[10px] text-rose-400 font-bold">
                            +{ship.estimatedDelayMinutes}m delay
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-bold">On Schedule</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 1: DATA FOUNDATION & BASE GRAPH */}
        {currentTab === 'phase1-graph' && (
          <BaseGraphView
            nodes={nodes}
            segments={segments}
            weatherFeeds={weatherFeeds}
            bhuvanFeeds={bhuvanFeeds}
            gsiFeeds={gsiFeeds}
            cwcFeeds={cwcFeeds}
            graphVersions={graphVersions}
            onUpdateSegment={handleUpdateSegment}
            onAddVersion={handleAddGraphVersion}
          />
        )}

        {/* PHASE 2: REAL-TIME MONITORING & FIELD REPORTING */}
        {currentTab === 'phase2-reports' && (
          <FieldReportingView
            segments={segments}
            reports={fieldReports}
            isOnline={isOnline}
            offlineQueueCount={offlineQueueCount}
            currentLanguage={currentLanguage}
            onSubmitNewReport={handleSubmitNewReport}
            onModerateReport={handleModerateReport}
            onSyncComplete={handleSyncComplete}
          />
        )}

        {/* PHASE 3: PREDICTIVE DISRUPTION ENGINE */}
        {currentTab === 'phase3-predictive' && (
          <PredictiveEngineView
            segments={segments}
            weatherFeeds={weatherFeeds}
            currentLanguage={currentLanguage}
            riskThreshold={riskThreshold}
            onSetRiskThreshold={setRiskThreshold}
            onRecalculateScores={handleRecalculateScores}
            onSelectSegmentToInspect={(segId) => setSelectedSegmentId(segId)}
          />
        )}

        {/* PHASE 4: ROUTE OPTIMIZATION & ALERTING */}
        {currentTab === 'phase4-routing' && (
          <RoutePlannerView
            nodes={nodes}
            segments={segments}
            currentPersona={currentPersona}
            currentLanguage={currentLanguage}
            activeRouteOption={activeRouteOption}
            onSelectRouteOption={setActiveRouteOption}
            onSendAlert={handleSendAlert}
            onAuthorityOverrideRoad={handleAuthorityOverrideRoad}
          />
        )}

        {/* PHASE 5: ESSENTIAL LOGISTICS & FLEET INTELLIGENCE */}
        {currentTab === 'phase5-fleet' && (
          <FleetLogisticsView
            shipments={shipments}
            segments={segments}
            currentLanguage={currentLanguage}
            onUpdateShipment={handleUpdateShipment}
            onSelectShipmentToMap={(sId) => {
              setSelectedShipmentId(sId);
              setCurrentTab('gis-map');
            }}
          />
        )}

        {/* PHASE 6: REGIONAL ACCESSIBILITY & DISASTER COMMAND */}
        {currentTab === 'phase6-command' && (
          <GovernanceDashboardView
            districtMetrics={districtMetrics}
            interstateProtocols={interstateProtocols}
            auditReports={auditReports}
            segments={segments}
            shipments={shipments}
            currentPersona={currentPersona}
            currentLanguage={currentLanguage}
            onUpdateProtocol={handleUpdateProtocol}
          />
        )}
      </main>

      {/* AI Situation Briefing Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    AI Regional Situation Briefing &bull; Gemini
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Multi-modal synthesized briefing tailored for {currentPersona.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-200 text-sm leading-relaxed">
              {aiLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                  <p className="text-xs">Synthesizing GIS road telemetry, IMD precipitation and GSI risk layers...</p>
                </div>
              ) : (
                <div className="whitespace-pre-line prose prose-invert max-w-none text-slate-300">
                  {aiBriefingContent}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>Live Ground Grounding Active</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateAiBriefing}
                  disabled={aiLoading}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400 font-medium">
              North Eastern Region (NER) Smart Logistics & Accessibility Intelligence Platform
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>PostGIS Graph v1.2</span>
            <span>&bull;</span>
            <span>IMD / ISRO Bhuvan / GSI / CWC Integrated</span>
            <span>&bull;</span>
            <span>Compliant with NDMA Incident Command System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
