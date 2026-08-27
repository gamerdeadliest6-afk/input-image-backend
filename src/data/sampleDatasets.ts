import {
  SatellitePresetScene,
  BiTemporalPairPreset,
  SensorFusionPreset,
  TimeSeriesResult,
} from '../types';

export const LULC_COLORS: Record<string, string> = {
  'Urban / Built-up': '#ef4444',
  'Dense Urban / Built-up': '#dc2626',
  'Suburban Residential': '#f97316',
  'Industrial & Logistics': '#ea580c',
  'Vegetation / Canopy': '#22c55e',
  'Dense Forest / Rainforest': '#15803d',
  'Shrubland / Grassland': '#84cc16',
  'Water Bodies': '#06b6d4',
  'Deep Ocean / Estuary': '#0284c7',
  'River / Reservoir': '#38bdf8',
  'Agricultural Land': '#eab308',
  'Cultivated Cropland': '#ca8a04',
  'Bare Soil / Sand': '#d97706',
  'Exposed Rock / Mineral': '#78716c',
  'Snow / Ice Glacier': '#93c5fd',
  'Solar PV Array': '#6366f1',
  'Transport Infrastructure': '#a855f7',
};

// Curated high-res satellite scenes for VLM & Grounding
export const SATELLITE_PRESET_SCENES: SatellitePresetScene[] = [
  {
    id: 'dubai-palm',
    title: 'Coastal Megacity & Marine Reclamation',
    category: 'urban',
    sensor: 'Sentinel-2 MSI (10m GSD)',
    resolution: '10m / pixel',
    acquisitionDate: '2025-03-12',
    coordinates: '25.1124° N, 55.1390° E',
    description: 'Artificial coastal archipelagos, high-density skyscrapers, deep seawater channels, and surrounding arid desert.',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    groundingQueries: [
      'Highlight the water body referred to in the query',
      'Outline the coastal shoreline and reclamation parcels',
      'Segment the high-density built-up skyscraper district',
      'Highlight the marina boat docks and water channels',
    ],
  },
  {
    id: 'amazon-river',
    title: 'Amazon River Basin & Rainforest Estuary',
    category: 'water',
    sensor: 'Landsat-9 OLI-2 (15m Pan)',
    resolution: '15m / pixel',
    acquisitionDate: '2024-11-04',
    coordinates: '3.4653° S, 62.2159° W',
    description: 'Meandering muddy sediment river system traversing primary rainforest canopy, oxbow lakes, and riparian wetlands.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    groundingQueries: [
      'Highlight the water body referred to in the query',
      'Segment the main meandering river channel',
      'Highlight the dense rainforest canopy',
      'Outline the river sandbars and sediment deposits',
    ],
  },
  {
    id: 'airport-hub',
    title: 'International Airport & Logistics Intermodal Hub',
    category: 'infrastructure',
    sensor: 'PlanetScope SuperDove (3m GSD)',
    resolution: '3m / pixel',
    acquisitionDate: '2025-01-20',
    coordinates: '33.9416° N, 118.4085° W',
    description: 'Dual runway complexes, passenger terminals, aircraft taxiways, apron parking, and highway interchanges.',
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
    groundingQueries: [
      'Segment the main runway strip',
      'Highlight the airport terminal building',
      'Outline the aircraft apron and parking stands',
      'Highlight the surrounding road intersection',
    ],
  },
  {
    id: 'desert-solar',
    title: 'Noor Ultra-Scale Solar Photovoltaic Park',
    category: 'infrastructure',
    sensor: 'Sentinel-2 MSI (10m GSD)',
    resolution: '10m / pixel',
    acquisitionDate: '2024-09-18',
    coordinates: '30.9328° N, 6.8672° W',
    description: 'Vast geometrical arrays of photovoltaic solar modules and parabolic solar thermal troughs in arid desert basin.',
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    groundingQueries: [
      'Highlight the solar panel arrays',
      'Segment the central solar thermal tower',
      'Outline the desert access roads',
      'Highlight the barren sand terrain',
    ],
  },
  {
    id: 'circular-farms',
    title: 'Center-Pivot Irrigation Agricultural Fields',
    category: 'agriculture',
    sensor: 'Sentinel-2 MSI (10m GSD)',
    resolution: '10m / pixel',
    acquisitionDate: '2024-08-15',
    coordinates: '30.0444° N, 27.2421° E',
    description: 'High-contrast green circular center-pivot irrigated agricultural parcels surrounded by barren hyper-arid desert terrain.',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    groundingQueries: [
      'Highlight the circular agricultural crops',
      'Segment the barren desert ground',
      'Highlight the central irrigation pivot wells',
      'Outline the highest NDVI vegetation circles',
    ],
  },
  {
    id: 'alpine-glacier',
    title: 'Glacial Tongue & Alpine Meltwater Reservoir',
    category: 'disaster',
    sensor: 'WorldView-3 (0.3m GSD)',
    resolution: '0.5m / pixel',
    acquisitionDate: '2024-07-28',
    coordinates: '46.5000° N, 8.0333° E',
    description: 'Crevasse-filled glacial ice mass terminating into a turquoise glacial flour meltwater lake framed by jagged rocky ridges.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    groundingQueries: [
      'Highlight the water body referred to in the query',
      'Segment the glacial ice snout',
      'Highlight the moraine rock debris',
      'Outline the alpine snowpack zones',
    ],
  },
];

