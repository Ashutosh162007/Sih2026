/**
 * AI Service for Sahayog
 * Performs:
 * 1. AI Problem Statement Synthesis (converting short citizen descriptions to structured problem statements)
 * 2. Domain & Category Classification
 * 3. Multi-factor Severity & Risk Assessment (Flooding, Public Risk, Urgency, Priority)
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

/**
 * Intelligent NLP Problem Synthesis & Severity Evaluation
 */
async function analyzeProblemWithAI({ title = '', description = '', category = '', location = {} }) {
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
};
