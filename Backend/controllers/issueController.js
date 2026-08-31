const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const RoutingAssignment = require('../models/RoutingAssignment');
const { analyzeProblemWithAI } = require('../services/aiService');
const { rankUniversitiesForIssue } = require('../services/routingService');
const { uploadToCloudinary } = require('../services/cloudinaryService');

// @desc    Preview AI synthesis & severity without persisting
// @route   POST /api/issues/ai-preview
// @access  Public / Private
const previewAI = async (req, res, next) => {
  try {
    const { title, description, category, district, block, landmark } = req.body;
    const aiResult = await analyzeProblemWithAI({
      title,
      description,
      category,
      location: { district, block, landmark },
    });
    res.json({ success: true, ...aiResult });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new civic issue report
// @route   POST /api/issues
// @access  Private
const createIssue = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      district,
      block,
      landmark,
      lat,
      lng,
      evidence,
    } = req.body;

    const issueLat = Number(lat) || 23.3441;
    const issueLng = Number(lng) || 85.3096;

    // 1. Run AI Problem Formulation & Severity Engine
    const aiAnalysis = await analyzeProblemWithAI({
      title,
      description,
      category,
      location: { district, block, landmark },
    });

    // 2. Compute Nearest Universities using Haversine Geodesic Routing
    const nearestUniversities = rankUniversitiesForIssue({
      lat: issueLat,
      lng: issueLng,
      category: aiAnalysis.category,
      district: district || 'Ranchi',
    });

    // 3. Process Uploaded Images / Evidence
    let images = [];
    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype);
      images.push(uploaded);
    } else if (Array.isArray(evidence)) {
      images = evidence.map((e) => ({
        url: e.url || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80',
        filename: e.filename || 'evidence.jpg',
        size: e.size || 102400,
      }));
    }

    const reporterName = req.user?.name || req.body.reporterName || 'Asha Menon';
    const reporterId = req.user?._id || req.user?.id || 'u-reporter';

    // 4. Create Issue Document
    const issue = await Issue.create({
      title: title || 'Reported Civic Issue',
      description: description || '',
      aiProblemStatement: aiAnalysis.aiProblemStatement,
      aiSummary: aiAnalysis.aiSummary,
      category: aiAnalysis.category,
      status: 'New',
      priority: aiAnalysis.priority,
      severity: aiAnalysis.severity,
      reporter: req.user?._id,
      reporterId: String(reporterId),
      reporterName,
      district: district || 'Ranchi',
      block: block || 'Kanke',
      landmark: landmark || '',
      lat: issueLat,
      lng: issueLng,
      images,
      nearestUniversities: nearestUniversities.slice(0, 4),
      timeline: [
        {
          at: new Date(),
          label: 'Reported by Citizen',
          actor: reporterName,
          role: 'community_reporter',
        },
        {
          at: new Date(),
          label: `AI classified as ${aiAnalysis.category} (${aiAnalysis.priority} Priority, ${aiAnalysis.severity.score}% severity)`,
          actor: 'Sahayog AI Engine',
          role: 'system',
        },
        {
          at: new Date(),
          label: `Routed to nearest HEIs: ${nearestUniversities[0]?.name} (${nearestUniversities[0]?.distanceKm} km away)`,
          actor: 'Routing Engine',
          role: 'system',
        },
      ],
    });

    // 5. Create Routing Assignment Log
    await RoutingAssignment.create({
      issueId: String(issue._id),
      suggestedUniversities: nearestUniversities.slice(0, 5),
      status: 'queued',
    });

    // 6. Notify Universities
    await Notification.create({
      recipientRole: 'university',
      issueId: String(issue._id),
      title: `New ${aiAnalysis.priority} Priority Issue: ${title}`,
      message: `A new ${aiAnalysis.category} issue in ${district} (${nearestUniversities[0]?.distanceKm} km from campus) is awaiting team formation.`,
      type: 'issue_reported',
    });

    // Format response to match frontend interface
    const responseData = {
      id: issue._id,
      _id: issue._id,
      title: issue.title,
      description: issue.description,
      aiProblemStatement: issue.aiProblemStatement,
      aiSummary: issue.aiSummary,
      category: issue.category,
      status: issue.status,
      priority: issue.priority,
      severity: issue.severity,
      reporterId: issue.reporterId,
      reporterName: issue.reporterName,
      district: issue.district,
      block: issue.block,
      landmark: issue.landmark,
      lat: issue.lat,
      lng: issue.lng,
      images: issue.images,
      nearestUniversities: issue.nearestUniversities,
      assignee: issue.assignee,
      timeline: issue.timeline,
      createdAt: issue.createdAt,
    };

    res.status(201).json(responseData);
  } catch (err) {
    next(err);
  }
};

