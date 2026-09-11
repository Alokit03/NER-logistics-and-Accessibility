import React, { useState } from 'react';
import {
  GraphNode,
  RoadSegment,
  RouteOption,
  AlertNotification,
  PersonaType,
  SupportedLanguage,
  RoadCondition
} from '../types';
import { calculateRoutes } from '../services/routingEngine';
import { translations } from '../services/i18n';
import {
  MapPin,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Send,
  PhoneCall,
  MessageSquare,
  BellRing,
  Volume2,
  FileSignature,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

interface RoutePlannerViewProps {
  nodes: GraphNode[];
  segments: RoadSegment[];
  currentPersona: PersonaType;
  currentLanguage: SupportedLanguage;
  activeRouteOption: RouteOption | null;
  onSelectRouteOption: (route: RouteOption | null) => void;
  onSendAlert: (alert: AlertNotification) => void;
  onAuthorityOverrideRoad: (
    segmentId: string,
    status: RoadCondition,
    reason: string,
    orderNo: string
  ) => void;
}

export const RoutePlannerView: React.FC<RoutePlannerViewProps> = ({
  nodes,
  segments,
  currentPersona,
  currentLanguage,
  activeRouteOption,
  onSelectRouteOption,
  onSendAlert,
  onAuthorityOverrideRoad
}) => {
  const t = translations[currentLanguage];

  // Routing Origin / Destination
  const [originId, setOriginId] = useState<string>('node_siliguri');
  const [destId, setDestId] = useState<string>('node_gangtok');
  const [computedRoutes, setComputedRoutes] = useState<RouteOption[]>(() =>
    calculateRoutes('node_siliguri', 'node_gangtok', nodes, segments)
  );

  // Alert simulation state
  const [alertTargetCorridor, setAlertTargetCorridor] = useState('NH-10 (Sevoke-Rangpo)');
  const [alertMessageText, setAlertMessageText] = useState(
    'EMERGENCY ADVISORY: NH-10 blocked at 29th Mile due to active landslide. Convoys proceed via NH-717A (Lava-Algarah).'
  );
  const [alertChannels, setAlertChannels] = useState<{ push: boolean; sms: boolean; ivr: boolean }>({
    push: true,
    sms: true,
    ivr: true
  });
  const [ivrAudioPlaying, setIvrAudioPlaying] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  // Authority Override Modal / Form
  const [overrideSegmentId, setOverrideSegmentId] = useState<string>(segments[0]?.id || '');
  const [overrideStatus, setOverrideStatus] = useState<RoadCondition>('BLOCKED');
  const [overrideReason, setOverrideReason] = useState(
    'Teesta river bank erosion breached pavement edge; heavy rockfall hazard'
  );
  const [overrideOrderNo, setOverrideOrderNo] = useState('DM/SKM/ORDER/2026/091');
  const [overrideSuccess, setOverrideSuccess] = useState<string | null>(null);

  const handleCalculateRoute = () => {
    const routes = calculateRoutes(originId, destId, nodes, segments);
    setComputedRoutes(routes);
    if (routes.length > 0) {
      onSelectRouteOption(routes[0]);
    }
  };

  const handleTriggerBroadcast = () => {
    const channels: ('PUSH' | 'SMS' | 'IVR')[] = [];
    if (alertChannels.push) channels.push('PUSH');
    if (alertChannels.sms) channels.push('SMS');
    if (alertChannels.ivr) channels.push('IVR');

    const newAlert: AlertNotification = {
      id: `alt_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString() + ' IST',
      title: `BROADCAST: Corridor Disruption Warning`,
      message: alertMessageText,
      severity: 'DANGER',
      channels,
      targetCorridor: alertTargetCorridor,
      affectedShipmentCount: 5,
      deliverySuccessRate: 98.6
    };

    onSendAlert(newAlert);
    setAlertSuccess(`Dispatched multi-channel alert across Push, 2G SMS, and IVR Voice queues.`);
    setTimeout(() => setAlertSuccess(null), 4000);
  };

  const handleSimulateIVRCall = () => {
    setIvrAudioPlaying(true);
    // Browser speech synthesis if supported
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(t.alerts.ivrPreviewText);
      utterance.rate = 0.9;
      utterance.onend = () => setIvrAudioPlaying(false);
      utterance.onerror = () => setIvrAudioPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIvrAudioPlaying(false), 4000);
    }
  };

  const handleApplyAuthorityOverride = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthorityOverrideRoad(overrideSegmentId, overrideStatus, overrideReason, overrideOrderNo);
    setOverrideSuccess(`Gazette Order ${overrideOrderNo} executed. Road status updated on live graph.`);
    // Recalculate routes to reflect new graph state
    setTimeout(() => {
      setOverrideSuccess(null);
      handleCalculateRoute();
    }, 2500);
  };

  const originNode = nodes.find((n) => n.id === originId);
  const destNode = nodes.find((n) => n.id === destId);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-700/60 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
              PRD Phase 4
            </span>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-400" /> Route Optimization & Multi-Channel Alerting
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Risk-weighted A*/Dijkstra alternate route recommendations, Push/SMS/IVR voice dispatch, and official road override console.
          </p>
        </div>
      </div>

      {alertSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-200 px-4 py-2.5 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{alertSuccess}</span>
        </div>
      )}

      {overrideSuccess && (
        <div className="bg-rose-950/80 border border-rose-700 text-rose-200 px-4 py-2.5 rounded-lg text-xs flex items-center gap-2">
          <FileSignature className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{overrideSuccess}</span>
        </div>
      )}

      {/* Origin & Destination Picker */}
      <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Origin Logistics Hub
            </label>
            <select
              value={originId}
              onChange={(e) => setOriginId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium text-xs focus:outline-none"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.state})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-rose-400" /> Destination Hub
            </label>
            <select
              value={destId}
              onChange={(e) => setDestId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium text-xs focus:outline-none"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.state})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCalculateRoute}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md shrink-0 transition-colors"
        >
          <Navigation className="w-4 h-4" />
          <span>{t.actions.planRoute}</span>
        </button>
      </div>

      {/* Computed Route Comparison Cards */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center justify-between">
          <span>Route Evaluation & Recommendations</span>
          <span className="text-xs text-slate-400 font-normal">
            Traversing {originNode?.name.split(' ')[0]} &rarr; {destNode?.name.split(' ')[0]}
          </span>
        </h3>

        {computedRoutes.length === 0 ? (
          <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
            No valid road graph connections between selected hubs. Try Siliguri &rarr; Gangtok or Guwahati &rarr; Shillong.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {computedRoutes.map((route) => {
              const isSelected = activeRouteOption?.id === route.id;

              return (
                <div
                  key={route.id}
                  onClick={() => onSelectRouteOption(route)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl'
                      : 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {route.isRecommended && (
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Recommended Safe Path
                          </span>
                        )}
                        {route.isBlocked && (
                          <span className="bg-rose-950 text-rose-300 border border-rose-700 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Impassable Corridor
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-white mt-1">{route.title}</h4>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-white font-mono block">
                        {Math.floor(route.totalEstimatedTimeMin / 60)}h{' '}
                        {route.totalEstimatedTimeMin % 60}m
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono">
                        {route.totalDistanceKm} km
                      </span>
                    </div>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-2.5 rounded-lg text-[11px] mt-3">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Predicted Delay</span>
                      <span
                        className={`font-mono font-bold ${
                          route.estimatedDelayMin > 45 ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      >
                        +{route.estimatedDelayMin} mins
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Route Avg Risk</span>
                      <span
                        className={`font-mono font-bold ${
                          route.averageRiskScore > 70
                            ? 'text-rose-400'
                            : route.averageRiskScore > 40
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {route.averageRiskScore}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Safety Margin</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {route.safetyMarginPercentage}% Safe
                      </span>
                    </div>
                  </div>

                  {/* Critical Warning or Details */}
                  {route.criticalSegments.length > 0 && (
                    <div className="mt-2.5 text-[11px] flex items-center gap-1.5 text-rose-300 bg-rose-950/40 px-2 py-1 rounded border border-rose-800/40">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                      <span className="truncate">Bottlenecks: {route.criticalSegments.join(', ')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Lower Columns: Multi-Channel Alert Broadcaster & Authority Override Console */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-slate-800">
        {/* Left: Multi-Channel Alerting Service (FR4.3 & FR4.4) */}
        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-400" /> Multi-Channel Alert Dispatcher
            </h4>
            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-mono">
              95% in 5m SLA
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Targeted real-time broadcast to affected transporters, local residents, and emergency convoys.
          </p>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Target Corridor / District</label>
              <input
                type="text"
                value={alertTargetCorridor}
                onChange={(e) => setAlertTargetCorridor(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Alert Content / Advisory</label>
              <textarea
                rows={2}
                value={alertMessageText}
                onChange={(e) => setAlertMessageText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs focus:outline-none"
              />
            </div>

            {/* Channels toggle */}
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Delivery Channels (FR4.4)</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAlertChannels({ ...alertChannels, push: !alertChannels.push })}
                  className={`p-2 rounded border flex items-center justify-center gap-1.5 ${
                    alertChannels.push
                      ? 'bg-blue-950 border-blue-600 text-blue-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>App Push</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAlertChannels({ ...alertChannels, sms: !alertChannels.sms })}
                  className={`p-2 rounded border flex items-center justify-center gap-1.5 ${
                    alertChannels.sms
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>SMS (2G)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAlertChannels({ ...alertChannels, ivr: !alertChannels.ivr })}
                  className={`p-2 rounded border flex items-center justify-center gap-1.5 ${
                    alertChannels.ivr
                      ? 'bg-purple-950 border-purple-600 text-purple-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>IVR Voice</span>
                </button>
              </div>
            </div>

            {/* Simulated IVR Preview Button */}
            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 text-xs flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" /> IVR Voice Call Simulation
                </span>
                <p className="text-[10px] text-slate-400">
                  Regional language voice playback for low-literacy drivers
                </p>
              </div>
              <button
                type="button"
                onClick={handleSimulateIVRCall}
                disabled={ivrAudioPlaying}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold flex items-center gap-1"
              >
                {ivrAudioPlaying ? 'Playing Voice Call...' : 'Test IVR Call'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleTriggerBroadcast}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-lg font-bold flex items-center justify-center gap-1.5 shadow"
            >
              <Send className="w-4 h-4" /> Broadcast Multi-Channel Alert
            </button>
          </div>
        </div>

        {/* Right: Authority Manual Override Console (FR4.6) */}
        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-rose-400" /> Authority Manual Override Console
            </h4>
            <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-mono">
              FR4.6 PWD / DDMA
            </span>
          </div>

          <p className="text-xs text-slate-400">
            District Magistrates and PWD Chief Engineers can legally override model scores to confirm road closure or restricted access.
          </p>

          <form onSubmit={handleApplyAuthorityOverride} className="space-y-2.5 text-xs">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Target Road Corridor Segment</label>
              <select
                value={overrideSegmentId}
                onChange={(e) => setOverrideSegmentId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
              >
                {segments.map((seg) => (
                  <option key={seg.id} value={seg.id}>
                    {seg.highwayCode}: {seg.name} (Currently {seg.currentCondition})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Enforce New Status</label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value as RoadCondition)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-bold"
                >
                  <option value="BLOCKED">BLOCKED (Full Closure)</option>
                  <option value="RESTRICTED">RESTRICTED (4x4 & Relief Only)</option>
                  <option value="AT_RISK">AT_RISK (High Alert)</option>
                  <option value="OPEN">OPEN (Normal Clearance)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Gazette / Order Number</label>
                <input
                  type="text"
                  value={overrideOrderNo}
                  onChange={(e) => setOverrideOrderNo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Official Administrative Reason</label>
              <textarea
                rows={2}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 shadow"
            >
              <FileSignature className="w-4 h-4" /> Issue Gazette Closure Order
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
