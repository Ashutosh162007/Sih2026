/**
 * AI Service for Sahayog — Powered by NVIDIA NIM Models
 * Performs:
 * 1. AI Problem Statement Synthesis via NVIDIA's Models (converting citizen reports to formal research formulations)
 * 2. Domain & Category Classification
 * 3. Multi-factor Severity & Risk Assessment (Public Safety, Urgency, Physical/Environmental Vulnerability)
 */

const https = require('https');

const CATEGORY_KEYWORDS = {
  'Water & Sanitation': ['water', 'drain', 'sewage', 'borewell', 'pipeline', 'leakage', 'contamination', 'drinking water', 'tap', 'well', 'sanitation', 'turbidity', 'tanker'],
  'Waste Management': ['waste', 'garbage', 'dump', 'trash', 'leachate', 'plastic', 'landfill', 'litter', 'compost', 'odour', 'rubbish', 'refuse'],
  'Infrastructure': ['road', 'bridge', 'pothole', 'street', 'culvert', 'building', 'flyover', 'crack', 'drainage', 'footpath', 'pavement', 'collapse'],
  'Public Safety': ['streetlight', 'dark', 'light', 'accident', 'crime', 'hazard', 'cctv', 'junction', 'signal', 'danger', 'wiring', 'electrocution', 'safety'],
  'Agriculture': ['crop', 'farmer', 'soil', 'irrigation', 'fertilizer', 'pest', 'monsoon', 'drought', 'mandi', 'harvest', 'seeds', 'livestock', 'spoilage'],
  'Healthcare': ['hospital', 'clinic', 'phc', 'doctor', 'medicine', 'disease', 'dengue', 'malaria', 'ambulance', 'health', 'fever', 'vaccine', 'fluorosis'],
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
 * Call NVIDIA NIM API directly via HTTPS
 */
async function callNvidiaAPI({ title, description, category, location }) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return null;

  const model = process.env.NVIDIA_MODEL || 'meta/llama-3.2-11b-vision-instruct';
  const locationStr = [location?.block, location?.district, location?.landmark].filter(Boolean).join(', ') || 'Ranchi, Jharkhand';

  const prompt = `You are the Sahayog AI Societal Challenge Evaluation Engine.
Your task is to analyze the reported issue and decide whether it is a genuine, appropriate, and significant civic/societal issue.

EVALUATION CRITERIA:
1. REJECT if the input is unintelligible, random keyboard mashing (e.g. "adfdsafsfasf", "afdafadafdasfdgadsg", "djjnadlfkldfjslf", "adsdsgdsagdsgsdagsdg", "adsdsfsda"), gibberish, spam, offensive/abusive, or fraudulent.
2. REJECT if the issue is TRIVIAL or VERY SMALL (e.g. personal minor inconvenience, lost personal item, domestic triviality, or minor non-civic matters that do not warrant municipal, institutional, or university research attention).
3. ACCEPT if it describes a genuine societal/civic/community challenge (e.g., water supply, sanitation, roads, bridges, public lighting, safety hazards, environmental pollution, waste management, rural livelihoods, public health, agriculture, school infrastructure).

If REJECTED, return ONLY this JSON:
{
  "isLegitimate": false,
  "rejectionReason": "Clear, constructive explanation stating why this reported issue cannot be accepted (e.g. contains unintelligible text, or is a minor personal issue rather than a community civic challenge)."
}

If ACCEPTED, return ONLY this JSON:
{
  "isLegitimate": true,
  "category": "Infrastructure | Water & Sanitation | Waste Management | Public Safety | Environment | Agriculture | Healthcare | Education | Rural Livelihoods | Mobility",
  "priority": "High | Medium | Low",
  "severity": {
    "score": 85,
    "publicRisk": 80,
    "urgency": 90,
    "flooding": 60,
    "factors": ["Risk description 1", "Risk factor 2"]
  },
  "aiProblemStatement": "**Structured Problem Formulation:**\\n\\n**Context & Location:** Locality and District.\\n\\n**Core Challenge:** Formal comprehensive problem description.\\n\\n**Severity Assessment:** Urgency and Public Risk evaluation.\\n\\n**Recommended Innovation Objective:** Actionable engineering/scientific objective for university teams.",
  "aiSummary": "1-sentence executive summary with priority and location."
}

Citizen Submission Details:
Title: ${title}
Description: ${description}
Category Hint: ${category || 'Infrastructure'}
Location: ${locationStr}`;

  return new Promise((resolve) => {
    const data = JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: 'You are the Sahayog AI Civic Challenge Evaluation and Structuring Engine. You strictly evaluate whether a reported issue is genuine, appropriate, and of meaningful civic scale before formulating it into an academic research statement. Output strictly valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });

    const req = https.request({
      hostname: 'integrate.api.nvidia.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(data),
      },
      timeout: 8000,
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parsedRes = JSON.parse(body);
            let content = parsedRes.choices?.[0]?.message?.content?.trim();
            if (content) {
              const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
              if (jsonMatch) content = jsonMatch[1];
              else {
                const s = content.indexOf('{');
                const e = content.lastIndexOf('}');
                if (s !== -1 && e !== -1) content = content.substring(s, e + 1);
              }
              const result = JSON.parse(content);
              return resolve(result);
            }
          }
          resolve(null);
        } catch (e) {
          console.warn('[NVIDIA API Parse Notice] Falling back to local NLP engine:', e.message);
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });

    req.write(data);
    req.end();
  });
}

