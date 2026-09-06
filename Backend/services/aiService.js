/**
 * AI Service for Sahayog
 * Performs:
 * 1. AI Problem Statement Synthesis (converting short citizen descriptions to structured problem statements)
 * 2. Domain & Category Classification
 * 3. Multi-factor Severity & Risk Assessment (Flooding, Public Risk, Urgency, Priority)
 *
 * Two providers:
 *  - LLM provider: calls the Python FastAPI service (AI/app.py) which uses a
 *    Mistral/LangChain pipeline to structure, classify, and score the complaint.
 *  - Heuristic provider (fallback): keyword-based classification + composite severity.
 *    Used when the AI service is disabled, unreachable, or errors.
 */

const CATEGORY_KEYWORDS = {
  'Water & Sanitation': ['water', 'drain', 'sewage', 'borewell', 'pipeline', 'leakage', 'contamination', 'drinking water', 'tap', 'well', 'sanitation', 'turbidity', 'tanker'],
  'Waste Management': ['waste', 'garbage', 'dump', 'trash', 'leachate', 'plastic', 'landfill', 'litter', 'compost', 'odour', 'rubbish', 'refuse'],
  'Infrastructure': ['road', 'bridge', 'pothole', 'street', 'culvert', 'building', 'flyover', 'crack', 'drainage', 'footpath', 'pavement', 'collapse'],
  'Public Safety': ['streetlight', 'dark', 'light', 'accident', 'crime', 'hazard', 'cctv', 'junction', 'signal', 'danger', 'wiring', 'electrocution', 'safety'],
  'Agriculture': ['crop', 'farmer', 'soil', 'irrigation', 'fertilizer', 'pest', 'monsoon', 'drought', 'mandi', 'harvest', 'seeds', 'livestock'],
  'Healthcare': ['hospital', 'clinic', 'phc', 'doctor', 'medicine', 'disease', 'dengue', 'malaria', 'ambulance', 'health', 'fever', 'vaccine'],
  'Environment': ['pollution', 'tree', 'forest', 'air', 'smoke', 'river', 'mining', 'dust', 'emission', 'wildlife', 'conservation', 'erosion'],
  'Rural Livelihoods': ['handicraft', 'tribal', 'artisan', 'weaving', 'forest produce', 'employment', 'self help group', 'shg', 'skill', 'income'],
  'Education': ['school', 'classroom', 'teacher', 'bench', 'blackboard', 'books', 'midday meal', 'laboratory', 'student', 'college', 'dropout'],
  'Mobility': ['bus', 'auto', 'transport', 'connectivity', 'traffic', 'rickshaw', 'route', 'congestion', 'station', 'stop'],
};

const HIGH_SEVERITY_TRIGGERS = [
  'accident', 'death', 'casualty', 'danger', 'fatal', 'urgent', 'severe', 'immediate',
  'flood', 'outbreak', 'poison', 'electrocution', 'collapse', 'epidemic', 'blocked',
  'hospital', 'school children', 'infant', 'senior citizen', 'critical'
];

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_LLM_ENABLED = process.env.AI_LLM_ENABLED === 'true';
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS) || 6000;

// Map the LLM's canonical categories to the UI-facing category enum used by the Issue model.
const CANONICAL_TO_UI_CATEGORY = {
  EDUCATION: 'Education',
  AGRICULTURE: 'Agriculture',
  HEALTHCARE: 'Healthcare',
  WATER_RESOURCES: 'Water & Sanitation',
  ENVIRONMENT: 'Environment',
  ENERGY: 'Infrastructure',
  URBAN_DEVELOPMENT: 'Infrastructure',
  ACCESSIBILITY: 'Infrastructure',
  PUBLIC_ADMINISTRATION: 'Other',
  RURAL_LIVELIHOODS: 'Rural Livelihoods',
};

// Numeric severity breakdown per LLM severity label, for compatibility with the Issue model.
const SEVERITY_MAP = {
  CRITICAL: { score: 90, urgency: 95, publicRisk: 95, priority: 'High' },
  HIGH: { score: 74, urgency: 80, publicRisk: 78, priority: 'High' },
  MEDIUM: { score: 55, urgency: 58, publicRisk: 52, priority: 'Medium' },
  LOW: { score: 35, urgency: 38, publicRisk: 34, priority: 'Low' },
};