// @desc    Get all issues with filter & proximity sorting
// @route   GET /api/issues
// @access  Public / Private
const getIssues = async (req, res, next) => {
  try {
    const { reporterId, status, category, district, lat, lng } = req.query;
    const query = {};

    if (reporterId) {
      query.$or = [{ reporterId: String(reporterId) }, { reporter: reporterId }];
    }
    if (status) query.status = status;
    if (category) query.category = category;
    if (district) query.district = new RegExp(district, 'i');

    let issues = await Issue.find(query).sort({ createdAt: -1 });

    // Handle proximity distance sorting
    if (lat && lng) {
      const userLat = Number(lat);
      const userLng = Number(lng);
      issues = issues.sort((a, b) => {
        const distA = Math.hypot(a.lat - userLat, a.lng - userLng);
        const distB = Math.hypot(b.lat - userLat, b.lng - userLng);
        return distA - distB;
      });
    }

    const formatted = issues.map((i) => ({
      id: i._id,
      _id: i._id,
      title: i.title,
      description: i.description,
      aiProblemStatement: i.aiProblemStatement,
      category: i.category,
      status: i.status,
      priority: i.priority,
      severity: i.severity,
      reporterId: i.reporterId,
      reporterName: i.reporterName,
      district: i.district,
      block: i.block,
      landmark: i.landmark,
      lat: i.lat,
      lng: i.lng,
      images: i.images,
      nearestUniversities: i.nearestUniversities,
      assignee: i.assignee,
      timeline: i.timeline,
      createdAt: i.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

// @desc    Get single issue by ID
// @route   GET /api/issues/:id
// @access  Public / Private
const getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    res.json({
      id: issue._id,
      _id: issue._id,
      title: issue.title,
      description: issue.description,
      aiProblemStatement: issue.aiProblemStatement,
      aiSummary: issue.aiSummary,
      category: issue.category,
      status: issue.status,
      priority: issue.priority,
      severity: issue.severity,
      reporterId: issue.reporterId,
      reporterName: issue.reporterName,
      district: issue.district,
      block: issue.block,
      landmark: issue.landmark,
      lat: issue.lat,
      lng: issue.lng,
      images: issue.images,
      nearestUniversities: issue.nearestUniversities,
      assignee: issue.assignee,
      timeline: issue.timeline,
      createdAt: issue.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update issue status
// @route   PATCH /api/issues/:id/status
// @access  Private
const updateIssueStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    issue.status = status;
    issue.timeline.push({
      at: new Date(),
      label: note || `Status updated to ${status}`,
      actor: req.user?.name || 'System Admin',
      role: req.user?.role || 'admin',
    });

    await issue.save();

    // If resolved, notify citizen
    if (status === 'Resolved') {
      await Notification.create({
        recipient: issue.reporter,
        recipientRole: 'community_reporter',
        issueId: String(issue._id),
        title: 'Issue Resolved! 🎉',
        message: `Your reported issue "${issue.title}" has been successfully resolved through university innovation and industry collaboration.`,
        type: 'issue_resolved',
      });
    }

    res.json({
      id: issue._id,
      _id: issue._id,
      title: issue.title,
      status: issue.status,
      timeline: issue.timeline,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  previewAI,
  createIssue,
  getIssues,
  getIssueById,
  updateIssueStatus,
};
