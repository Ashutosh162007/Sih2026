import { ROLES } from "../lib/constants";

export const mockUsers = [
  {
    id: "u-reporter",
    name: "Asha Menon",
    email: "reporter@sahayog.in",
    password: "password",
    role: ROLES.REPORTER,
    status: "active",
    org: "Ward 12 Citizen Forum, Ranchi",
  },
  {
    id: "u-uni",
    name: "Dr. Kavita Rao",
    email: "university@sahayog.in",
    password: "password",
    role: ROLES.UNIVERSITY,
    status: "active",
    org: "Birla Institute of Technology (BIT) Mesra",
  },
  {
    id: "u-uni-pending",
    name: "Prof. Imran Sheikh",
    email: "pendinguni@sahayog.in",
    password: "password",
    role: ROLES.UNIVERSITY,
    status: "pending",
    org: "Kolhan University Chaibasa",
  },
  {
    id: "u-industry",
    name: "Rahul Desai",
    email: "industry@sahayog.in",
    password: "password",
    role: ROLES.INDUSTRY,
    status: "active",
    org: "Tata Steel CSR & Sustainability",
  },
  {
    id: "u-admin",
    name: "Meera Iyer",
    email: "admin@sahayog.in",
    password: "password",
    role: ROLES.ADMIN,
    status: "active",
    org: "Jharkhand State Innovation Council",
  },
];

const spark = (seed) =>
  Array.from({ length: 8 }, (_, i) => ({
    i,
    v: 12 + ((seed * (i + 3)) % 18) + i,
  }));

export const mockAnalytics = {
  stats: [
    { label: "Open issues", number: 128, badgeColor: "teal", trendData: spark(2), icon: "alert" },
    { label: "Universities active", number: 24, badgeColor: "blue", trendData: spark(5), icon: "university" },
    { label: "Industry partners", number: 17, badgeColor: "amber", trendData: spark(8), icon: "industry" },
    { label: "Resolved this month", number: 41, badgeColor: "green", trendData: spark(3), icon: "check" },
  ],
  monthly: [
    { month: "Mar", reported: 42, resolved: 18 },
    { month: "Apr", reported: 51, resolved: 27 },
    { month: "May", reported: 47, resolved: 33 },
    { month: "Jun", reported: 63, resolved: 29 },
    { month: "Jul", reported: 58, resolved: 41 },
    { month: "Aug", reported: 71, resolved: 38 },
  ],
  categories: [
    { name: "Infrastructure", value: 34 },
    { name: "Water & Sanitation", value: 24 },
    { name: "Waste Management", value: 18 },
    { name: "Public Safety", value: 14 },
    { name: "Agriculture", value: 10 },
  ],
};

