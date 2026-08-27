import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      service: "OrbitalLens Satellite Vision API",
      timestamp: new Date().toISOString(),
    });
  });

  // 1. RS-VLM Land Cover & Major Objects Analysis
  app.post("/api/sat-vlm", async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType = "image/jpeg", question, sceneContext } = req.body;
      const ai = getAI();

      const prompt = `You are an expert Remote Sensing Vision-Language Model (like Prithvi / SkyCLIP / EarthGPT) specializing in Earth Observation (EO) optical satellite imagery (Sentinel-2, Landsat, PlanetScope, NAIP).
Analyze this satellite scene and provide structured Remote Sensing analysis.

${question ? `Specific User Query: "${question}"` : "Provide a comprehensive Land-Use Land-Cover (LULC) breakdown and major object inventory."}
${sceneContext ? `Context details: ${sceneContext}` : ""}

Return a strictly valid JSON object with the following schema:
{
  "caption": "A concise, technical satellite image caption describing terrain, geography, and primary features.",
  "sceneSummary": "Detailed multi-sentence technical summary of the land-cover composition, spatial structures, and optical signatures.",
  "lulcBreakdown": [
    { "category": "Urban / Built-up", "percentage": 35, "description": "High-density residential and commercial grid with asphalt road network" },
    { "category": "Vegetation / Canopy", "percentage": 25, "description": "Deciduous forest canopy and riparian vegetation" },
    { "category": "Water Bodies", "percentage": 20, "description": "Meandering river estuary and drainage basin" },
    { "category": "Agricultural Land", "percentage": 15, "description": "Rectangular cultivated crop parcels" },
    { "category": "Bare Soil / Sand", "percentage": 5, "description": "Exposed ground and construction clearance zones" }
  ],
  "majorObjects": [
    { "name": "Deepwater Cargo Terminal", "type": "Infrastructure", "count": 2, "details": "Linear pier with crane gantries and docked freight vessels", "confidence": 0.95 },
    { "name": "Major Highway Arterial", "type": "Transportation", "count": 1, "details": "Dual-carriageway corridor traversing north-to-south", "confidence": 0.98 },
    { "name": "Retention Basin / Reservoir", "type": "Hydrology", "count": 1, "details": "Artificial reservoir with high chlorophyll absorption signature", "confidence": 0.92 }
  ],
  "environmentalMetrics": {
    "estimatedNdvi": 0.42,
    "urbanizationIndex": "High (Level 4/5)",
    "waterTurbidity": "Moderate sediment runoff",
    "cloudCoverPercentage": 0
  },
  "qaAnswer": ${question ? `"Clear, comprehensive answer to the user query based on satellite visual evidence."` : `null`}
}`;

      const contentsParts: any[] = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, "");
        contentsParts.push({
          inlineData: {
            mimeType: mimeType || "image/jpeg",
            data: cleanBase64,
          },
        });
      }
      contentsParts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: { parts: contentsParts },
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error("Error in /api/sat-vlm:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to process VLM analysis" });
    }
  });

  // 2. Visual Grounding & Referring Expression Segmentation
  app.post("/api/sat-grounding", async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType = "image/jpeg", query = "water body" } = req.body;
      const ai = getAI();

      const prompt = `You are a state-of-the-art Remote Sensing Visual Grounding & Referring Expression Segmentation model (such as Grounding DINO + SAM / RS-RefSeg).
Target Query: "${query}"

Your task:
1. Identify all regions, entities, or polygons in the satellite image that match the target query ("${query}").
2. Extract pixel-normalized 2D polygon vertex coordinates on a 0 to 100 percentage grid (where x: 0 is left, 100 is right, y: 0 is top, 100 is bottom).
3. Provide bounding boxes, estimated surface area (in sq km and % of scene), segmentation confidence, and descriptive features.

Return a strictly valid JSON object with the following schema:
{
  "query": "${query}",
  "matched": true,
  "summary": "Technical grounding description of where the requested feature was located in the scene.",
  "targetCategory": "Water / Built-up / Runway / Solar / Forest / etc.",
  "totalEstimatedAreaKm2": 2.45,
  "percentageOfScene": 14.8,
  "confidenceScore": 0.96,
  "polygons": [
    {
      "id": "poly-1",
      "label": "Primary segment for: ${query}",
      "confidence": 0.97,
      "color": "#06b6d4",
      "vertices": [
        {"x": 15.2, "y": 32.1},
        {"x": 28.4, "y": 30.5},
        {"x": 42.1, "y": 38.8},
        {"x": 58.7, "y": 55.2},
        {"x": 49.3, "y": 68.4},
        {"x": 31.0, "y": 64.2},
        {"x": 18.5, "y": 48.9}
      ],
      "boundingBox": { "xMin": 15.2, "yMin": 30.5, "xMax": 58.7, "yMax": 68.4 },
      "areaKm2": 1.82,
      "pixelCountEstimate": 45200
    }
  ],
  "reasoningSteps": [
    "Detected optical spectral signature matching the spectral band absorption of the target.",
    "Traced outer topological boundary using edge contrast and morphology segmentation.",
    "Formed closed polygon mask containing the requested referring expression entity."
  ]
}`;

      const contentsParts: any[] = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, "");
        contentsParts.push({
          inlineData: {
            mimeType: mimeType || "image/jpeg",
            data: cleanBase64,
          },
        });
      }
      contentsParts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: { parts: contentsParts },
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error("Error in /api/sat-grounding:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to process visual grounding" });
    }
  });

  // 3. Bi-temporal Change Detection (Siamese Twin Networks / ChangeFormer)
  app.post("/api/sat-change", async (req: Request, res: Response) => {
    try {
      const {
        imageDateA_Base64,
        imageDateB_Base64,
        dateA = "Date A (Baseline)",
        dateB = "Date B (Recent)",
        scenarioTitle = "Earth Observation Bi-Temporal Change",
        mimeType = "image/jpeg",
      } = req.body;

      const ai = getAI();

      const prompt = `You are an Earth Observation Bi-Temporal Change Detection engine simulating twin-architecture Siamese Convolutional & Transformer networks (ChangeFormer / BIT-CD).
You are comparing two satellite acquisitions:
- Time T1: ${dateA}
- Time T2: ${dateB}
Scenario context: ${scenarioTitle}

Analyze the spatial and spectral differences between Date A and Date B.
Determine what changed, where it changed, the categorical transition (e.g. Vegetation -> Built-up, Water -> Dry land, Forest -> Burn scar, Agricultural -> Industrial), and quantify the change footprint.

Return a strictly valid JSON object with the following schema:
{
  "executiveSummary": "Comprehensive summary of bi-temporal changes detected between the two acquisition dates.",
  "changeSeverity": "High" | "Moderate" | "Subtle" | "Extreme",
  "totalAreaAnalyzedKm2": 25.0,
  "netChangedAreaKm2": 4.65,
  "percentageAreaChanged": 18.6,
  "siameseConfidenceScore": 0.94,
  "categoricalTransitions": [
    {
      "fromCategory": "Dense Forest / Canopy",
      "toCategory": "Urban Built-up / Construction",
      "areaKm2": 2.85,
      "changeType": "Deforestation & Urban Sprawl",
      "significance": "High",
      "color": "#ef4444"
    },
    {
      "fromCategory": "Fallow Agricultural Land",
      "toCategory": "Solar PV Panel Array",
      "areaKm2": 1.20,
      "changeType": "Clean Energy Infrastructure",
      "significance": "Medium",
      "color": "#3b82f6"
    },
    {
      "fromCategory": "Vegetated Riverbank",
      "toCategory": "Inundated Water Surface",
      "areaKm2": 0.60,
      "changeType": "Hydrological Inundation",
      "significance": "Medium",
      "color": "#06b6d4"
    }
  ],
  "spatialHotspots": [
    {
      "id": "hotspot-1",
      "title": "Northwest Industrial Expansion",
      "location": "Upper-left quadrant (X: 10-35%, Y: 15-40%)",
      "polygon": [
        {"x": 12, "y": 18},
        {"x": 34, "y": 16},
        {"x": 36, "y": 38},
        {"x": 15, "y": 42}
      ],
      "deltaType": "built_up_added",
      "description": "Rapid grading of earth and new concrete foundations visible in T2."
    },
    {
      "id": "hotspot-2",
      "title": "Southeast Tree Canopy Loss",
      "location": "Lower-right quadrant (X: 60-85%, Y: 55-80%)",
      "polygon": [
        {"x": 62, "y": 58},
        {"x": 84, "y": 56},
        {"x": 82, "y": 80},
        {"x": 60, "y": 78}
      ],
      "deltaType": "vegetation_loss",
      "description": "Clear-cutting and road carving through previously continuous canopy."
    }
  ],
  "environmentalImpactAssessment": "Evaluation of ecological runoff, heat-island index progression, and carbon stock displacement."
}`;

      const contentsParts: any[] = [];
      if (imageDateA_Base64) {
        const cleanA = imageDateA_Base64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, "");
        contentsParts.push({
          inlineData: {
            mimeType: mimeType || "image/jpeg",
            data: cleanA,
          },
        });
      }
      if (imageDateB_Base64) {
        const cleanB = imageDateB_Base64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, "");
        contentsParts.push({
          inlineData: {
            mimeType: mimeType || "image/jpeg",
            data: cleanB,
          },
        });
      }
      contentsParts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: { parts: contentsParts },
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error("Error in /api/sat-change:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to process change detection" });
    }
  });

  // 4. Optical + SAR Multi-Sensor Fusion
  app.post("/api/sat-fusion", async (req: Request, res: Response) => {
    try {
      const { sceneName = "Coastal Clouded Port", weatherCondition = "Overcast with dense cumulus cloud layer" } = req.body;
      const ai = getAI();

      const prompt = `You are a specialist in Multi-Sensor Remote Sensing Data Fusion combining Optical Multispectral Imagery (e.g. Sentinel-2 MSI) with Synthetic Aperture Radar (SAR, e.g. Sentinel-1 C-Band SAR VV/VH polarization).

Explain and synthesize the multi-sensor tensor fusion for scenario: "${sceneName}".
Weather interference: ${weatherCondition}

Highlight:
1. Why optical alone fails (cloud reflection, shadows, atmospheric aerosol scattering).
2. How SAR microwave pulses (e.g. 5.405 GHz C-band) penetrate clouds, rain, and smoke, utilizing double-bounce scattering for buildings and specular reflection for smooth water.
3. How tensor fusion algorithms (e.g. Wavelet Fusion, Deep Learning Early/Late Fusion, PCA/IHS fusion) generate an all-weather composite segmentation of Built-up vs Water vs Vegetated land.

Return a strictly valid JSON object with the following schema:
{
  "fusionMethodology": "Deep Tensor Feature-Level Fusion (Optical RGB + SAR VV/VH Dual-Pol Backscatter)",
  "opticalLimitations": "Dense cumulus cloud occlusion obscures ~42% of optical surface reflectance in the visible bands.",
  "sarCapabilities": "Microwave wavelengths (~5.6 cm) achieve 100% cloud penetration, capturing dielectric permittivity and surface roughness profiles.",
  "sensorLayers": {
    "opticalBandCharacteristics": "B2 (Blue), B3 (Green), B4 (Red), B8 (NIR) - Subject to cloud masking",
    "sarPolarizations": "VV (Vertical-transmit Vertical-receive for surface roughness) & VH (Cross-pol for volume scattering)",
    "fusedProductResolution": "10m spatial Ground Sample Distance (GSD)"
  },
  "fusedClassificationAccuracy": {
    "opticalAlone": "58.4% (degraded by cloud masks)",
    "sarAlone": "82.1% (speckle noise challenges)",
    "fusedOpticalSar": "96.7% (all-weather precision)"
  },
  "featureDetections": [
    {
      "feature": "Built-up Infrastructure & Commercial Port",
      "opticalSignature": "Partially occluded by cloud shelf",
      "sarSignature": "Bright double-bounce backscatter (+8 to +15 dB) from vertical metallic and concrete structures",
      "fusedVerdict": "100% verified urban footprint independent of cloud cover"
    },
    {
      "feature": "Open Water & Estuary",
      "opticalSignature": "High cloud reflectance obscuring water body boundary",
      "sarSignature": "Dark specular reflection (-22 to -28 dB) due to smooth radar mirror effect",
      "fusedVerdict": "Precise waterline boundary segmented through cloud obstruction"
    },
    {
      "feature": "Wetland & Mangrove Canopy",
      "opticalSignature": "Spectral chlorophyll absorption where visible",
      "sarSignature": "High cross-polarization VH volume scattering (-12 to -16 dB)",
      "fusedVerdict": "Biomass density classified accurately"
    }
  ],
  "radarBackscatterReference": {
    "waterDecibels": "-24 dB",
    "calmSoilDecibels": "-18 dB",
    "forestDecibels": "-13 dB",
    "urbanDecibels": "+6 dB"
  }
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error("Error in /api/sat-fusion:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to process sensor fusion" });
    }
  });

  // 5. Time-Series Built-Up Analytics & Trendline Regression
  app.post("/api/sat-timeseries", async (req: Request, res: Response) => {
    try {
      const {
        regionName = "Metropolitan Delta Region",
        startYear = 2018,
        endYear = 2026,
        customTrendData,
      } = req.body;

      const ai = getAI();

      const prompt = `You are a Geospatial Time-Series Data Scientist simulating Python / Pandas / Scikit-learn satellite pixel-counting post-processing algorithms.
Region: ${regionName} (${startYear} to ${endYear})

Calculate and formulate time-series land cover analytics.
Query to answer: "Has the built-up area increased, decreased, or remained unchanged?"

Compute:
1. Annual historical progression of Built-up area (sq km), Vegetated Canopy (sq km), and Water Bodies (sq km).
2. Linear Ordinary Least Squares (OLS) regression slope (rate of change in sq km/year) and R² goodness-of-fit.
3. CAGR (Compound Annual Growth Rate).
4. 5-year future projection model (to ${Number(endYear) + 5}).
5. Direct conclusive answer to: "Has the built-up area increased, decreased, or remained unchanged?"

Return a strictly valid JSON object with the following schema:
{
  "regionName": "${regionName}",
  "verdict": "INCREASED" | "DECREASED" | "REMAINED_UNCHANGED",
  "verdictHeadline": "Built-up area expanded by +28.4% (+14.2 sq km) over the 8-year observation window.",
  "cagrPercentage": 3.18,
  "linearRegression": {
    "slopeKm2PerYear": 1.77,
    "rSquared": 0.984,
    "pValue": 0.0001,
    "equation": "y = 1.77x + 50.2"
  },
  "timeSeriesPoints": [
    { "year": 2018, "builtUpKm2": 50.2, "vegetationKm2": 85.4, "waterKm2": 24.4, "trendlineKm2": 50.2, "annualChangePercent": 0 },
    { "year": 2019, "builtUpKm2": 51.8, "vegetationKm2": 84.1, "waterKm2": 24.1, "trendlineKm2": 52.0, "annualChangePercent": 3.19 },
    { "year": 2020, "builtUpKm2": 53.6, "vegetationKm2": 82.5, "waterKm2": 23.9, "trendlineKm2": 53.7, "annualChangePercent": 3.47 },
    { "year": 2021, "builtUpKm2": 55.4, "vegetationKm2": 80.9, "waterKm2": 23.7, "trendlineKm2": 55.5, "annualChangePercent": 3.36 },
    { "year": 2022, "builtUpKm2": 57.1, "vegetationKm2": 79.5, "waterKm2": 23.4, "trendlineKm2": 57.3, "annualChangePercent": 3.07 },
    { "year": 2023, "builtUpKm2": 59.2, "vegetationKm2": 77.8, "waterKm2": 23.0, "trendlineKm2": 59.1, "annualChangePercent": 3.68 },
    { "year": 2024, "builtUpKm2": 61.1, "vegetationKm2": 76.2, "waterKm2": 22.7, "trendlineKm2": 60.8, "annualChangePercent": 3.21 },
    { "year": 2025, "builtUpKm2": 62.9, "vegetationKm2": 74.8, "waterKm2": 22.3, "trendlineKm2": 62.6, "annualChangePercent": 2.95 },
    { "year": 2026, "builtUpKm2": 64.4, "vegetationKm2": 73.5, "waterKm2": 22.1, "trendlineKm2": 64.4, "annualChangePercent": 2.38 }
  ],
  "futureProjections": [
    { "year": 2027, "projectedBuiltUpKm2": 66.2, "lowerConfidenceBound": 65.1, "upperConfidenceBound": 67.3 },
    { "year": 2028, "projectedBuiltUpKm2": 68.0, "lowerConfidenceBound": 66.6, "upperConfidenceBound": 69.4 },
    { "year": 2029, "projectedBuiltUpKm2": 69.8, "lowerConfidenceBound": 68.1, "upperConfidenceBound": 71.5 },
    { "year": 2030, "projectedBuiltUpKm2": 71.5, "lowerConfidenceBound": 69.5, "upperConfidenceBound": 73.5 },
    { "year": 2031, "projectedBuiltUpKm2": 73.3, "lowerConfidenceBound": 71.0, "upperConfidenceBound": 75.6 }
  ],
  "scikitLearnAnalysis": {
    "modelType": "Ordinary Least Squares & Polynomial Feature Expansion (Degree 2)",
    "meanSquaredError": 0.082,
    "pixelCountCalibration": "1 Sentinel-2 Pixel = 100 m² (0.0001 km²)",
    "netPixelGain": "+142,000 built-up classified pixels"
  },
  "scientificInterpretation": "The empirical time-series reveals sustained, statistically significant urban densification and outward sprawl at the expense of agricultural fringe and native vegetation."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error("Error in /api/sat-timeseries:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to process time-series analytics" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`OrbitalLens server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal server boot error:", err);
});
