/**
 * Clubbing Service for Sahayog
 * Clubs many related civic issues ("problem statements") into ONE unified problem.
 *
 * Funnel:
 * 1. Territory gate  — issues must be in the same district AND block
 *    (falls back to geo radius when a block is missing).
 * 2. Category gate   — only same-domain issues compete.
 * 3. Similarity      — normalized Jaccard overlap on issue text; issues at/above
 *                      the threshold join the same club (single-linkage union-find).
 * 4. Synthesis       — each club collapses into one unified problem statement
 *                      (title, merged description, territory/location centroid,
 *                      worst-case severity, member list).
 */

const Issue = require('../models/Issue');

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'of', 'to', 'for', 'with',
  'is', 'are', 'was', 'were', 'be', 'been', 'this', 'that', 'these', 'those', 'it',
  'its', 'from', 'by', 'as', 'has', 'have', 'had', 'do', 'does', 'did', 'not', 'no',
  'per', 'ph', 'near', 'around', 'there', 'which', 'what', 'when', 'where', 'how',
  'also', 'get', 'got', 'very', 'like', 'than', 'then', 'so', 'too', 'we', 'they',
  'our', 'their', 'your', 'my', 'i', 'you', 'he', 'she', 'them', 'us', 'about',
]);

const DEFAULT_CONFIG = {
  similarityThreshold: 0.35,
  minClubSize: 2,
  maxDistanceKm: 5,
  maxReports: 500,
};

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

const MIN_TOKENS = 4;

function jaccard(aTokens, bTokens) {
  if (!aTokens.length || !bTokens.length) return 0;
  const aSet = new Set(aTokens);
  const bSet = new Set(bTokens);
  let intersection = 0;
  for (const tok of aSet) {
    if (bSet.has(tok)) intersection++;
  }
  const union = aSet.size + bSet.size - intersection;
  return union ? intersection / union : 0;
}

