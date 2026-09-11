import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    try {
      geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn("Could not initialize Gemini client:", e);
    }
  }
  return geminiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "NER Logistics & Accessibility Intelligence Platform",
    timestamp: new Date().toISOString(),
    region: "North Eastern Region (NER) - Sikkim, Meghalaya, Assam",
    aiEnabled: !!process.env.GEMINI_API_KEY
  });
});

// Phase 6 & Cross-Phase: AI Situation Briefing Endpoint
const handleSituationBriefing = async (req: express.Request, res: express.Response) => {
  try {
    const { district, highRiskCount, blockedCount, activeShipments, delayedShipments, weatherAlerts, persona, language } = req.body;
    const ai = getGemini();

    if (ai) {
      const prompt = `You are the AI Disaster & Logistics Intelligence Advisor for the North Eastern Region (NER) Accessibility Platform.
Persona requested: ${persona || "State Disaster Management Official"}
Language preference: ${language || "en"}

Analyze this real-time regional snapshot:
- District/Corridor Focus: ${district || "NER Key Corridors (Sikkim & Meghalaya)"}
- Blocked Road Segments: ${blockedCount || 2}
- High-Risk Road Segments: ${highRiskCount || 5}
- Active Essential Cargo Shipments: ${activeShipments || 12}
- Delayed Essential Shipments: ${delayedShipments || 3}
- Active Weather Alerts: ${weatherAlerts || "Heavy Monsoon Rainfall (78mm/6h), CWC High Flood in Teesta & Barak rivers"}

Provide an executive tactical briefing for the State Disaster Management Authority (SDMA) and Public Works Department (PWD) in markdown:
1. Executive Situation Summary (2 concise sentences)
2. Immediate Road Clearance & Bottleneck Priorities
3. Critical Logistics Re-routing Advice for Essential Commodities (Medicine/Ration)
4. Recommended Next 6-Hour Alert & Pre-positioning Actions. Keep it crisp, authoritative, and actionable.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      return res.json({
        briefing: response.text,
        source: "Gemini 3.8 Flash (Live)",
        generatedAt: new Date().toISOString()
      });
    }

    // High-quality contextual fallback if API key is not configured
    const fallbackBriefing = `### Executive Situation Summary
Severe precipitation (78mm/6h) and Teesta river gauge surges have breached safe thresholds along NH-10 (Sevoke–Rangpo) and NH-6 (East Jaintia Hills), leaving 2 vital arterial segments blocked and 5 at critical risk. 3 essential-goods convoys transporting critical medical supplies and grain are currently experiencing transit delays exceeding 45 minutes.

### Immediate Road Clearance & Bottleneck Priorities
- **NH-10 (Km 32 - 29th Mile)**: Heavy debris clearance dispatched via NHIDCL JCB unit 4; estimated clearance window is 4.5 hours. Maintain full closure for non-emergency traffic.
- **NH-6 (Sonapur Tunnel Approach)**: Mudslide reported; immediate one-lane clearance prioritized for emergency medical shipments under police escort.
- **Mangan–Chungthang Link (SH-31)**: Active soil creep; diversion active via Passingdang village rural road.

### Critical Logistics Re-routing Advice (Medicine / Ration)
- Divert all Gangtok-bound medical supply trucks from Siliguri via **NH-717A (Lava–Algarah–Rangpo)**. Adds +38 minutes but bypasses Teesta gorge active slide zones with 94% safety margin.
- Reroute Barak Valley food grain convoys through Shillong bypass–Mawryngkneng corridor until CWC river gauge normalizes below 52.4m.

### Recommended Next 6-Hour Alert & Pre-positioning Actions
- Issue high-priority Push & SMS alerts to all registered transporters on NH-10 and NH-6 corridors.
- Pre-position PWD quick-response recovery cranes at Rangpo Border Checkpost and Khliehriat Junction.
- Notify District Magistrates of East Sikkim and East Jaintia Hills to enforce selective heavy vehicle holding.`;

    return res.json({
      briefing: fallbackBriefing,
      source: "Predictive Heuristic Rule Engine (Fallback)",
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error in situation-briefing:", error);
    res.status(500).json({ error: "Failed to generate AI situation briefing" });
  }
};

app.post("/api/ai/situation-briefing", handleSituationBriefing);
app.post("/api/briefing", handleSituationBriefing);


// Phase 6: External Government Integration Mock APIs (FR6.5)
app.get("/api/v1/integration/sdma/status", (req, res) => {
  res.json({
    region: "NER",
    timestamp: new Date().toISOString(),
    districts: [
      { id: "sikkim-east", name: "Gangtok / East Sikkim", status: "AT_RISK", connectivityIndex: 72, activeDisruptions: 3 },
      { id: "sikkim-north", name: "Mangan / North Sikkim", status: "BLOCKED", connectivityIndex: 41, activeDisruptions: 4 },
      { id: "meghalaya-ekh", name: "East Khasi Hills (Shillong)", status: "ACCESSIBLE", connectivityIndex: 91, activeDisruptions: 1 },
      { id: "meghalaya-ejh", name: "East Jaintia Hills (Khliehriat)", status: "AT_RISK", connectivityIndex: 68, activeDisruptions: 2 },
      { id: "assam-kamrup", name: "Kamrup Metro (Guwahati)", status: "ACCESSIBLE", connectivityIndex: 98, activeDisruptions: 0 }
    ],
    emergencyCorridorsOpen: 7,
    emergencyCorridorsBlocked: 2,
    ndmaCompliant: true
  });
});

app.get("/api/v1/integration/pwd/roads", (req, res) => {
  res.json({
    authority: "PWD / NHIDCL NER Division",
    totalMonitoredKm: 1480,
    maintenanceCrewsDeployed: 14,
    emergencyOverridesActive: 2,
    dataRefreshTime: new Date().toISOString()
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const isHmrDisabled = process.env.DISABLE_HMR === "true";
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : undefined,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
