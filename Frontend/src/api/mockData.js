import { ROLES } from "../lib/constants";
import { UNIVERSITY_CAMPUSES } from "../lib/collegeRegistry";

export const mockUsers = [
  {
    id: "u-reporter",
    name: "Asha Menon",
    email: "citizen@sahayog.in",
    password: "password",
    role: ROLES.REPORTER,
    status: "active",
    org: "",
  },
  ...UNIVERSITY_CAMPUSES.map((c, i) => ({
    id: `u-uni-${i}`,
    name: c.adminName,
    email: c.email,
    password: "password",
    role: ROLES.UNIVERSITY,
    status: "active",
    isEmailVerified: true,
    org: c.org,
  })),
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
    id: "iss-102",
    title: "Fluoride and heavy metal contamination in rural borewell water",
    description:
      "Water testing across Tamar block revealed elevated fluoride levels and turbidity, causing health concerns among residents.",
    aiProblemStatement:
      "**Structured Problem Formulation:**\n\n**Context & Location:** Tamar Block, Ranchi District (Water Resources & Public Health).\n\n**Core Issue:** Groundwater source exceeds permissible fluoride limits (3.2 mg/L), affecting tribal families.\n\n**Severity Assessment:** High Priority (Score 91/100). Urgency: 92%, Public Risk: 95%.\n\n**Innovation Objective:** Deploy an indigenous low-cost bio-char defluoridation pilot with solar-powered pump integration.",
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
    images: [],
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
];
