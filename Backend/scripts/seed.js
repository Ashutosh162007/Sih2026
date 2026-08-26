const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

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
        email: 'reporter@sahayog.in',
        password: 'password',
        role: 'community_reporter',
        status: 'active',
        org: 'Ward 12 Citizen Forum, Ranchi',
        location: { district: 'Ranchi', block: 'Kanke', lat: 23.3441, lng: 85.3096 },
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
    const uni = users[1];
    const industry = users[3];

    // Seed Issues
    const issues = await Issue.create([
      {
        title: 'Collapsed storm drain and waterlogging near Main Road, Ranchi',
        description: 'The drain near Albert Ekka Chowk floods severely during monsoons, blocking pedestrian access and creating health hazards for shopkeepers and commuters.',
        aiProblemStatement: '**Structured Problem Formulation:**\n\n**Context & Location:** Severe drainage failure reported at Albert Ekka Chowk, Ranchi (Infrastructure & Water Management).\n\n**Core Issue:** Blocked arterial culvert causes acute water stagnation across a 400m commercial zone.\n\n**Severity Assessment:** High Priority (Score 86/100). Urgency: 88%, Public Risk: 84%, Hydrological Risk: 86%.\n\n**Innovation Objective:** Design a sustainable silt-resistant drainage bypass with automated water-level sensor telemetry.',
        aiSummary: 'High priority drainage disruption at Ranchi Main Road requiring civil and hydrological engineering intervention.',
        category: 'Infrastructure',
        status: 'Under review',
        priority: 'High',
        severity: { flooding: 86, publicRisk: 84, urgency: 88, score: 86, factors: ['Critical arterial road blockage', 'Waterborne disease hazard'] },
        reporter: reporter._id,
        reporterId: String(reporter._id),
        reporterName: reporter.name,
        district: 'Ranchi',
        block: 'Kanke',
        landmark: 'Albert Ekka Chowk',
        lat: 23.3700,
        lng: 85.3250,
        images: [{ url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80', filename: 'storm_drain_ranchi.jpg', size: 245000 }],
        assignee: uni.org,
        assigneeId: uni._id,
        nearestUniversities: [
          { universityId: 'uni-bit-mesra', name: 'Birla Institute of Technology (BIT) Mesra', distanceKm: 12.4, district: 'Ranchi', matchScore: 92 },
          { universityId: 'uni-ranchi-univ', name: 'Ranchi University', distanceKm: 3.2, district: 'Ranchi', matchScore: 88 },
        ],
        timeline: [
          { at: new Date(Date.now() - 5 * 86400000), label: 'Reported by Community Reporter', actor: reporter.name, role: 'community_reporter' },
          { at: new Date(Date.now() - 4 * 86400000), label: 'AI severity assessment completed (Score: 86%)', actor: 'Sahayog AI', role: 'system' },
          { at: new Date(Date.now() - 3 * 86400000), label: `Assigned to ${uni.org} queue`, actor: 'Routing Engine', role: 'system' },
        ],
      },
      {
        title: 'Fluoride and heavy metal contamination in rural borewell water',
        description: 'Water testing across 3 villages in Tamar block revealed high fluoride levels and turbidity, causing skeletal fluorosis among children and elders.',
        aiProblemStatement: '**Structured Problem Formulation:**\n\n**Context & Location:** Tamar Block, Ranchi District (Water Resources & Public Health).\n\n**Core Issue:** Groundwater source exceeds permissible fluoride limits (3.2 mg/L), affecting over 1,200 tribal families.\n\n**Severity Assessment:** High Priority (Score 91/100). Urgency: 92%, Public Risk: 95%, Hydrological Risk: 70%.\n\n**Innovation Objective:** Deploy an indigenous low-cost bio-char / activated alumina defluoridation pilot with solar-powered pump integration.',
        aiSummary: 'Critical groundwater quality degradation threatening community health in Tamar.',
        category: 'Water & Sanitation',
        status: 'In progress',
        priority: 'High',
        severity: { flooding: 25, publicRisk: 95, urgency: 92, score: 91, factors: ['Toxicity alert', 'Skeletal fluorosis risk in children'] },
        reporter: reporter._id,
        reporterId: String(reporter._id),
        reporterName: reporter.name,
        district: 'Ranchi',
        block: 'Tamar',
        landmark: 'Near Tamar Community Health Center',
        lat: 23.0520,
        lng: 85.6480,
        images: [{ url: 'https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=800&q=80', filename: 'water_sample.jpg', size: 180000 }],
        assignee: uni.org,
        assigneeId: uni._id,
        nearestUniversities: [
          { universityId: 'uni-bit-mesra', name: 'Birla Institute of Technology (BIT) Mesra', distanceKm: 42.1, district: 'Ranchi', matchScore: 94 },
          { universityId: 'uni-bau-ranchi', name: 'Birsa Agricultural University', distanceKm: 48.0, district: 'Ranchi', matchScore: 89 },
        ],
        timeline: [
          { at: new Date(Date.now() - 10 * 86400000), label: 'Reported by Community Reporter', actor: reporter.name, role: 'community_reporter' },
          { at: new Date(Date.now() - 8 * 86400000), label: 'AI formulated structured research problem', actor: 'Sahayog AI', role: 'system' },
          { at: new Date(Date.now() - 6 * 86400000), label: `Multidisciplinary team assembled by ${uni.org}`, actor: uni.name, role: 'university' },
          { at: new Date(Date.now() - 2 * 86400000), label: `Industry grant ₹3,50,000 approved by ${industry.org}`, actor: industry.name, role: 'industry' },
        ],
      },
      {
        title: 'Lack of cold storage and post-harvest spoilage for tomato farmers',
        description: 'Smallholder farmers in Ormanjhi face 40% crop loss during bumper harvest season due to lack of decentralised chilling and solar drying units.',
        aiProblemStatement: '**Structured Problem Formulation:**\n\n**Context & Location:** Ormanjhi, Ranchi (Agriculture & Rural Livelihoods).\n\n**Core Issue:** Lack of affordable, off-grid post-harvest preservation drives distress selling at ₹2/kg.\n\n**Severity Assessment:** Medium Priority (Score 68/100). Public Risk: 50%, Urgency: 72%, Economic Impact: 85%.\n\n**Innovation Objective:** Develop a farm-level phase-change material (PCM) solar cold chamber and micro-solar dehydrator.',
        aiSummary: 'Rural agricultural livelihood bottleneck affecting horticultural growers in Ormanjhi.',
        category: 'Agriculture',
        status: 'New',
        priority: 'Medium',
        severity: { flooding: 10, publicRisk: 55, urgency: 72, score: 68, factors: ['Farmer economic loss', 'Food wastage'] },
        reporter: reporter._id,
        reporterId: String(reporter._id),
        reporterName: reporter.name,
        district: 'Ranchi',
        block: 'Ormanjhi',
        landmark: 'Ormanjhi Vegetable Mandi',
        lat: 23.4833,
        lng: 85.4833,
        images: [{ url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80', filename: 'tomato_harvest.jpg', size: 310000 }],
        assignee: null,
        nearestUniversities: [
          { universityId: 'uni-bit-mesra', name: 'Birla Institute of Technology (BIT) Mesra', distanceKm: 8.5, district: 'Ranchi', matchScore: 96 },
          { universityId: 'uni-bau-ranchi', name: 'Birsa Agricultural University', distanceKm: 18.2, district: 'Ranchi', matchScore: 98 },
        ],
        timeline: [
          { at: new Date(Date.now() - 2 * 86400000), label: 'Reported by Community Reporter', actor: reporter.name, role: 'community_reporter' },
        ],
      },
    ]);

    // Seed Projects
    await Project.create([
      {
        issueId: String(issues[1]._id),
        issue: issues[1]._id,
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
        mentorshipNotes: 'Tata Steel CSR technical team will provide water testing laboratory validation and field logistics support.',
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
      {
        issueId: String(issues[0]._id),
        issue: issues[0]._id,
        title: 'Albert Ekka Chowk Silt Bypass & Hydrological Flow Modeling',
        university: uni.org,
        universityId: uni._id,
        industry: null,
        status: 'Awaiting funding',
        funded: false,
        fundingAmount: 0,
        team: [
          { discipline: 'Civil Engineering', members: ['Prof. Sudhir Sen', 'Karan Mehta'] },
          { discipline: 'Urban Planning', members: ['Nidhi Verma'] },
        ],
        proposal: 'Construct a modular pre-cast concrete sediment trap with dual self-scouring grates, backed by 3D hydrodynamic modeling of the storm runoff catchment.',
        expectedImpact: 'Prevent monsoon road inundation and ensure uninterrupted traffic flow for 40,000+ daily commuters.',
        milestones: [
          { name: 'Topographical drone survey & CAD drafting', due: '2026-09-20', done: false },
          { name: 'Prefab prototype testing in hydraulic lab', due: '2026-10-15', done: false },
        ],
      },
    ]);

    // Seed Notifications
    await Notification.create([
      {
        recipient: reporter._id,
        recipientRole: 'community_reporter',
        issueId: String(issues[1]._id),
        title: 'Project Funded & Execution Started! 🚀',
        message: `${industry.org} approved ₹3,50,000 funding for "${issues[1].title}". Team is deployed.`,
        type: 'funding_approved',
      },
      {
        recipientRole: 'university',
        issueId: String(issues[2]._id),
        title: 'New High Priority Issue Routed to Campus',
        message: `Tomato post-harvest challenge in Ormanjhi (8.5 km from campus) matched your Agriculture & Engineering faculty.`,
        type: 'issue_reported',
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