/**
 * Call the Python LLM service to structure & classify a complaint.
 * Returns null on any failure so callers can transparently fall back.
 */
async function callLLMService({ title = '', description = '', category = '', location = {} }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const payload = {
      user_id: '',
      user_name: '',
      complaint_query: `${title}${description ? '\n' + description : ''}`,
      title,
      district: location.district || null,
      block: location.block || null,
    };

    const res = await fetch(`${AI_SERVICE_URL}/ai/structure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`[AI Service] HTTP ${res.status} from ${AI_SERVICE_URL}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('[AI Service] Request timed out — falling back to heuristic engine.');
    } else {
      console.error(`[AI Service] Request failed: ${err.message} — falling back to heuristic engine.`);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Convert an LLM-structured record into the same shape the controllers expect.
 */
async function analyzeProblemWithLLM({ title = '', description = '', category = '', location = {} }) {
  const raw = await callLLMService({ title, description, category, location });
  if (!raw || typeof raw !== 'object') return null;

  const canonical = (raw.primary_category || '').toUpperCase();
  const uiCategory = CANONICAL_TO_UI_CATEGORY[canonical] || category || 'Other';
  const severityKey = String(raw.severity || 'MEDIUM').toUpperCase();
  const severity = SEVERITY_MAP[severityKey] || SEVERITY_MAP.MEDIUM;

  const locationStr = [location.block, location.district, location.landmark].filter(Boolean).join(', ') || 'the locality';
  const structured = (raw.structured_complaint || description || title).trim();

  const aiProblemStatement =
    `**Structured Problem Formulation (AI):**\n\n` +
    `**Context & Location:** ${raw.location?.district || location.district || locationStr} (${uiCategory}).\n\n` +
    `**Core Issue:** ${structured}\n\n` +
    `**Severity Assessment (${severityKey} — ${severity.priority} Priority, Score ${severity.score}/100):** ` +
    `Public Safety Risk ${severity.publicRisk}%, Urgency for Intervention ${severity.urgency}%.\n\n` +
    (raw.routing?.recommended_department
      ? `**Recommended Department:** ${raw.routing.recommended_department} (initial recipient: ${raw.routing.recipient_type}).\n\n`
      : '') +
    (raw?.needs_more_information && Array.isArray(raw?.missing_information) && raw.missing_information.length
      ? `**Missing Information:** ${raw.missing_information.join(', ')}.\n\n`
      : '') +
    `**Recommended Innovation Objective for Universities:** Develop a deployable, sustainable mitigation solution addressing root causes with community validation.`;

  const aiSummary =
    `AI (LLM) identified a ${severityKey.toLowerCase()} severity, ${severity.priority.toLowerCase()} priority ` +
    `${uiCategory.toLowerCase()} challenge in ${locationStr}` +
    ` with ${raw.classification_confidence != null ? Math.round(raw.classification_confidence * 100) : 'n/a'}% confidence`;

  return {
    category: uiCategory,
    aiProblemStatement,
    aiSummary,
    severity: {
      flooding: 40,
      publicRisk: severity.publicRisk,
      urgency: severity.urgency,
      score: severity.score,
      factors: raw?.needs_more_information ? ['Additional information flagged as missing'] : [],
    },
    priority: severity.priority,
    // Extra metadata for future persistence
    llm: {
      primary_category: raw.primary_category,
      secondary_category: raw.secondary_category || null,
      severity: severityKey,
      recommended_department: raw.routing?.recommended_department || null,
      recipient_type: raw.routing?.recipient_type || null,
      duplicate_status: raw.duplicate_status || 'UNKNOWN',
      classification_confidence: raw.classification_confidence ?? null,
      needs_more_information: raw.needs_more_information || false,
      missing_information: Array.isArray(raw.missing_information) ? raw.missing_information : [],
    },
  };
}

/**
 * Intelligent NLP Problem Synthesis & Severity Evaluation
 * Uses the LLM service when enabled (AI_LLM_ENABLED=true), otherwise falls
 * back silently to the built-in keyword heuristic engine.
 */
async function analyzeProblemWithAI({ title = '', description = '', category = '', location = {} }) {

  if (AI_LLM_ENABLED) {
    const llmResult = await analyzeProblemWithLLM({ title, description, category, location });
    if (llmResult) return llmResult;
  }

  const combinedText = `${title} ${description}`.toLowerCase();
  
  // 1. Domain / Category Classification
  let bestCategory = category || 'Infrastructure';
  let highestMatchScore = 0;

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matchCount = keywords.reduce((count, kw) => count + (combinedText.includes(kw) ? 1 : 0), 0);
    if (matchCount > highestMatchScore) {
      highestMatchScore = matchCount;
      bestCategory = cat;
    }
  }

  // 2. Severity Factor Calculations
  let urgency = 45;
  let publicRisk = 40;
  let floodingOrPhysical = 30;
  const factors = [];

  // Check high severity triggers
  HIGH_SEVERITY_TRIGGERS.forEach((kw) => {
    if (combinedText.includes(kw)) {
      urgency += 12;
      publicRisk += 14;
      factors.push(`Contains critical alert term: "${kw}"`);
    }
  });

  if (combinedText.includes('flood') || combinedText.includes('water') || combinedText.includes('drain') || combinedText.includes('rain')) {
    floodingOrPhysical += 40;
    factors.push('Waterlogging / hydrological risk detected');
  }

  if (combinedText.includes('collapse') || combinedText.includes('road') || combinedText.includes('bridge') || combinedText.includes('crack')) {
    floodingOrPhysical += 35;
    factors.push('Structural / physical integrity risk');
  }

  if (combinedText.includes('night') || combinedText.includes('dark') || combinedText.includes('women') || combinedText.includes('children') || combinedText.includes('school')) {
    publicRisk += 25;
    urgency += 15;
    factors.push('Vulnerable population / nighttime safety hazard');
  }

  // Clamp scores between 10 and 98
  urgency = Math.min(98, Math.max(15, Math.round(urgency)));
  publicRisk = Math.min(98, Math.max(15, Math.round(publicRisk)));
  floodingOrPhysical = Math.min(98, Math.max(10, Math.round(floodingOrPhysical)));

  const compositeScore = Math.round((urgency * 0.4) + (publicRisk * 0.4) + (floodingOrPhysical * 0.2));
  
  let priority = 'Medium';
  if (compositeScore >= 70 || urgency >= 75 || publicRisk >= 75) {
    priority = 'High';
  } else if (compositeScore < 45 && publicRisk < 45) {
    priority = 'Low';
  }

  // 3. AI Formal Problem Statement Generation
  const locationStr = [location.block, location.district, location.landmark].filter(Boolean).join(', ') || 'the locality';
  
  const aiProblemStatement = `**Structured Problem Formulation:**\n\n` +
    `**Context & Location:** A critical civic challenge has been reported in ${locationStr} concerning **${bestCategory}**.\n\n` +
    `**Core Issue:** ${description.trim() ? description : title}. The challenge presents direct consequences on daily community life, civic safety, and public resource access.\n\n` +
    `**Severity Assessment (${priority} Priority - Score ${compositeScore}/100):** Evaluated risk factors include Public Safety Risk (${publicRisk}%), Urgency for Intervention (${urgency}%), and Physical/Environmental Vulnerability (${floodingOrPhysical}%).\n\n` +
    `**Recommended Innovation Objective for Universities:** Formulate an engineering, scientific, or technological mitigation plan addressing root causes, community sustainability, and deployable prototyping.`;

  const aiSummary = `AI identified ${priority.toLowerCase()} priority ${bestCategory.toLowerCase()} challenge in ${locationStr} with ${compositeScore}% overall severity score.`;

  return {
    category: bestCategory,
    aiProblemStatement,
    aiSummary,
    severity: {
      flooding: floodingOrPhysical,
      publicRisk,
      urgency,
      score: compositeScore,
      factors,
    },
    priority,
  };
}

module.exports = {
  analyzeProblemWithAI,
  analyzeProblemWithLLM,
  callLLMService,
};
