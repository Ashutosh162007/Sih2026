const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

dotenv.config();

const User = require('../models/User');
const Issue = require('../models/Issue');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const RoutingAssignment = require('../models/RoutingAssignment');

const seedData = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sahayog_db';
    await mongoose.connect(uri);
    console.log('[Seed] Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Issue.deleteMany({});
    await Project.deleteMany({});
    await Notification.deleteMany({});
    await RoutingAssignment.deleteMany({});
    console.log('[Seed] Cleared old collections.');

    // Seed Users
    const users = await User.create([
      {
        name: 'Asha Menon',
        email: 'citizen@sahayog.in',
        password: 'password',
        role: 'citizen',
        status: 'active',
        org: '',
        location: { district: 'Ranchi', block: 'Kanke', lat: 23.3441, lng: 85.3096 },
      },
      {
        name: 'Rajeshwar Soren',
        email: 'panchayat@sahayog.in',
        password: 'password',
        role: 'govt_org',
        status: 'active',
        org: 'Panchayat Samiti - Tamar',
        location: { district: 'Ranchi', block: 'Tamar', lat: 23.0515, lng: 85.6492 },
      },
      {
        name: 'Dr. Kavita Rao (Dean R&D)',
        email: 'university@sahayog.in',
        password: 'password',
        role: 'university',
        status: 'active',
        org: 'Birla Institute of Technology (BIT) Mesra',
        location: { district: 'Ranchi', block: 'Mesra', lat: 23.4123, lng: 85.4399 },
        disciplines: ['Civil Engineering', 'Computer Science', 'Environmental Science', 'Urban Planning'],
      },
      {
        name: 'Prof. Imran Sheikh',
        email: 'pendinguni@sahayog.in',
        password: 'password',
        role: 'university',
        status: 'pending',
        org: 'Kolhan University Chaibasa',
        location: { district: 'West Singhbhum', block: 'Chaibasa', lat: 22.5604, lng: 85.8118 },
        disciplines: ['Tribal Studies', 'Rural Livelihoods', 'Social Sciences'],
      },
      {
        name: 'Rahul Desai (CSR Head)',
        email: 'industry@sahayog.in',
        password: 'password',
        role: 'industry',
        status: 'active',
        org: 'Tata Steel CSR & Sustainability',
        location: { district: 'East Singhbhum', block: 'Jamshedpur', lat: 22.8046, lng: 86.2029 },
      },
      {
        name: 'Meera Iyer (Director)',
        email: 'admin@sahayog.in',
        password: 'password',
        role: 'admin',
        status: 'active',
        org: 'Jharkhand State Innovation Council',
        location: { district: 'Ranchi', block: 'Dhurwa', lat: 23.3150, lng: 85.2890 },
      },
    ]);

    const reporter = users[0];
    const govtOrg = users[1];
    const uni = users[2];
    const industry = users[4];

    // Seed Issues
    const issues = await Issue.create([
      {
        title: 'Fluoride and heavy metal contamination in rural borewell water',
        description: 'Water testing across villages in Tamar block revealed high fluoride levels and turbidity, causing health concerns for local residents.',
        aiProblemStatement: '**Structured Problem Formulation:**\n\n**Context & Location:** Tamar Block, Ranchi District (Water Resources & Public Health).\n\n**Core Issue:** Groundwater source exceeds permissible fluoride limits (3.2 mg/L), affecting tribal families.\n\n**Severity Assessment:** High Priority (Score 91/100). Urgency: 92%, Public Risk: 95%, Hydrological Risk: 70%.\n\n**Innovation Objective:** Deploy an indigenous low-cost bio-char / activated alumina defluoridation pilot with solar-powered pump integration.',
        aiSummary: 'Critical groundwater quality degradation threatening community health in Tamar.',
        category: 'Water & Sanitation',
        status: 'In progress',
        priority: 'High',
        severity: { flooding: 25, publicRisk: 95, urgency: 92, score: 91, factors: ['Toxicity alert', 'Skeletal fluorosis risk'] },
        reporter: reporter._id,
        reporterId: String(reporter._id),
        reporterName: reporter.name,
        reporterRole: 'citizen',
        reporterOrg: '',
        district: 'Ranchi',
        block: 'Tamar',
        landmark: 'Near Tamar Community Health Center',
        lat: 23.0520,
        lng: 85.6480,
        images: [],
        assignee: uni.org,
        assigneeId: uni._id,
        nearestUniversities: [
          { universityId: 'uni-bit-mesra', name: 'Birla Institute of Technology (BIT) Mesra', distanceKm: 42.1, district: 'Ranchi', matchScore: 94 },
          { universityId: 'uni-bau-ranchi', name: 'Birsa Agricultural University', distanceKm: 48.0, district: 'Ranchi', matchScore: 89 },
        ],
        timeline: [
          { at: new Date(Date.now() - 10 * 86400000), label: 'Reported by Citizen', actor: reporter.name, role: 'citizen' },
          { at: new Date(Date.now() - 8 * 86400000), label: 'AI formulated structured research problem', actor: 'Sahayog AI', role: 'system' },
          { at: new Date(Date.now() - 6 * 86400000), label: `Multidisciplinary team assembled by ${uni.org}`, actor: uni.name, role: 'university' },
          { at: new Date(Date.now() - 2 * 86400000), label: `Industry grant ₹3,50,000 approved by ${industry.org}`, actor: industry.name, role: 'industry' },
        ],
      },
      {
        title: 'Vaccine cold chain failure at Primary Health Centers across Tamar Block',
        description: 'Frequent 8 to 12-hour rural power outages in Tamar Block disrupt vaccine refrigeration at 3 sub-health centers, jeopardizing critical infant immunization stocks and snakebite anti-venom vials.',
        aiProblemStatement: '**Structured Problem Formulation:**\n\n**Context & Location:** Tamar Block, Ranchi District (Healthcare & Renewable Energy Infrastructure).\n\n**Core Challenge:** Severe electrical grid intermittency and lack of thermal energy storage compromise vaccine cold chain integrity across 3 rural healthcare sub-centers.\n\n**Severity Assessment:** High Priority (Score 89/100). Urgency: 94%, Public Risk: 92%, Hazard Index: 15%.\n\n**Innovation Objective:** Develop and deploy an off-grid phase-change material (PCM) solar vaccine refrigerator equipped with automated GSM/IoT temperature telemetry.',
        aiSummary: 'Critical power instability threatening vaccine viability in rural Tamar clinics.',
        category: 'Healthcare',
        status: 'Under review',
        priority: 'High',
        severity: { flooding: 10, publicRisk: 92, urgency: 94, score: 89, factors: ['Cold-chain breakdown', 'Immunization risk'] },
        reporter: govtOrg._id,
        reporterId: String(govtOrg._id),
        reporterName: govtOrg.name,
        reporterRole: 'govt_org',
        reporterOrg: 'Panchayat Samiti - Tamar',
        district: 'Ranchi',
        block: 'Tamar',
        landmark: 'Tamar Community Health Center & Salgadih Panchayat Bhawan',
        lat: 23.0515,
        lng: 85.6492,
        images: [],
        assignee: null,
        nearestUniversities: [
          { universityId: 'uni-bit-mesra', name: 'Birla Institute of Technology (BIT) Mesra', distanceKm: 43.5, district: 'Ranchi', matchScore: 95 },
          { universityId: 'uni-nit-jsr', name: 'NIT Jamshedpur', distanceKm: 82.0, district: 'East Singhbhum', matchScore: 87 },
        ],
        timeline: [
          { at: new Date(Date.now() - 4 * 86400000), label: 'Reported by Local Govt Body (Panchayat Samiti - Tamar)', actor: govtOrg.name, role: 'govt_org' },
          { at: new Date(Date.now() - 4 * 86400000), label: 'AI formulated structured research problem & severity score (89/100)', actor: 'Sahayog AI', role: 'system' },
          { at: new Date(Date.now() - 3 * 86400000), label: 'Dispatched to BIT Mesra Dept of Mechanical & Electrical Engineering', actor: 'Sahayog Router', role: 'system' },
        ],
      },
    ]);

    // Seed Projects (1 sample funded project for university & industry workflows)
    await Project.create([
      {
        issueId: String(issues[0]._id),
        issue: issues[0]._id,
        title: 'Community Bio-char Defluoridation & IoT Turbidity Monitoring Network',
        university: uni.org,
        universityId: uni._id,
        industry: industry.org,
        industryId: industry._id,
        status: 'Funded',
        funded: true,
        fundingAmount: 350000,
        fundingDate: new Date(Date.now() - 2 * 86400000),
        deadline: new Date(Date.now() + 60 * 86400000),
        mentorshipNotes: 'Tata Steel CSR technical team provides laboratory validation and field logistics support.',
        team: [
          { discipline: 'Environmental Science', members: ['Dr. Ananya Roy (Faculty Mentor)', 'Dev Prakash (Research Scholar)'] },
          { discipline: 'Civil Engineering', members: ['Harsh Vardhan', 'Pooja Kumari'] },
          { discipline: 'Computer Science', members: ['Aman Singh (IoT Lead)'] },
        ],
        proposal: 'Fabricate a 500 LPH multi-stage gravity filter utilizing locally produced activated rice husk bio-char and activated alumina, paired with an ESP32-based GSM telemetry node for real-time water quality tracking on the Sahayog portal.',
        expectedImpact: 'Pure drinking water for 350+ households and elimination of dental/skeletal fluorosis risks.',
        milestones: [
          { name: 'Baseline chemical water sampling & site layout', due: '2026-09-10', done: true, completedAt: new Date() },
          { name: 'Pilot filter assembly & flow rate calibration', due: '2026-09-30', done: false },
          { name: 'IoT sensor live dashboard integration & community training', due: '2026-10-25', done: false },
        ],
      },
    ]);

    // Seed Notifications
    await Notification.create([
      {
        recipient: reporter._id,
        recipientRole: 'citizen',
        issueId: String(issues[0]._id),
        title: 'Project Funded & Execution Started! 🚀',
        message: `${industry.org} approved ₹3,50,000 funding for "${issues[0].title}". Team is deployed.`,
        type: 'funding_approved',
      },
      {
        recipientRole: 'admin',
        title: 'New Account Pending Verification',
        message: 'Prof. Imran Sheikh (Kolhan University Chaibasa) registered and is awaiting admin approval.',
        type: 'account_verified',
      },
    ]);

    console.log('[Seed] Successfully populated Sahayog Database with demo Jharkhand users, issues, projects, and notifications!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