function overlapCoefficient(aTokens, bTokens) {
  if (!aTokens.length || !bTokens.length) return 0;
  const [smaller, larger] =
    aTokens.length <= bTokens.length ? [aTokens, bTokens] : [bTokens, aTokens];
  const largerSet = new Set(larger);
  let intersection = 0;
  for (const tok of smaller) {
    if (largerSet.has(tok)) intersection++;
  }
  return intersection / smaller.length;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function normalize(str) {
  return String(str || '').trim().toLowerCase();
}

function inSameTerritory(a, b, maxDistanceKm) {
  if (normalize(a.district) !== normalize(b.district)) return false;
  const aBlock = normalize(a.block);
  const bBlock = normalize(b.block);
  if (aBlock && bBlock) return aBlock === bBlock;
  return haversineKm(a.lat, a.lng, b.lat, b.lng) <= maxDistanceKm;
}

function worstCaseSeverity(members) {
  return {
    flooding: Math.max(...members.map((m) => m.severity?.flooding || 0)),
    publicRisk: Math.max(...members.map((m) => m.severity?.publicRisk || 0)),
    urgency: Math.max(...members.map((m) => m.severity?.urgency || 0)),
    score: Math.max(...members.map((m) => m.severity?.score || 0)),
    factors: [...new Set(members.flatMap((m) => m.severity?.factors || []))],
  };
}

function clubPriority(members) {
  if (members.some((m) => m.priority === 'High')) return 'High';
  if (members.some((m) => m.priority === 'Medium')) return 'Medium';
  return 'Low';
}

function synthesizeClub(members, config) {
  const sorted = [...members].sort(
    (a, b) =>
      (b.severity?.score || 0) - (a.severity?.score || 0) ||
      (b.upvotes || 0) - (a.upvotes || 0) ||
      (a.createdAt || 0) - (b.createdAt || 0)
  );
  const lead = sorted[0];
  const category = lead.category;
  const territory = `${lead.block || 'Block'}, ${lead.district}`;
  const landmarks = [...new Set(members.map((m) => m.landmark).filter(Boolean))];
  const avgLat = members.reduce((s, m) => s + (m.lat || 0), 0) / members.length;
  const avgLng = members.reduce((s, m) => s + (m.lng || 0), 0) / members.length;
  const totalUpvotes = members.reduce((s, m) => s + (m.upvotes || 0), 0);
  const severity = worstCaseSeverity(members);

  const description = [
    lead.description,
    landmarks.length ? `Also reported around: ${landmarks.slice(0, 6).join(', ')}.` : '',
    `Clubbed from ${members.length} overlapping reports (${totalUpvotes} upvotes).`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const aiProblemStatement =
    `**Clubbed Problem Statement (${category}):**\n\n` +
    `**Territory:** ${territory} — ${members.length} overlapping citizen reports merged into one problem.\n\n` +
    `**Core Challenge:** ${description}\n\n` +
    `**Severity Assessment (${clubPriority(members)} Priority - Score ${severity.score}/100):** ` +
    `Public Safety Risk: ${severity.publicRisk}%, Urgency for Intervention: ${severity.urgency}%, ` +
    `Physical/Environmental Vulnerability: ${severity.flooding}%.\n\n` +
    `**Recommended Innovation Objective:** Formulate a single multidisciplinary solution addressing the clustered reports located at ` +
    `${avgLat.toFixed(4)}, ${avgLng.toFixed(4)}.`;

  return {
    lead: {
      id: lead._id,
      _id: lead._id,
      title: lead.title,
    },
    leadId: lead._id,
    title: `${category} — ${territory} (${members.length} reports clubbed)`,
    category,
    description,
    aiProblemStatement,
    priority: clubPriority(members),
    severity,
    status: 'New',
    district: lead.district,
    block: lead.block,
    lat: avgLat,
    lng: avgLng,
    count: members.length,
    memberIds: members.map((m) => m._id),
    members: members.map((m) => ({
      id: m._id,
      _id: m._id,
      title: m.title,
      description: m.description,
      landmark: m.landmark,
      district: m.district,
      block: m.block,
      lat: m.lat,
      lng: m.lng,
      upvotes: m.upvotes || 0,
      priority: m.priority,
      severityScore: m.severity?.score || 0,
      reporterName: m.reporterName,
      createdAt: m.createdAt,
    })),
  };
}

async function extractClubs(options = {}) {
  const config = {
    similarityThreshold: options.similarityThreshold ?? DEFAULT_CONFIG.similarityThreshold,
    minClubSize: options.minClubSize ?? DEFAULT_CONFIG.minClubSize,
    maxDistanceKm: options.maxDistanceKm ?? DEFAULT_CONFIG.maxDistanceKm,
    maxReports: options.maxReports ?? DEFAULT_CONFIG.maxReports,
  };
  const { issueIds, district, block, category } = options;

  const query = { status: { $ne: 'Resolved' } };
  if (Array.isArray(issueIds) && issueIds.length) query._id = { $in: issueIds };
  if (district) query.district = new RegExp(district, 'i');
  if (block) query.block = new RegExp(block, 'i');
  if (category) query.category = category;

  const issues = await Issue.find(query)
    .sort({ createdAt: -1 })
    .limit(config.maxReports);
  if (issues.length < config.minClubSize) return [];

  const buckets = new Map();
  for (const issue of issues) {
    const key = `${normalize(issue.district)}|${issue.category}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(issue);
  }

  const clubs = [];
  for (const bucketIssues of buckets.values()) {
    const n = bucketIssues.length;
    if (n < config.minClubSize) continue;

    const tokens = bucketIssues.map((i) => tokenize(`${i.title} ${i.description}`));
    const parent = Array.from({ length: n }, (_, i) => i);
    const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    const union = (a, b) => {
      parent[find(a)] = find(b);
    };

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (!inSameTerritory(bucketIssues[i], bucketIssues[j], config.maxDistanceKm)) continue;
        if (tokens[i].length < MIN_TOKENS || tokens[j].length < MIN_TOKENS) continue;
        if (overlapCoefficient(tokens[i], tokens[j]) >= config.similarityThreshold) union(i, j);
      }
    }

    const groups = new Map();
    for (let i = 0; i < n; i++) {
      const root = find(i);
      if (!groups.has(root)) groups.set(root, []);
      groups.get(root).push(bucketIssues[i]);
    }

    for (const group of groups.values()) {
      if (group.length >= config.minClubSize) clubs.push(synthesizeClub(group, config));
    }
  }

  // Persist: every member (including the lead, self-referencing) points to the lead issue.
  for (const club of clubs) {
    await Issue.updateMany(
      { _id: { $in: club.memberIds } },
      { $set: { clubId: club.leadId } }
    );
  }

  return clubs.map((c) => ({ ...c, success: true }));
}

async function autoAttachToClub(issue) {
  if (!issue || !issue._id) return null;
  const textTokens = tokenize(`${issue.title} ${issue.description}`);
  if (textTokens.length < MIN_TOKENS) return null;

  const candidates = await Issue.find({
    _id: { $ne: issue._id },
    category: issue.category,
    district: new RegExp(issue.district || '', 'i'),
    status: { $ne: 'Resolved' },
  })
    .sort({ createdAt: -1 })
    .limit(100);

  let best = null;
  let bestScore = 0;
  for (const cand of candidates) {
    if (!inSameTerritory(issue, cand, DEFAULT_CONFIG.maxDistanceKm)) continue;
    const candTokens = tokenize(`${cand.title} ${cand.description}`);
    if (candTokens.length < MIN_TOKENS) continue;
    const score = overlapCoefficient(textTokens, candTokens);
    if (score > bestScore) {
      bestScore = score;
      best = cand;
    }
  }

  if (!best || bestScore < DEFAULT_CONFIG.similarityThreshold) return null;

  const clubLeadId = best.clubId || best._id;
  issue.clubId = clubLeadId;
  issue.timeline.push({
    at: new Date(),
    label: `Auto-clubbed with "${best.title}" (${Math.round(bestScore * 100)}% similarity) — looks like a repeat report of the same problem`,
    actor: 'Sahayog Clubbing Engine',
    role: 'system',
  });
  await issue.save();
  return clubLeadId;
}

module.exports = {
  extractClubs,
  autoAttachToClub,
  tokenize,
  jaccard,
  overlapCoefficient,
};