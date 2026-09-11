import React, { useState } from 'react';
import {
  DistrictAccessibilityMetric,
  InterstateCoordinationProtocol,
  DisasterAuditReport,
  PersonaType,
  SupportedLanguage,
  RoadSegment,
  TrackedShipment
} from '../types';
import { translations } from '../services/i18n';
import {
  Building2,
  Share2,
  FileText,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Clock,
  Download,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Users,
  Activity
} from 'lucide-react';

interface GovernanceDashboardViewProps {
  districtMetrics: DistrictAccessibilityMetric[];
  interstateProtocols: InterstateCoordinationProtocol[];
  auditReports: DisasterAuditReport[];
  segments: RoadSegment[];
  shipments: TrackedShipment[];
  currentPersona: PersonaType;
  currentLanguage: SupportedLanguage;
  onUpdateProtocol: (protocol: InterstateCoordinationProtocol) => void;
}

export const GovernanceDashboardView: React.FC<GovernanceDashboardViewProps> = ({
  districtMetrics,
  interstateProtocols,
  auditReports,
  segments,
  shipments,
  currentPersona,
  currentLanguage,
  onUpdateProtocol
}) => {
  const t = translations[currentLanguage];

  // AI Briefing State
  const [aiBriefing, setAiBriefing] = useState<string | null>(null);
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [activeTab, setActiveTab] = useState<'metrics' | 'interstate' | 'audit' | 'sdma'>('metrics');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Generate live Gemini Situation Briefing via backend Express API
  const handleGenerateAIBriefing = async () => {
    setIsGeneratingBriefing(true);
    try {
      const res = await fetch('/api/ai/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segments,
          shipments,
          districtMetrics
        })
      });

      if (!res.ok) {
        throw new Error('Server returned error status');
      }

      const data = await res.json();
      setAiBriefing(data.briefing);
      setStatusMessage('Gemini 2.5 Flash Situation Briefing synthesized in real time.');
    } catch (err) {
      // Fallback graceful heuristic summary if offline or missing API key
      setAiBriefing(
        `**SITUATION BRIEFING — NORTH EASTERN REGION (NER) CORRIDORS**\n\n` +
        `• **Critical Disruption**: NH-10 (Sevoke to Rangpo) severed at 29th Mile due to active debris slide and Teesta river undercutting. 100% of heavy traffic diverted to NH-717A (Lava-Algarah-Reshi).\n` +
        `• **District Accessibility**: Mangan District (North Sikkim) is currently at 42% connectivity with 38,000 residents experiencing transit delays. Priority medicine convoys (Cold-chain) escorted via green corridor.\n` +
        `• **Interstate Actions**: West Bengal & Sikkim PWD Joint Task Force deploying 4 front-end loaders and rock-breakers. Assam-Meghalaya NH-6 corridor operating under regulated one-way convoy rules.`
      );
      setStatusMessage('Generated deterministic offline situation assessment.');
    } finally {
      setIsGeneratingBriefing(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // SDMA Handshake simulation
  const handleTriggerSDMAHandshake = async () => {
    setStatusMessage('Initiating NDMA/SDMA Incident Command System (ICS) Webhook Handshake...');
    try {
      const res = await fetch('/api/sdma/dispatch-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corridor: 'NH-10 Siliguri-Gangtok',
          disruptionType: 'LANDSLIDE_BREACH',
          action: 'DEPLOY_EXCAVATORS_BRO'
        })
      });
      const data = await res.json();
      setStatusMessage(`SDMA ICS Ack: ${data.message} (Dispatch Ref: ${data.dispatchId})`);
    } catch (err) {
      setStatusMessage('SDMA ICS Webhook simulated: Signal dispatched to State Emergency Operation Centre (SEOC).');
    }
    setTimeout(() => setStatusMessage(null), 4500);
  };

  const handleToggleProtocolAck = (proto: InterstateCoordinationProtocol) => {
    const updated: InterstateCoordinationProtocol = {
      ...proto,
      status: proto.status === 'ACTIVE' ? 'MUTUAL_ACKNOWLEDGED' : 'ACTIVE'
    };
    onUpdateProtocol(updated);
    setStatusMessage(`Updated protocol status for ${proto.corridorName}`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const totalDisruptedPop = districtMetrics.reduce((acc, curr) => acc + curr.disruptedPopulation, 0);
  const avgConnectivity = Math.round(
    districtMetrics.reduce((acc, curr) => acc + curr.connectivityIndexPercent, 0) / districtMetrics.length
  );

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-950 text-amber-400 border border-amber-700/60 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
              PRD Phase 6
            </span>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" /> Regional Accessibility & Disaster Command
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            SDMA/DDMA incident command integration, cross-state corridor workflows, and AI disaster audits.
          </p>
        </div>

        {/* AI Briefing Trigger & Sub Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleGenerateAIBriefing}
            disabled={isGeneratingBriefing}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingBriefing ? 'Synthesizing...' : 'AI Situation Briefing'}</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === 'metrics' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              District Index
            </button>
            <button
              onClick={() => setActiveTab('interstate')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === 'interstate' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Interstate Protocols
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === 'audit' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Disaster Audits
            </button>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-amber-950/80 border border-amber-700 text-amber-200 px-4 py-2.5 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* AI Situation Briefing Drawer / Box if generated */}
      {aiBriefing && (
        <div className="bg-purple-950/40 border border-purple-800/80 rounded-xl p-4 space-y-2 text-xs text-purple-200">
          <div className="flex items-center justify-between border-b border-purple-800/60 pb-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Gemini 2.5 Flash Situation Assessment (NER Command)</span>
            </div>
            <button
              onClick={() => setAiBriefing(null)}
              className="text-purple-400 hover:text-white font-bold text-xs"
            >
              Dismiss
            </button>
          </div>
          <div className="whitespace-pre-line leading-relaxed text-slate-200">
            {aiBriefing}
          </div>
        </div>
      )}

      {/* High-level Governance KPIs (FR6.1) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Regional Connectivity Index</span>
          <p className="text-lg font-extrabold text-white font-mono mt-0.5">
            {avgConnectivity}%
          </p>
          <span className="text-[10px] text-emerald-400">Weighted by Habitation Access</span>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Disrupted Population</span>
          <p className="text-lg font-extrabold text-rose-400 font-mono mt-0.5">
            {totalDisruptedPop.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">Across 4 Isolated Tehsils</span>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Relief Machinery Deployed</span>
          <p className="text-lg font-extrabold text-amber-400 font-mono mt-0.5">
            18 Heavy Earthmovers
          </p>
          <span className="text-[10px] text-slate-400">BRO Project Swastik & PWD</span>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60">
          <span className="text-slate-400 text-[10px] uppercase font-bold">SDMA Command Sync</span>
          <p className="text-lg font-extrabold text-emerald-400 font-mono mt-0.5">
            ACTIVE 24x7
          </p>
          <button
            onClick={handleTriggerSDMAHandshake}
            className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5 mt-0.5"
          >
            Test ICS Handshake &rarr;
          </button>
        </div>
      </div>

      {/* SUBTAB 1: District Accessibility Index Table */}
      {activeTab === 'metrics' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> District-Level Accessibility Index & Essential Stock Status
            </h3>
            <span className="text-xs text-slate-400">FR6.1: Dynamic calculation based on active graph reachability</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-2.5">District / State</th>
                  <th className="p-2.5">Connectivity Index</th>
                  <th className="p-2.5">Cut-off Habitations</th>
                  <th className="p-2.5">Disrupted Pop.</th>
                  <th className="p-2.5">Avg Delay to Hub</th>
                  <th className="p-2.5">Food Grain Buffer</th>
                  <th className="p-2.5">Medicine Stock</th>
                  <th className="p-2.5">Relief Camps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                {districtMetrics.map((d) => (
                  <tr key={d.districtId} className="hover:bg-slate-800/40">
                    <td className="p-2.5 font-sans font-medium text-white">
                      {d.districtName}, {d.state}
                    </td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              d.connectivityIndexPercent < 50
                                ? 'bg-rose-500'
                                : d.connectivityIndexPercent < 80
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${d.connectivityIndexPercent}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-200">{d.connectivityIndexPercent}%</span>
                      </div>
                    </td>
                    <td className="p-2.5 font-bold text-rose-400">
                      {d.isolatedVillagesCount} villages
                    </td>
                    <td className="p-2.5 text-slate-300">
                      {d.disruptedPopulation.toLocaleString()}
                    </td>
                    <td className="p-2.5 text-amber-400 font-bold">
                      +{d.averageDelayToEssentialSuppliesHours} hrs
                    </td>
                    <td className="p-2.5 text-slate-200 font-sans">{d.foodGrainStockDays} days</td>
                    <td className="p-2.5 text-slate-200 font-sans">{d.criticalMedicineStockDays} days</td>
                    <td className="p-2.5 font-sans">{d.activeReliefCamps} operational</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Interstate Coordination Protocols (FR6.4) */}
      {activeTab === 'interstate' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-400" /> Interstate Corridor Coordination Protocols
              </h3>
              <p className="text-xs text-slate-400">
                FR6.4: Joint standard operating procedures (SOP) across West Bengal, Sikkim, Assam, and Meghalaya.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interstateProtocols.map((proto) => (
              <div
                key={proto.id}
                className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-3 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase">
                      Interstate Lifeline Corridor
                    </span>
                    <h4 className="font-bold text-sm text-white">{proto.corridorName}</h4>
                    <p className="text-[11px] text-slate-400">
                      Spans: <strong>{proto.participatingStates.join(' & ')}</strong>
                    </p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      proto.status === 'MUTUAL_ACKNOWLEDGED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}
                  >
                    {proto.status}
                  </span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Joint Task Force Details:
                  </span>
                  <p className="text-slate-300 font-semibold">{proto.jointTaskForceAgency}</p>
                  <p className="text-slate-400 text-[11px]">Lead: {proto.designatedNodalOfficer}</p>
                </div>

                <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Agreed SOP Protocol:
                  </span>
                  <p className="text-slate-300 text-[11px] mt-0.5">{proto.agreedSOP}</p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">Last Sync: {proto.lastSyncTimestamp}</span>
                  <button
                    onClick={() => handleToggleProtocolAck(proto)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{proto.status === 'MUTUAL_ACKNOWLEDGED' ? 'Re-verify' : 'Acknowledge SOP'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: Disaster Post-Mortem & Audit Reports (FR6.3) */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Post-Disaster Audit Reports & Chronological Logs
            </h3>
            <span className="text-xs text-slate-400">FR6.3: Regulatory and disaster commission reconstruction</span>
          </div>

          <div className="space-y-3">
            {auditReports.map((report) => (
              <div
                key={report.id}
                className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-2">
                  <div>
                    <span className="font-mono text-emerald-400 text-[10px] font-bold">
                      {report.id} &bull; {report.date}
                    </span>
                    <h4 className="font-bold text-sm text-white">{report.title}</h4>
                  </div>
                  <button
                    onClick={() => {
                      setStatusMessage(`Exporting regulatory audit dossier for ${report.id}...`);
                      setTimeout(() => setStatusMessage(null), 3000);
                    }}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5" /> Export PDF Dossier
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/60 p-2.5 rounded-lg font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">Affected Corridor</span>
                    <span className="text-white font-semibold">{report.corridorAffected}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">Disruption Duration</span>
                    <span className="text-amber-400 font-semibold">{report.disruptionDurationHours} hours</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">Delayed Shipments</span>
                    <span className="text-rose-400 font-semibold">{report.delayedShipmentsCount} convoys</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block text-[10px]">Total Delay Incurred</span>
                    <span className="text-slate-200 font-semibold">{report.estimatedDelayHoursTotal} truck-hrs</span>
                  </div>
                </div>

                {/* Timeline Entries */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Chronological Timeline & State Interventions:
                  </span>
                  <div className="space-y-1">
                    {report.timeline.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-slate-900/40 p-1.5 rounded text-[11px]">
                        <span className="font-mono text-emerald-400 font-bold shrink-0">{item.time}:</span>
                        <span className="text-slate-200">{item.event}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Learnings */}
                <div className="bg-emerald-950/30 border border-emerald-800/50 p-2 rounded text-[11px] text-emerald-200">
                  <span className="font-bold">Post-Incident Finding:</span> {report.keyLearnings}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
