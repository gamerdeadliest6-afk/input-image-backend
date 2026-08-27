/**
 * OrbitalLens - Remote Sensing & Earth Observation AI Types
 */

export type AppModule = 'vlm' | 'grounding' | 'change' | 'fusion' | 'timeseries';

export interface LulcItem {
  category: string;
  percentage: number;
  description: string;
  color?: string;
}

export interface MajorObjectItem {
  name: string;
  type: string;
  count: number;
  details: string;
  confidence: number;
}

export interface VlmAnalysisResult {
  caption: string;
  sceneSummary: string;
  lulcBreakdown: LulcItem[];
  majorObjects: MajorObjectItem[];
  environmentalMetrics: {
    estimatedNdvi: number;
    urbanizationIndex: string;
    waterTurbidity: string;
    cloudCoverPercentage: number;
  };
  qaAnswer?: string | null;
}

export interface PolygonVertex {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
}

export interface GroundingPolygon {
  id: string;
  label: string;
  confidence: number;
  color: string;
  vertices: PolygonVertex[];
  boundingBox?: {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
  };
  areaKm2?: number;
  pixelCountEstimate?: number;
}

export interface GroundingResult {
  query: string;
  matched: boolean;
  summary: string;
  targetCategory: string;
  totalEstimatedAreaKm2: number;
  percentageOfScene: number;
  confidenceScore: number;
  polygons: GroundingPolygon[];
  reasoningSteps: string[];
}

export interface CategoricalTransition {
  fromCategory: string;
  toCategory: string;
  areaKm2: number;
  changeType: string;
  significance: 'High' | 'Medium' | 'Low';
  color: string;
}

export interface SpatialHotspot {
  id: string;
  title: string;
  location: string;
  polygon: PolygonVertex[];
  deltaType: 'built_up_added' | 'vegetation_loss' | 'water_inundation' | 'soil_disturbed';
  description: string;
}

export interface ChangeDetectionResult {
  executiveSummary: string;
  changeSeverity: 'High' | 'Moderate' | 'Subtle' | 'Extreme';
  totalAreaAnalyzedKm2: number;
  netChangedAreaKm2: number;
  percentageAreaChanged: number;
  siameseConfidenceScore: number;
  categoricalTransitions: CategoricalTransition[];
  spatialHotspots: SpatialHotspot[];
  environmentalImpactAssessment: string;
}

export interface SensorFusionResult {
  fusionMethodology: string;
  opticalLimitations: string;
  sarCapabilities: string;
  sensorLayers: {
    opticalBandCharacteristics: string;
    sarPolarizations: string;
    fusedProductResolution: string;
  };
  fusedClassificationAccuracy: {
    opticalAlone: string;
    sarAlone: string;
    fusedOpticalSar: string;
  };
  featureDetections: Array<{
    feature: string;
    opticalSignature: string;
    sarSignature: string;
    fusedVerdict: string;
  }>;
  radarBackscatterReference: {
    waterDecibels: string;
    calmSoilDecibels: string;
    forestDecibels: string;
    urbanDecibels: string;
  };
}

export interface TimeSeriesPoint {
  year: number;
  builtUpKm2: number;
  vegetationKm2: number;
  waterKm2: number;
  trendlineKm2: number;
  annualChangePercent: number;
}

export interface FutureProjectionPoint {
  year: number;
  projectedBuiltUpKm2: number;
  lowerConfidenceBound: number;
  upperConfidenceBound: number;
}

export interface TimeSeriesResult {
  regionName: string;
  verdict: 'INCREASED' | 'DECREASED' | 'REMAINED_UNCHANGED';
  verdictHeadline: string;
  cagrPercentage: number;
  linearRegression: {
    slopeKm2PerYear: number;
    rSquared: number;
    pValue: number;
    equation: string;
  };
  timeSeriesPoints: TimeSeriesPoint[];
  futureProjections: FutureProjectionPoint[];
  scikitLearnAnalysis: {
    modelType: string;
    meanSquaredError: number;
    pixelCountCalibration: string;
    netPixelGain: string;
  };
  scientificInterpretation: string;
}

export interface SatellitePresetScene {
  id: string;
  title: string;
  category: 'urban' | 'water' | 'forest' | 'infrastructure' | 'agriculture' | 'disaster';
  sensor: string;
  resolution: string;
  acquisitionDate: string;
  coordinates: string;
  description: string;
  imageUrl: string;
  groundingQueries: string[];
}

export interface BiTemporalPairPreset {
  id: string;
  title: string;
  dateA: string;
  dateB: string;
  location: string;
  sensor: string;
  description: string;
  imageAUrl: string;
  imageBUrl: string;
  scenarioContext: string;
}

export interface SensorFusionPreset {
  id: string;
  title: string;
  location: string;
  weatherCondition: string;
  opticalImageUrl: string;
  sarImageUrl: string;
  fusedImageUrl: string;
  cloudMaskUrl: string;
  description: string;
}