/**
 * Call Python AI microservice (if running locally at AI_SERVICE_URL)
 */
async function callPythonAIService({ title, description, category, location }) {
  const serviceUrl = process.env.AI_SERVICE_URL;
  if (!serviceUrl) return null;

  try {
    const url = new URL('/api/ai/restructure', serviceUrl);
    const data = JSON.stringify({
      title,
      description,
      complaint_query: description || title,
      category,
      district: location?.district || 'Ranchi',
      block: location?.block || 'Kanke',
      landmark: location?.landmark || '',
    });

    return await new Promise((resolve) => {
      const httpModule = url.protocol === 'https:' ? require('https') : require('http');
      const req = httpModule.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
        timeout: 5000,
      }, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              const parsed = JSON.parse(body);
              if (parsed.success) {
                return resolve({
                  category: parsed.primary_category || category,
                  priority: parsed.priority || 'Medium',
                  aiProblemStatement: parsed.aiProblemStatement,
                  aiSummary: parsed.aiSummary,
                  severity: parsed.severity,
                });
              }
            }
            resolve(null);
          } catch {
            resolve(null);
          }
        });
      });

      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
      req.write(data);
      req.end();
    });
  } catch {
    return null;
  }
}

/**
 * Helper to detect keyboard mashing and unintelligible text
 */
function isGibberishText(text) {
  if (!text || text.trim().length < 5) return true;
  const words = text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;

  const hasKeyboardMash = words.some((w) => {
    if (w.length >= 6) {
      const uniqueChars = new Set(w.split('')).size;
      const vowels = (w.match(/[aeiou]/g) || []).length;
      if (uniqueChars <= 3 || vowels === 0) return true;
      if (w.length >= 8 && uniqueChars <= 4) return true;
      if (w.length >= 8 && vowels / w.length < 0.15) return true;
      if (/(?:as|df|sd|fa|ds|fd|jk|kj|hl|lh|gh|hg|ad|da|sa){3,}/i.test(w)) return true;
    }
    return false;
  });

  if (hasKeyboardMash) return true;

  const totalLetters = words.join('').length;
  const totalVowels = (words.join('').match(/[aeiou]/g) || []).length;
  if (totalLetters >= 8 && (totalVowels / totalLetters < 0.15 || totalVowels / totalLetters > 0.85)) {
    return true;
  }

  return false;
}

/**
 * Helper to detect trivial / minor personal matters
 */
function isTrivialMatter(text) {
  const lower = (text || '').toLowerCase();
  const trivialTerms = [
    'pen is lost', 'lost my pen', 'shoe dirty', 'leaf fell', 'dropped pencil', 'pencil broke',
    'my dog barked', 'cat meowed', 'homework hard', 'video game lag', 'shirt stained', 'food cold'
  ];
  return trivialTerms.some((t) => lower.includes(t));
}

/**
 * Deterministic Fallback NLP Problem Synthesis & Severity Evaluation
 */
