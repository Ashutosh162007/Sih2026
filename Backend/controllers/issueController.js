const Issue = require('../models/Issue');
const IssueUpward = require('../models/IssueUpward');
const Notification = require('../models/Notification');
const RoutingAssignment = require('../models/RoutingAssignment');
const { analyzeProblemWithAI } = require('../services/aiService');
const { rankUniversitiesForIssue } = require('../services/routingService');
const { uploadToCloudinary, uploadDataUriToCloudinary } = require('../services/cloudinaryService');

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
    } else if (Array.isArray(evidence) && evidence.length > 0) {
      images = await Promise.all(
        evidence.map(async (e) => {
          if (e.url && e.url.startsWith('data:image')) {
            return await uploadDataUriToCloudinary(e.url, e.filename || 'evidence.jpg');
          }
          return {
            url: e.url || e.preview,
            filename: e.filename || 'evidence.jpg',
            size: e.size || 102400,
          };
        })
      );
      images = images.filter((img) => img.url);
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
          role: 'citizen',
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

    // 6. Notify Universities & Citizen Reporter
    await Notification.create({
      recipientRole: 'university',
      issueId: String(issue._id),
      title: `New ${aiAnalysis.priority} Priority Issue: ${title}`,
      message: `A new ${aiAnalysis.category} issue in ${district} (${nearestUniversities[0]?.distanceKm} km from campus) is awaiting team formation.`,
      type: 'issue_reported',
    });

    if (req.user?._id) {
      await Notification.create({
        recipient: req.user._id,
        recipientRole: 'citizen',
        issueId: String(issue._id),
        title: 'Challenge Registered & AI Evaluated 📋',
        message: `Your report "${issue.title}" was analyzed (${aiAnalysis.priority} Priority, ${aiAnalysis.severity.score}% severity) and routed to nearest higher education institutions.`,
        type: 'issue_reported',
      });
    }

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
      upwardsCount: issue.upwardsCount || 0,
      hasUpwarded: false,
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

    let formatted = issues.map((i) => ({
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
      upwardsCount: i.upwardsCount || 0,
    }));

    // Enrich with hasUpwarded if user is authenticated
    const userId = req.user?._id;
    if (userId && formatted.length > 0) {
      formatted = await enrichIssuesWithUpwards(formatted, userId);
    }

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

    let issueObj = {
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
      upwardsCount: issue.upwardsCount || 0,
    };

    // Enrich with hasUpwarded if user is authenticated
    const userId = req.user?._id;
    if (userId) {
      issueObj = await enrichIssueWithUpwards(issueObj, userId);
    }

    res.json(issueObj);
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
        recipientRole: 'citizen',
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
// @desc    Submit citizen verification & 5-star rating feedback
// @route   POST /api/issues/:id/feedback
// @access  Public / Private
const submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment, verifiedByCitizen } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    issue.feedback = {
      rating: Number(rating) || 5,
      comment: comment || '',
      verifiedByCitizen: verifiedByCitizen ?? true,
      submittedAt: new Date(),
    };

    issue.timeline.push({
      at: new Date(),
      label: `Citizen Verified on Ground & Rated ⭐ ${issue.feedback.rating}/5${comment ? ` — "${comment}"` : ''}`,
      actor: req.user?.name || issue.reporterName || 'Citizen Reporter',
      role: 'citizen',
    });

    await issue.save();

    // Alert admin & university
    await Notification.create({
      recipientRole: 'university',
      issueId: String(issue._id),
      title: `Citizen Verified Resolution! ⭐ ${issue.feedback.rating}/5`,
      message: `The citizen reporter verified resolution of "${issue.title}" with a ${issue.feedback.rating}/5 rating.`,
      type: 'feedback_submitted',
    });

    res.json({
      success: true,
      message: 'Citizen feedback and verification logged successfully',
      feedback: issue.feedback,
      issue,
    });
  } catch (err) {
    next(err);
  }
};

// Helper: enrich a single issue object with upwardsCount + hasUpwarded
async function enrichIssueWithUpwards(issueObj, userId) {
  const upwardsCount = issueObj.upwardsCount || 0;
  let hasUpwarded = false;
  if (userId) {
    const userUpward = await IssueUpward.findOne({ issueId: issueObj._id, userId });
    hasUpwarded = !!userUpward;
  }
  return { ...issueObj, upwardsCount, hasUpwarded };
}

// Helper: enrich an array of issue objects
async function enrichIssuesWithUpwards(issueArray, userId) {
  if (!userId || issueArray.length === 0) {
    return issueArray.map((i) => ({ ...i, upwardsCount: i.upwardsCount || 0, hasUpwarded: false }));
  }
  const upwardDocs = await IssueUpward.find({
    issueId: { $in: issueArray.map((i) => i._id) },
    userId,
  }).lean();
  const upwardSet = new Set(upwardDocs.map((d) => String(d.issueId)));
  return issueArray.map((i) => ({
    ...i,
    upwardsCount: i.upwardsCount || 0,
    hasUpwarded: upwardSet.has(String(i._id)),
  }));
}

// @desc    Add an Upward from the current user to an issue
// @route   POST /api/issues/:id/upward
// @access  Private
// Semantics: idempotent add — repeated adds are no-ops (unique index prevents duplicates).
const addUpward = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const userId = req.user._id;

    // Insert upward; catch duplicate-key races (double-click, parallel requests, retries)
    try {
      await IssueUpward.create({ issueId: issue._id, userId });
    } catch (dupErr) {
      if (dupErr.code === 11000) {
        const updatedIssue = await Issue.findById(issue._id);
        return res.json({
          success: true,
          upwardsCount: updatedIssue.upwardsCount || 0,
          hasUpwarded: true,
        });
      }
      throw dupErr;
    }

    // Atomic increment only when a new record was actually created
    await Issue.findByIdAndUpdate(issue._id, { $inc: { upwardsCount: 1 } });
    const updatedIssue = await Issue.findById(issue._id);
    return res.json({
      success: true,
      upwardsCount: updatedIssue.upwardsCount,
      hasUpwarded: true,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove the current user's Upward from an issue
// @route   DELETE /api/issues/:id/upward
// @access  Private
// Semantics: idempotent remove — repeated removes are no-ops.
const removeUpward = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const userId = req.user._id;
    const existing = await IssueUpward.findOne({ issueId: issue._id, userId });

    if (!existing) {
      // Nothing to remove
      return res.json({
        success: true,
        upwardsCount: issue.upwardsCount || 0,
        hasUpwarded: false,
      });
    }

    await IssueUpward.deleteOne({ _id: existing._id });
    await Issue.findByIdAndUpdate(
      issue._id,
      { $inc: { upwardsCount: -1 } },
      { runValidators: true }
    );
    const updatedIssue = await Issue.findById(issue._id);
    return res.json({
      success: true,
      upwardsCount: Math.max(0, updatedIssue.upwardsCount),
      hasUpwarded: false,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get upwards status for current user on an issue
// @route   GET /api/issues/:id/upwards
// @access  Public (but hasUpwarded only meaningful when authenticated)
const getUpwards = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    let hasUpwarded = false;
    if (req.user?._id) {
      const userUpward = await IssueUpward.findOne({ issueId: issue._id, userId: req.user._id });
      hasUpwarded = !!userUpward;
    }

    res.json({
      success: true,
      upwardsCount: issue.upwardsCount || 0,
      hasUpwarded,
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
  submitFeedback,
  addUpward,
  removeUpward,
  getUpwards,
};