// Curated Bi-Temporal Satellite Image Pairs for Change Detection
export const BITEMPORAL_PRESETS: BiTemporalPairPreset[] = [
  {
    id: 'urban-sprawl',
    title: 'Metropolitan Suburban Expansion & Highway Corridor',
    dateA: '2018 (Baseline)',
    dateB: '2025 (Current)',
    location: 'Metropolitan Growth Boundary (Austin-San Antonio Corridor)',
    sensor: 'Sentinel-2 Twin Pass (10m)',
    description: 'Farmland and scrubland converted into planned subdivisions, logistics warehousing, and 6-lane tollway extension.',
    imageAUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', // Agricultural / Open
    imageBUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80', // Built-up / Urban Sprawl
    scenarioContext: 'Rapid residential master-planned community construction over former agricultural acreage.',
  },
  {
    id: 'amazon-logging',
    title: 'Amazon Deforestation & Fishbone Logging Tracks',
    dateA: '2019 (Intact Canopy)',
    dateB: '2024 (Post-Clearance)',
    location: 'Rondônia / Pará State, Brazil',
    sensor: 'Landsat-8 to Landsat-9 Harmonized (15m)',
    description: 'Pristine rainforest canopy fragmented by illegal logging roads, cattle ranch burning, and clearcut pasture conversions.',
    imageAUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80', // Dense Forest
    imageBUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80', // Cleared / Dry
    scenarioContext: 'Fishbone logging pattern expanding into primary Amazon rainforest reserve.',
  },
  {
    id: 'river-flood',
    title: 'Monsoon Flood Inundation & Riverbank Breach',
    dateA: 'Pre-Monsoon (Dry Baseline)',
    dateB: 'Post-Monsoon (Peak Flood)',
    location: 'Brahmaputra Floodplain, Assam',
    sensor: 'Sentinel-1 SAR + Sentinel-2 Optical (10m)',
    description: 'Catastrophic river swell submerging low-lying agricultural plains, road cutoffs, and displacement of embankments.',
    imageAUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    imageBUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    scenarioContext: 'Severe 1-in-50 year flood event overflowing primary drainage levees.',
  },
  {
    id: 'wildfire-scar',
    title: 'Wildfire Burn Severity & Canopy Destruction',
    dateA: 'Pre-Fire (June 2023)',
    dateB: 'Post-Fire (September 2023)',
    location: 'Sierra Nevada Wilderness, California',
    sensor: 'Sentinel-2 NBR / SWIR Band Analysis',
    description: 'High-severity wildfire consumption of coniferous forest canopy leaving ash deposition and exposed mineral soil.',
    imageAUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    imageBUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    scenarioContext: 'Crown fire consuming 12,000 hectares of montane forest ecosystem.',
  },
];