export const seedIssues = [
  {
    id: "iss-101",
    title: "Collapsed storm drain and waterlogging near Main Road, Ranchi",
    description:
      "The drain near Albert Ekka Chowk floods severely during monsoons, blocking pedestrian access and creating health hazards for shopkeepers and commuters.",
    aiProblemStatement:
      "**Structured Problem Formulation:**\n\n**Context & Location:** Severe drainage failure reported at Albert Ekka Chowk, Ranchi.\n\n**Core Issue:** Blocked arterial culvert causes acute water stagnation across a 400m commercial zone.\n\n**Severity Assessment:** High Priority (Score 86/100). Urgency: 88%, Public Risk: 84%, Hydrological Risk: 86%.\n\n**Innovation Objective:** Design a sustainable silt-resistant drainage bypass with automated water-level telemetry.",
    category: "Infrastructure",
    status: "Under review",
    priority: "High",
    reporterId: "u-reporter",
    reporterName: "Asha Menon",
    district: "Ranchi",
    block: "Kanke",
    landmark: "Albert Ekka Chowk",
    lat: 23.37,
    lng: 85.325,
    distanceKm: 12.4,
    createdAt: "2026-08-12T09:00:00.000Z",
    images: [{ url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80" }],
    severity: { flooding: 86, publicRisk: 84, urgency: 88, score: 86 },
    assignee: "Birla Institute of Technology (BIT) Mesra",
    nearestUniversities: [
      { name: "Birla Institute of Technology (BIT) Mesra", distanceKm: 12.4, matchScore: 92 },
      { name: "Ranchi University", distanceKm: 3.2, matchScore: 88 },
    ],
    timeline: [
      { at: "2026-08-12T09:00:00.000Z", label: "Reported by Citizen" },
      { at: "2026-08-13T11:20:00.000Z", label: "AI structured problem statement synthesized" },
      { at: "2026-08-14T10:00:00.000Z", label: "Routed to nearest HEI: BIT Mesra (12.4 km away)" },
    ],
  },
  {
    id: "iss-102",
    title: "Fluoride and heavy metal contamination in rural borewell water",
    description:
      "Water testing across Tamar block revealed elevated fluoride levels and turbidity, causing skeletal issues among residents.",
    aiProblemStatement:
      "**Structured Problem Formulation:**\n\n**Context & Location:** Tamar Block, Ranchi District (Water Resources & Public Health).\n\n**Core Issue:** Groundwater source exceeds permissible fluoride limits (3.2 mg/L), affecting over 1,200 tribal families.\n\n**Severity Assessment:** High Priority (Score 91/100). Urgency: 92%, Public Risk: 95%.\n\n**Innovation Objective:** Deploy an indigenous low-cost bio-char defluoridation pilot with solar-powered pump integration.",
    category: "Water & Sanitation",
    status: "In progress",
    priority: "High",
    reporterId: "u-reporter",
    reporterName: "Asha Menon",
    district: "Ranchi",
    block: "Tamar",
    landmark: "Tamar Community Well, Lane 4",
    lat: 23.052,
    lng: 85.648,
    distanceKm: 42.1,
    createdAt: "2026-07-29T06:45:00.000Z",
    images: [{ url: "https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=800&q=80" }],
    severity: { flooding: 25, publicRisk: 95, urgency: 92, score: 91 },
    assignee: "Birla Institute of Technology (BIT) Mesra",
    nearestUniversities: [
      { name: "Birla Institute of Technology (BIT) Mesra", distanceKm: 42.1, matchScore: 94 },
    ],
    timeline: [
      { at: "2026-07-29T06:45:00.000Z", label: "Reported by Citizen" },
      { at: "2026-08-01T10:00:00.000Z", label: "University multidisciplinary team formed" },
      { at: "2026-08-15T16:00:00.000Z", label: "Industry funding (₹3,50,000) approved by Tata Steel CSR with 60-day completion deadline" },
    ],
  },
  {
    id: "iss-103",
    title: "Post-harvest vegetable spoilage for smallholder farmers",
    description:
      "Growers in Ormanjhi face up to 40% losses during peak harvest due to lack of decentralised cooling and solar dehydration facilities.",
    aiProblemStatement:
      "**Structured Problem Formulation:**\n\n**Context & Location:** Ormanjhi, Ranchi (Agriculture & Rural Livelihoods).\n\n**Core Issue:** Lack of off-grid post-harvest cold storage leads to distress sale and spoilage.\n\n**Severity Assessment:** Medium Priority (Score 68/100). Urgency: 72%, Economic Impact: 85%.\n\n**Innovation Objective:** Build a PCM thermal storage chamber and micro-solar drying solution.",
    category: "Agriculture",
    status: "New",
    priority: "Medium",
    reporterId: "u-reporter",
    reporterName: "Asha Menon",
    district: "Ranchi",
    block: "Ormanjhi",
    landmark: "Ormanjhi Vegetable Mandi",
    lat: 23.483,
    lng: 85.483,
    distanceKm: 8.5,
    createdAt: "2026-08-20T19:10:00.000Z",
    images: [{ url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" }],
    severity: { flooding: 10, publicRisk: 55, urgency: 72, score: 68 },
    assignee: null,
    nearestUniversities: [
      { name: "Birla Institute of Technology (BIT) Mesra", distanceKm: 8.5, matchScore: 96 },
    ],
    timeline: [{ at: "2026-08-20T19:10:00.000Z", label: "Reported by Citizen" }],
  },
];

export const seedProjects = [
  {
    id: "prj-201",
    issueId: "iss-102",
    title: "Community Bio-char Defluoridation & IoT Sensor Network",
    university: "Birla Institute of Technology (BIT) Mesra",
    industry: "Tata Steel CSR & Sustainability",
    status: "Funded",
    funded: true,
    fundingAmount: 350000,
    deadline: "2026-10-30",
    team: [
      { discipline: "Environmental Science", members: ["Dr. Ananya Roy", "Dev Prakash"] },
      { discipline: "Civil Engineering", members: ["Harsh Vardhan"] },
      { discipline: "Computer Science", members: ["Aman Singh"] },
    ],
    proposal:
      "Install a 500 LPH multi-stage gravity filtration plant with continuous IoT fluoride & turbidity sensors and community telemetry.",
    milestones: [
      { name: "Site survey & baseline testing", due: "2026-09-10", done: true },
      { name: "Pilot filter assembly & calibration", due: "2026-09-30", done: false },
      { name: "IoT sensor dashboard go-live", due: "2026-10-25", done: false },
    ],
  },
  {
    id: "prj-202",
    issueId: "iss-101",
    title: "Albert Ekka Chowk Silt Bypass & Hydrological Flow Modeling",
    university: "Birla Institute of Technology (BIT) Mesra",
    industry: null,
    status: "Awaiting funding",
    funded: false,
    fundingAmount: 0,
    deadline: null,
    team: [
      { discipline: "Civil Engineering", members: ["Prof. Sudhir Sen", "Karan Mehta"] },
      { discipline: "Urban Planning", members: ["Nidhi Verma"] },
    ],
    proposal:
      "Construct a modular pre-cast concrete sediment trap with dual self-scouring grates, backed by 3D hydrodynamic modeling of the storm runoff catchment.",
    milestones: [
      { name: "Topographical drone survey & CAD drafting", due: "2026-09-20", done: false },
      { name: "Prefab prototype testing in hydraulic lab", due: "2026-10-15", done: false },
    ],
  },
];