function localNLPAnalysis({ title = '', description = '', category = '', location = {} }) {
  const combinedText = `${title} ${description}`.toLowerCase();

  // 1. Check for unintelligible text or keyboard mashing
  if (isGibberishText(combinedText)) {
    return {
      isLegitimate: false,
      rejectionReason: 'The AI model evaluated the submission and determined it contains unintelligible or random keyboard text. Please provide clear details about an actual community challenge.',
    };
  }

  // 2. Check for trivial / petty personal matters
  if (isTrivialMatter(combinedText)) {
    return {
      isLegitimate: false,
      rejectionReason: 'The AI model determined that this submission describes a minor personal matter rather than a significant civic or municipal challenge.',
    };
  }
  
  // 3. Domain / Category Classification
  let bestCategory = category || 'Infrastructure';
  let highestMatchScore = 0;

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matchCount = keywords.reduce((count, kw) => count + (combinedText.includes(kw) ? 1 : 0), 0);
    if (matchCount > highestMatchScore) {
      highestMatchScore = matchCount;
      bestCategory = cat;
    }
  }

  // 4. Severity Factor Calculations
  let urgency = 45;
  let publicRisk = 40;
  let floodingOrPhysical = 30;
  const factors = [];

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

  const locationStr = [location.block, location.district, location.landmark].filter(Boolean).join(', ') || 'the locality';
  
  const aiProblemStatement = `**Structured Problem Formulation:**\n\n` +
    `**Context & Location:** A critical civic challenge has been reported in ${locationStr} concerning **${bestCategory}**.\n\n` +
    `**Core Issue:** ${description.trim() ? description : title}. The challenge presents direct consequences on daily community life, civic safety, and public resource access.\n\n` +
    `**Severity Assessment (${priority} Priority - Score ${compositeScore}/100):** Evaluated risk factors include Public Safety Risk (${publicRisk}%), Urgency for Intervention (${urgency}%), and Physical/Environmental Vulnerability (${floodingOrPhysical}%).\n\n` +
    `**Recommended Innovation Objective for Universities:** Formulate an engineering, scientific, or technological mitigation plan addressing root causes, community sustainability, and deployable prototyping.`;

  const aiSummary = `AI identified ${priority.toLowerCase()} priority ${bestCategory.toLowerCase()} challenge in ${locationStr} with ${compositeScore}% overall severity score.`;

  return {
    isLegitimate: true,
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

/**
 * Main AI Analysis Entrypoint:
 * Priority 1: Direct NVIDIA API (via NVIDIA_API_KEY)
 * Priority 2: Python AI Microservice (via AI_SERVICE_URL)
 * Priority 3: Local Deterministic NLP Analyzer (Fallback)
 */
async function analyzeProblemWithAI({ title = '', description = '', category = '', location = {} }) {
  // 1. Send all filled details directly to NVIDIA Model for evaluation & structuring
  if (process.env.NVIDIA_API_KEY) {
    try {
      const nvidiaResult = await callNvidiaAPI({ title, description, category, location });
      if (nvidiaResult) {
        if (nvidiaResult.isLegitimate === false) {
          return {
            isLegitimate: false,
            rejectionReason: nvidiaResult.rejectionReason || 'The NVIDIA AI model flagged this content as unintelligible, inappropriate, or non-civic.',
          };
        }
        if (nvidiaResult.aiProblemStatement && nvidiaResult.severity) {
          return {
            isLegitimate: true,
            category: nvidiaResult.category || category || 'Infrastructure',
            aiProblemStatement: nvidiaResult.aiProblemStatement,
            aiSummary: nvidiaResult.aiSummary || `NVIDIA AI evaluated ${nvidiaResult.priority || 'High'} priority challenge in ${location?.district || 'Ranchi'}.`,
            severity: {
              flooding: nvidiaResult.severity?.flooding || 40,
              publicRisk: nvidiaResult.severity?.publicRisk || 75,
              urgency: nvidiaResult.severity?.urgency || 80,
              score: nvidiaResult.severity?.score || 78,
              factors: nvidiaResult.severity?.factors || ['Evaluated via NVIDIA NIM Model'],
            },
            priority: nvidiaResult.priority || 'High',
          };
        }
      }
    } catch (e) {
      console.warn('[NVIDIA Integration Warning]', e.message);
    }
  }

  // 2. Try Python AI Microservice
  const pyResult = await callPythonAIService({ title, description, category, location });
  if (pyResult) return pyResult;

  // 3. Fallback
  return localNLPAnalysis({ title, description, category, location });
}

module.exports = {
  analyzeProblemWithAI,
};