// Multi-Sensor Fusion Presets (Optical vs SAR vs Cloud-Penetrating Fused)
export const SENSOR_FUSION_PRESETS: SensorFusionPreset[] = [
  {
    id: 'cloud-port',
    title: 'Cloud-Covered Commercial Deepwater Port',
    location: 'Rotterdam Port Channel, Netherlands',
    weatherCondition: 'Heavy maritime stratus cloud bank (92% optical obscuration)',
    opticalImageUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80', // Cloud obscured
    sarImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80', // High contrast texture/radar
    fusedImageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80', // Clean fused
    cloudMaskUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80',
    description: 'Optical imagery is almost entirely blocked by maritime cloud cover. Sentinel-1 C-band SAR backscatter reveals metal container gantries, ship hulls, and concrete breakwaters with zero atmospheric attenuation.',
  },
  {
    id: 'rainforest-flooding',
    title: 'Persistent Cloud-Belt Tropical Rainforest Inundation',
    location: 'Congo Basin Wetlands, Central Africa',
    weatherCondition: 'Intertropical Convergence Zone convective thunderstorms & smoke haze',
    opticalImageUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80',
    sarImageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    fusedImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    cloudMaskUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80',
    description: 'Cloud cover is persistent year-round. SAR cross-polarization VH penetrates the canopy and cloud layer, detecting flooded forest floor double-bounce scattering.',
  },
];

// Pre-computed fallback / sample time-series results
export const DEFAULT_TIMESERIES_DATA: TimeSeriesResult = {
  regionName: 'Austin-Round Rock Megaregion',
  verdict: 'INCREASED',
  verdictHeadline: 'Built-up area expanded by +28.4% (+14.2 sq km) from 2018 to 2026.',
  cagrPercentage: 3.18,
  linearRegression: {
    slopeKm2PerYear: 1.77,
    rSquared: 0.984,
    pValue: 0.0001,
    equation: 'Built-Up Area = 1.77 × (Year - 2018) + 50.2 km²',
  },
  timeSeriesPoints: [
    { year: 2018, builtUpKm2: 50.2, vegetationKm2: 85.4, waterKm2: 24.4, trendlineKm2: 50.2, annualChangePercent: 0 },
    { year: 2019, builtUpKm2: 51.8, vegetationKm2: 84.1, waterKm2: 24.1, trendlineKm2: 52.0, annualChangePercent: 3.19 },
    { year: 2020, builtUpKm2: 53.6, vegetationKm2: 82.5, waterKm2: 23.9, trendlineKm2: 53.7, annualChangePercent: 3.47 },
    { year: 2021, builtUpKm2: 55.4, vegetationKm2: 80.9, waterKm2: 23.7, trendlineKm2: 55.5, annualChangePercent: 3.36 },
    { year: 2022, builtUpKm2: 57.1, vegetationKm2: 79.5, waterKm2: 23.4, trendlineKm2: 57.3, annualChangePercent: 3.07 },
    { year: 2023, builtUpKm2: 59.2, vegetationKm2: 77.8, waterKm2: 23.0, trendlineKm2: 59.1, annualChangePercent: 3.68 },
    { year: 2024, builtUpKm2: 61.1, vegetationKm2: 76.2, waterKm2: 22.7, trendlineKm2: 60.8, annualChangePercent: 3.21 },
    { year: 2025, builtUpKm2: 62.9, vegetationKm2: 74.8, waterKm2: 22.3, trendlineKm2: 62.6, annualChangePercent: 2.95 },
    { year: 2026, builtUpKm2: 64.4, vegetationKm2: 73.5, waterKm2: 22.1, trendlineKm2: 64.4, annualChangePercent: 2.38 },
  ],
  futureProjections: [
    { year: 2027, projectedBuiltUpKm2: 66.2, lowerConfidenceBound: 65.1, upperConfidenceBound: 67.3 },
    { year: 2028, projectedBuiltUpKm2: 68.0, lowerConfidenceBound: 66.6, upperConfidenceBound: 69.4 },
    { year: 2029, projectedBuiltUpKm2: 69.8, lowerConfidenceBound: 68.1, upperConfidenceBound: 71.5 },
    { year: 2030, projectedBuiltUpKm2: 71.5, lowerConfidenceBound: 69.5, upperConfidenceBound: 73.5 },
    { year: 2031, projectedBuiltUpKm2: 73.3, lowerConfidenceBound: 71.0, upperConfidenceBound: 75.6 },
  ],
  scikitLearnAnalysis: {
    modelType: 'Ordinary Least Squares & Polynomial Feature Expansion (Degree 2)',
    meanSquaredError: 0.082,
    pixelCountCalibration: '1 Sentinel-2 Pixel = 100 m² (0.0001 km²)',
    netPixelGain: '+142,000 built-up classified pixels',
  },
  scientificInterpretation:
    'The empirical satellite time-series confirms continuous, statistically significant urbanization (+18.4% per decade) displacing agricultural and forest fringe. The high R² coefficient (0.984) indicates robust linear growth trajectory.',
};
