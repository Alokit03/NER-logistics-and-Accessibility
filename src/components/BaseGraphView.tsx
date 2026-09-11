import React, { useState } from 'react';
import {
  GraphNode,
  RoadSegment,
  IMDWeatherFeed,
  ISROBhuvanFeed,
  GSISusceptibilityFeed,
  CWCFloodFeed,
  BaseGraphVersion,
  SurfaceType
} from '../types';
import {
  Database,
  CloudRain,
  Satellite,
  Mountain,
  Waves,
  History,
  Edit3,
  PlusCircle,
  CheckCircle,
  RefreshCw,
  Clock
} from 'lucide-react';

interface BaseGraphViewProps {
  nodes: GraphNode[];
  segments: RoadSegment[];
  weatherFeeds: IMDWeatherFeed[];
  bhuvanFeeds: ISROBhuvanFeed[];
  gsiFeeds: GSISusceptibilityFeed[];
  cwcFeeds: CWCFloodFeed[];
  graphVersions: BaseGraphVersion[];
  onUpdateSegment: (segment: RoadSegment) => void;
  onAddVersion: (newVersion: BaseGraphVersion) => void;
}

export const BaseGraphView: React.FC<BaseGraphViewProps> = ({
  nodes,
  segments,
  weatherFeeds,
  bhuvanFeeds,
  gsiFeeds,
  cwcFeeds,
  graphVersions,
  onUpdateSegment,
  onAddVersion
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'network' | 'feeds' | 'versions' | 'adminEdit'>('network');
  const [editingSegment, setEditingSegment] = useState<RoadSegment | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // New Version State
  const [newVerNumber, setNewVerNumber] = useState('');
  const [newVerDescription, setNewVerDescription] = useState('');

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSegment) return;

    onUpdateSegment(editingSegment);
    setSaveSuccessMsg(`Successfully updated attributes for ${editingSegment.name}`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
    setEditingSegment(null);
  };

  const handleCreateVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVerNumber || !newVerDescription) return;

    const newV: BaseGraphVersion = {
      version: newVerNumber,
      date: new Date().toLocaleString(),
      author: 'PWD GIS Administrator',
      totalSegments: segments.length,
      changeDescription: newVerDescription
    };

    onAddVersion(newV);
    setNewVerNumber('');
    setNewVerDescription('');
    setSaveSuccessMsg(`Graph snapshot ${newV.version} committed to version audit store.`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-700/60 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
              PRD Phase 1
            </span>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" /> Data Foundation & GIS Base Layer
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Digitized district road/bridge networks (nodes & edges) normalized with PostGIS spatial indexing & 4 external feeds.
          </p>
        </div>

        {/* Sub tabs */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setActiveSubTab('network')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeSubTab === 'network' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Graph Nodes & Edges ({segments.length})
          </button>
          <button
            onClick={() => setActiveSubTab('feeds')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeSubTab === 'feeds' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            External Feeds (IMD/ISRO/GSI/CWC)
          </button>
          <button
            onClick={() => setActiveSubTab('versions')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeSubTab === 'versions' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Graph Versioning ({graphVersions.length})
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-200 px-4 py-2 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* SUBTAB 1: Graph Network Data */}
      {activeSubTab === 'network' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-300">
              Showing <span className="font-bold text-white">{nodes.length}</span> settlements/junctions and{' '}
              <span className="font-bold text-white">{segments.length}</span> road segments across East Sikkim, North Sikkim, Meghalaya & Assam.
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-emerald-400" /> Spatial PostGIS Edge Coverage: 94.2%
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-2.5">Corridor Segment</th>
                  <th className="p-2.5">Highway</th>
                  <th className="p-2.5">Length / Width</th>
                  <th className="p-2.5">Surface</th>
                  <th className="p-2.5">Slope / Elev</th>
                  <th className="p-2.5">Disruptions</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {segments.map((seg) => (
                  <tr key={seg.id} className="hover:bg-slate-800/40">
                    <td className="p-2.5 font-medium text-white max-w-[220px] truncate">{seg.name}</td>
                    <td className="p-2.5 font-mono text-emerald-400">{seg.highwayCode}</td>
                    <td className="p-2.5">{seg.lengthKm} km &bull; {seg.widthMeters}m</td>
                    <td className="p-2.5">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono">
                        {seg.surfaceType}
                      </span>
                    </td>
                    <td className="p-2.5">{seg.slopeAngleDeg}° &bull; {seg.averageElevationMeters}m</td>
                    <td className="p-2.5 text-slate-300 font-mono">{seg.historicalDisruptionCount} events</td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          seg.currentCondition === 'BLOCKED'
                            ? 'bg-rose-950 text-rose-300 border border-rose-700'
                            : seg.currentCondition === 'RESTRICTED'
                            ? 'bg-orange-950 text-orange-300 border border-orange-700'
                            : seg.currentCondition === 'AT_RISK'
                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        }`}
                      >
                        {seg.currentCondition}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => setEditingSegment(seg)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 text-[11px] ml-auto"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: External Feeds */}
      {activeSubTab === 'feeds' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Feed 1: IMD Weather */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm text-white">IMD Weather Observatories</h3>
              </div>
              <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-700 px-2 py-0.5 rounded">
                Hourly Cadence
              </span>
            </div>
            <div className="space-y-2 text-xs">
              {weatherFeeds.map((w) => (
                <div key={w.stationId} className="bg-slate-900/80 p-2 rounded border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-200">{w.location}</span>
                    <p className="text-slate-400 text-[10px]">{w.forecast24h}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-blue-400 font-bold">{w.rainfall6hMm} mm / 6h</span>
                    <span className={`block text-[10px] font-bold ${
                      w.alertLevel === 'RED' ? 'text-rose-400' : w.alertLevel === 'ORANGE' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {w.alertLevel} ALERT
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feed 2: ISRO Bhuvan */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">ISRO Bhuvan (Satellite/Terrain)</h3>
              </div>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-700 px-2 py-0.5 rounded">
                Daily Pass
              </span>
            </div>
            <div className="space-y-2 text-xs">
              {bhuvanFeeds.map((b, idx) => (
                <div key={idx} className="bg-slate-900/80 p-2 rounded border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-200">{b.district}</span>
                    <p className="text-slate-400 text-[10px]">{b.satellitePassTime}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-indigo-300 font-mono text-[11px]">Soil Moisture: {b.soilMoisturePercent}%</span>
                    <span className="block text-[10px] text-amber-400">Scars: {b.detectedScarsCount} detected</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feed 3: GSI Landslide Susceptibility */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
              <div className="flex items-center gap-2">
                <Mountain className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">GSI Landslide Hazard Mapping</h3>
              </div>
              <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-700 px-2 py-0.5 rounded">
                1:50,000 Spatial Scale
              </span>
            </div>
            <div className="space-y-2 text-xs">
              {gsiFeeds.map((g) => (
                <div key={g.zoneId} className="bg-slate-900/80 p-2 rounded border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-200">{g.corridor}</span>
                    <p className="text-slate-400 text-[10px]">{g.lithologyType}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      g.hazardClass === 'VERY_HIGH'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : g.hazardClass === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {g.hazardClass}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Fault: {g.activeFaultProximityKm}km</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feed 4: CWC Flood Gauges */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">CWC River Gauge Telemetry</h3>
              </div>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded">
                15-Min Telemetry
              </span>
            </div>
            <div className="space-y-2 text-xs">
              {cwcFeeds.map((c, idx) => (
                <div key={idx} className="bg-slate-900/80 p-2 rounded border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-200">{c.stationName}</span>
                    <p className="text-slate-400 text-[10px]">{c.river} &bull; Trend: {c.trend}</p>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold ${c.status === 'ABOVE_DANGER' ? 'text-rose-400' : 'text-cyan-300'}`}>
                      {c.currentWaterLevelM}m
                    </span>
                    <span className="block text-[10px] text-slate-400">Danger: {c.dangerLevelM}m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Graph Versioning */}
      {activeSubTab === 'versions' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" /> Graph Version Archive & Reconstruction
            </h3>
            <span className="text-xs text-slate-400">
              FR1.4: Enables audit & historical post-disaster replay
            </span>
          </div>

          {/* Form to commit a new version snapshot */}
          <form onSubmit={handleCreateVersion} className="bg-slate-800/40 p-3 rounded-lg border border-slate-700 flex flex-col md:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="Version Tag (e.g. v1.3-Post-Slide)"
              value={newVerNumber}
              onChange={(e) => setNewVerNumber(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-full md:w-48"
              required
            />
            <input
              type="text"
              placeholder="Commit Summary (e.g. Enriched NH-10 LiDAR elevation and modified 29th mile node)"
              value={newVerDescription}
              onChange={(e) => setNewVerDescription(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none flex-1 w-full"
              required
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-1.5 rounded text-xs flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Commit Snapshot
            </button>
          </form>

          {/* Version History List */}
          <div className="space-y-2">
            {graphVersions.map((ver) => (
              <div key={ver.version} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      {ver.version}
                    </span>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {ver.date}
                    </span>
                    <span className="text-emerald-400 text-[11px]">&bull; {ver.author}</span>
                  </div>
                  <p className="text-slate-300 mt-1">{ver.changeDescription}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="bg-slate-900 text-slate-300 text-[11px] px-2 py-1 rounded border border-slate-800 font-mono">
                    {ver.totalSegments} Segments
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal (FR1.3 Admin Tool) */}
      {editingSegment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl text-xs text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-400">FR1.3 Manual Admin Tool</span>
                <h3 className="font-bold text-base text-white">Enrich Segment: {editingSegment.name}</h3>
              </div>
              <button
                onClick={() => setEditingSegment(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Surface Type</label>
                  <select
                    value={editingSegment.surfaceType}
                    onChange={(e) =>
                      setEditingSegment({
                        ...editingSegment,
                        surfaceType: e.target.value as SurfaceType
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-none"
                  >
                    <option value="BITUMINOUS">BITUMINOUS (Tar)</option>
                    <option value="CONCRETE">CONCRETE (Rigid Pavement)</option>
                    <option value="GRAVEL">GRAVEL (Unpaved)</option>
                    <option value="EARTHEN">EARTHEN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Carriageway Width (m)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingSegment.widthMeters}
                    onChange={(e) =>
                      setEditingSegment({
                        ...editingSegment,
                        widthMeters: parseFloat(e.target.value) || 7
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Slope Angle (°)</label>
                  <input
                    type="number"
                    value={editingSegment.slopeAngleDeg}
                    onChange={(e) =>
                      setEditingSegment({
                        ...editingSegment,
                        slopeAngleDeg: parseInt(e.target.value) || 20
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Historical Disruption Count</label>
                  <input
                    type="number"
                    value={editingSegment.historicalDisruptionCount}
                    onChange={(e) =>
                      setEditingSegment({
                        ...editingSegment,
                        historicalDisruptionCount: parseInt(e.target.value) || 0
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">River Proximity Distance (m)</label>
                <input
                  type="number"
                  value={editingSegment.riverProximityMeters}
                  onChange={(e) =>
                    setEditingSegment({
                      ...editingSegment,
                      riverProximityMeters: parseInt(e.target.value) || 50
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSegment(null)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
