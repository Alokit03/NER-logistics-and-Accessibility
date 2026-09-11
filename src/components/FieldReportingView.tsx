import React, { useState } from 'react';
import {
  FieldReport,
  RoadSegment,
  ReportCategory,
  SupportedLanguage
} from '../types';
import { translations } from '../services/i18n';
import {
  saveOfflineReport,
  syncOfflineQueue,
  getSyncAuditTrail,
  SyncAuditEntry
} from '../services/offlineSync';
import {
  FileCheck2,
  AlertTriangle,
  Camera,
  MapPin,
  WifiOff,
  CheckCircle,
  XCircle,
  RefreshCw,
  Shield,
  UploadCloud,
  Layers,
  Clock,
  Mic,
  Copy
} from 'lucide-react';

interface FieldReportingViewProps {
  segments: RoadSegment[];
  reports: FieldReport[];
  isOnline: boolean;
  offlineQueueCount: number;
  currentLanguage: SupportedLanguage;
  onSubmitNewReport: (report: FieldReport) => void;
  onModerateReport: (reportId: string, action: 'VERIFY' | 'DISMISS') => void;
  onSyncComplete: (syncedReports: FieldReport[]) => void;
}

export const FieldReportingView: React.FC<FieldReportingViewProps> = ({
  segments,
  reports,
  isOnline,
  offlineQueueCount,
  currentLanguage,
  onSubmitNewReport,
  onModerateReport,
  onSyncComplete
}) => {
  const t = translations[currentLanguage];

  // Tab state
  const [activeTab, setActiveTab] = useState<'submit' | 'moderation' | 'audit'>('submit');

  // Form inputs
  const [authorName, setAuthorName] = useState('Officer T. Wangchuk');
  const [authorRole, setAuthorRole] = useState<'FIELD_OFFICER' | 'CITIZEN' | 'TRANSPORTER'>('FIELD_OFFICER');
  const [category, setCategory] = useState<ReportCategory>('LANDSLIDE');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(segments[0]?.id || '');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80');
  const [hasAudioNote, setHasAudioNote] = useState(false);
  const [audioDuration, setAudioDuration] = useState(15);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'warn' | 'error'; text: string } | null>(null);

  // Sync state
  const [auditLog, setAuditLog] = useState<SyncAuditEntry[]>(getSyncAuditTrail());

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setStatusMessage({ type: 'warn', text: 'Please enter an incident description.' });
      return;
    }

    const matchedSegment = segments.find((s) => s.id === selectedSegmentId) || segments[0];
    const coords = matchedSegment.coordinates[0];

    // Compute basic duplicate check against recent reports
    const isDuplicate = reports.some(
      (r) =>
        r.nearestSegmentId === selectedSegmentId &&
        r.category === category &&
        r.status !== 'DISMISSED'
    );

    const newReport: FieldReport = {
      id: `rep_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString() + ' IST',
      authorName,
      authorPhone: '+91 98320 XXXXX',
      role: authorRole,
      category,
      severity,
      description,
      coordinates: { lat: coords[0] + 0.002, lng: coords[1] + 0.001 },
      nearestSegmentId: selectedSegmentId,
      photoUrl: photoUrl || undefined,
      audioNoteDurationSec: hasAudioNote ? audioDuration : undefined,
      status: authorRole === 'FIELD_OFFICER' ? 'VERIFIED' : 'PENDING_MODERATION',
      confidenceScore: authorRole === 'FIELD_OFFICER' ? 95 : isDuplicate ? 60 : 80,
      isDuplicateFlagged: isDuplicate,
      verifiedBy: authorRole === 'FIELD_OFFICER' ? authorName : undefined,
      offlineSynced: isOnline
    };

    if (!isOnline) {
      // Save to local offline queue
      const res = saveOfflineReport(newReport);
      if (res.limitReached) {
        setStatusMessage({
          type: 'error',
          text: 'Offline storage limit (50 reports) reached! Please connect to network to sync.'
        });
        return;
      }
      setStatusMessage({
        type: 'warn',
        text: `Network offline: Report securely queued locally (#${res.queueLength} pending). Auto-sync will trigger on reconnection.`
      });
    } else {
      onSubmitNewReport(newReport);
      setStatusMessage({
        type: 'success',
        text: `Report submitted and geo-validated with road segment ${matchedSegment.name}.`
      });
    }

    setDescription('');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleTriggerSync = () => {
    const result = syncOfflineQueue((synced) => {
      onSyncComplete(synced);
      setAuditLog(getSyncAuditTrail());
    });

    setStatusMessage({
      type: 'success',
      text: `Sync engine processed: ${result.syncedCount} queued reports uploaded with Last-Write-Wins conflict resolution.`
    });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const pendingReports = reports.filter((r) => r.status === 'PENDING_MODERATION');

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-950 text-blue-400 border border-blue-700/60 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
              PRD Phase 2
            </span>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-400" /> Real-Time Monitoring & Field Reporting
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Offline-first ground incident reports with geo-validation, camera simulation, and moderation workflow.
          </p>
        </div>

        {/* Action Tabs & Sync Trigger */}
        <div className="flex items-center gap-2">
          {offlineQueueCount > 0 && isOnline && (
            <button
              onClick={handleTriggerSync}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Sync {offlineQueueCount} Offline Reports</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'submit' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Field App Submit
            </button>
            <button
              onClick={() => setActiveTab('moderation')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'moderation' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Moderation Console</span>
              {pendingReports.length > 0 && (
                <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                  {pendingReports.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'audit' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Sync Audit Log
            </button>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-200'
              : statusMessage.type === 'warn'
              ? 'bg-amber-950/80 border border-amber-700 text-amber-200'
              : 'bg-rose-950/80 border border-rose-700 text-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* TAB 1: Mobile Field Reporter Simulator */}
      {activeTab === 'submit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mobile phone mockup simulation container */}
          <div className="lg:col-span-1 bg-slate-950 rounded-2xl border-2 border-slate-700 p-4 shadow-2xl flex flex-col justify-between max-w-sm mx-auto w-full">
            <div>
              {/* Phone Status Header */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-3 border-b border-slate-800">
                <span className="font-semibold text-slate-300">09:42 IST</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
                  <span className="text-[10px]">{isOnline ? '4G Connected' : 'No Signal (Offline)'}</span>
                </div>
              </div>

              {/* Mobile App View Title */}
              <div className="py-2.5">
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" /> NER Ground Reporter
                </h3>
                <p className="text-[10px] text-slate-400">
                  {t.actions.reportIncident} &bull; Multilingual GIS Client
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Reporter Role & Name</label>
                  <div className="flex gap-2">
                    <select
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                    >
                      <option value="FIELD_OFFICER">Field Officer / Volunteer</option>
                      <option value="TRANSPORTER">Transporter / Truck Driver</option>
                      <option value="CITIZEN">Citizen Resident</option>
                    </select>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Hazard Category (FR2.1)</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ReportCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white font-semibold text-xs"
                  >
                    <option value="LANDSLIDE">{t.categories.landslide}</option>
                    <option value="FLASH_FLOOD">{t.categories.flood}</option>
                    <option value="ROAD_SUBSIDENCE">{t.categories.road_damage}</option>
                    <option value="BRIDGE_DAMAGE">{t.categories.bridge_damage}</option>
                    <option value="SEVERE_CONGESTION">{t.categories.congestion}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Severity Rating</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((sev) => (
                      <button
                        type="button"
                        key={sev}
                        onClick={() => setSeverity(sev)}
                        className={`py-1 rounded text-[10px] font-bold border transition-colors ${
                          severity === sev
                            ? 'bg-rose-600 border-rose-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Nearest Road Segment (Geo-matched)</label>
                  <select
                    value={selectedSegmentId}
                    onChange={(e) => setSelectedSegmentId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-xs"
                  >
                    {segments.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.highwayCode}: {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Ground Observation & Details</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe obstruction width, rock size, water depth..."
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white placeholder-slate-500 text-xs focus:outline-none"
                    required
                  />
                </div>

                {/* Media attachments simulator */}
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-blue-400" /> Geo-tagged Photo
                    </span>
                    <span className="text-[10px] text-emerald-400">Client Compressed (42 KB)</span>
                  </div>
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Photo Image URL"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setHasAudioNote(!hasAudioNote)}
                      className={`px-2 py-1 rounded text-[10px] flex items-center gap-1 ${
                        hasAudioNote ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Mic className="w-3 h-3" />
                      <span>{hasAudioNote ? 'Audio Note (15s Recorded)' : 'Record Voice Note'}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow ${
                    isOnline
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                  }`}
                >
                  {isOnline ? (
                    <>
                      <UploadCloud className="w-4 h-4" /> Submit Live Report
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4" /> Queue in Offline Store (Auto-Sync)
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Offline storage capacity footer */}
            <div className="pt-3 mt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Offline Cache: {offlineQueueCount}/50 reports</span>
              <span>LWW Audit Enabled</span>
            </div>
          </div>

          {/* Right column: Recent Field Reports & Ground Truth */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" /> Live Field Telemetry Stream ({reports.length})
              </h3>
              <span className="text-xs text-slate-400">Verified ground incidents dynamically feed Phase 3 model</span>
            </div>

            <div className="space-y-3">
              {reports.map((rep) => {
                const seg = segments.find((s) => s.id === rep.nearestSegmentId);

                return (
                  <div
                    key={rep.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      rep.status === 'VERIFIED'
                        ? 'bg-slate-800/60 border-slate-700'
                        : rep.status === 'PENDING_MODERATION'
                        ? 'bg-amber-950/30 border-amber-800/50'
                        : 'bg-slate-900/40 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rep.severity === 'CRITICAL'
                              ? 'bg-rose-950 text-rose-300 border border-rose-700'
                              : rep.severity === 'HIGH'
                              ? 'bg-orange-950 text-orange-300 border border-orange-700'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {rep.category} ({rep.severity})
                        </span>
                        <span className="text-xs font-bold text-white">
                          {seg?.highwayCode || 'Road'}: {seg?.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-slate-400 font-mono">{rep.timestamp}</span>
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            rep.status === 'VERIFIED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {rep.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 mt-2">{rep.description}</p>

                    {/* Photo preview if present */}
                    {rep.photoUrl && (
                      <div className="mt-2 flex items-center gap-3">
                        <img
                          src={rep.photoUrl}
                          alt="Field incident"
                          className="w-24 h-16 object-cover rounded-lg border border-slate-700"
                        />
                        <div className="text-[11px] text-slate-400 space-y-0.5">
                          <p className="text-slate-300 font-medium">Author: {rep.authorName} ({rep.role})</p>
                          <p>Geo-validated: {rep.coordinates.lat.toFixed(3)}°N, {rep.coordinates.lng.toFixed(3)}°E</p>
                          <p className="text-emerald-400">Confidence Score: {rep.confidenceScore}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Moderation Console */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" /> Verification & Duplicate Moderation Queue
            </h3>
            <span className="text-xs text-slate-400">
              FR2.4: System auto-flags duplicates or low-confidence submissions for review
            </span>
          </div>

          {pendingReports.length === 0 ? (
            <div className="bg-slate-800/40 p-8 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-200">Moderation Queue Clear</p>
              <p>All citizen and volunteer field reports have been verified or resolved.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-950 text-amber-300 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-800">
                        {rep.category}
                      </span>
                      {rep.isDuplicateFlagged && (
                        <span className="bg-rose-950 text-rose-300 font-bold px-2 py-0.5 rounded text-[10px] border border-rose-800 flex items-center gap-1">
                          <Copy className="w-3 h-3" /> Auto-Flagged Duplicate
                        </span>
                      )}
                      <span className="text-slate-400 text-[11px]">{rep.timestamp} &bull; {rep.authorName} ({rep.role})</span>
                    </div>
                    <p className="text-white font-medium">{rep.description}</p>
                    <p className="text-slate-400 text-[11px]">
                      Confidence: <strong>{rep.confidenceScore}%</strong> &bull; Segment: {rep.nearestSegmentId}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onModerateReport(rep.id, 'VERIFY')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 shadow"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Verify & Update Graph
                    </button>
                    <button
                      onClick={() => onModerateReport(rep.id, 'DISMISS')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Sync Audit Trail */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" /> Offline Synchronization & Conflict Resolution Audit Trail
            </h3>
            <span className="text-xs text-slate-400">Last-Write-Wins (LWW) resolution engine logs</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-2.5">Audit ID</th>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5">Action</th>
                  <th className="p-2.5">Resolved By</th>
                  <th className="p-2.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                {auditLog.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="p-2.5 text-slate-400">{log.id}</td>
                    <td className="p-2.5 text-slate-300">{log.timestamp}</td>
                    <td className="p-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.action === 'SYNCED_SUCCESS' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-200">{log.resolvedBy}</td>
                    <td className="p-2.5 text-slate-300 font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
