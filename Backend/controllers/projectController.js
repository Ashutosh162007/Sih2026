const Project = require('../models/Project');
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');

// @desc    Save team formation data for an issue
// @route   POST /api/projects/:issueId/teams
// @access  Private (University)
const saveTeam = async (req, res, next) => {
  try {
    const { issueId } = req.params;
    const { team } = req.body;
    const uniName = req.user?.org || req.user?.name || 'Birla Institute of Technology (BIT) Mesra';

    let project = await Project.findOne({ issueId });
    const issue = await Issue.findById(issueId).catch(() => null);

    if (!project) {
      project = await Project.create({
        issueId,
        issue: issue?._id,
        title: issue ? `Solution for ${issue.title}` : 'Civic Innovation Project',
        university: uniName,
        universityId: req.user?._id,
        status: 'Team forming',
        funded: false,
        team: team || [],
        proposal: '',
        milestones: [],
      });
    } else {
      project.team = team || [];
      project.university = uniName;
      await project.save();
    }

    if (issue) {
      issue.timeline.push({
        at: new Date(),
        label: `Multidisciplinary team assembled by ${uniName}`,
        actor: uniName,
        role: 'university',
      });
      await issue.save();

      if (issue.reporter) {
        await Notification.create({
          recipient: issue.reporter,
          recipientRole: 'citizen',
          issueId: String(issue._id),
          projectId: String(project._id),
          title: 'University Team Assembled! 🎓',
          message: `${uniName} has assembled a student-faculty innovation team for "${issue.title}".`,
          type: 'team_formed',
        });
      }
    }

    res.json({
      id: project._id,
      _id: project._id,
      issueId: project.issueId,
      title: project.title,
      university: project.university,
      team: project.team,
      status: project.status,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit a solution proposal
// @route   POST /api/projects/:issueId/proposals
// @access  Private (University)
const submitProposal = async (req, res, next) => {
  try {
    const { issueId } = req.params;
    const { title, proposal, team, milestones, expectedImpact } = req.body;
    const uniName = req.user?.org || req.user?.name || 'Birla Institute of Technology (BIT) Mesra';

    let project = await Project.findOne({ issueId });
    const issue = await Issue.findById(issueId).catch(() => null);

    const defaultMilestones = milestones && milestones.length > 0 ? milestones : [
      { name: 'Field Survey & Sensor Installation', due: '2026-09-15', done: false },
      { name: 'Prototype Testing & Community Validation', due: '2026-10-15', done: false },
      { name: 'Final Deployment & Public Handover', due: '2026-11-15', done: false },
    ];

    if (!project) {
      project = await Project.create({
        issueId,
        issue: issue?._id,
        title: title || (issue ? `Solution for ${issue.title}` : 'Solution Proposal'),
        university: uniName,
        universityId: req.user?._id,
        status: 'Awaiting funding',
        funded: false,
        team: team || [],
        proposal: proposal || '',
        expectedImpact: expectedImpact || '',
        milestones: defaultMilestones,
      });
    } else {
      project.title = title || project.title;
      project.proposal = proposal || project.proposal;
      project.status = 'Awaiting funding';
      if (team) project.team = team;
      if (milestones) project.milestones = milestones;
      if (expectedImpact) project.expectedImpact = expectedImpact;
      await project.save();
    }

    if (issue) {
      issue.status = 'Assigned';
      issue.assignee = uniName;
      issue.timeline.push({
        at: new Date(),
        label: `Solution proposal submitted to Industry Partners by ${uniName}`,
        actor: uniName,
        role: 'university',
      });
      await issue.save();

      if (issue.reporter) {
        await Notification.create({
          recipient: issue.reporter,
          recipientRole: 'citizen',
          issueId: String(issue._id),
          projectId: String(project._id),
          title: 'Technical Proposal Submitted! 📝',
          message: `${uniName} submitted the solution proposal for "${project.title}" to Industry CSR sponsors.`,
          type: 'proposal_submitted',
        });
      }
    }

    // Notify Industry Partners
    await Notification.create({
      recipientRole: 'industry',
      issueId,
      projectId: String(project._id),
      title: `New Proposal Awaiting Funding: ${project.title}`,
      message: `${uniName} has submitted a solution proposal ready for industry sponsorship & CSR funding.`,
      type: 'proposal_submitted',
    });

    res.status(201).json({
      id: project._id,
      _id: project._id,
      issueId: project.issueId,
      title: project.title,
      university: project.university,
      proposal: project.proposal,
      status: project.status,
      team: project.team,
      milestones: project.milestones,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Industry funds a proposal and sets deadline
// @route   POST /api/projects/:projectId/fund
// @access  Private (Industry)
const fundProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { fundingAmount, deadline, mentorshipNotes } = req.body;
    const industryName = req.user?.org || req.user?.name || 'Tata Steel CSR & Sustainability';

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.funded = true;
    project.status = 'Funded';
    project.industry = industryName;
    project.industryId = req.user?._id;
    project.fundingAmount = Number(fundingAmount) || 250000;
    project.fundingDate = new Date();
    if (deadline) project.deadline = new Date(deadline);
    if (mentorshipNotes) project.mentorshipNotes = mentorshipNotes;

    await project.save();

    // Update linked issue
    const issue = await Issue.findById(project.issueId).catch(() => null);
    if (issue) {
      issue.status = 'In progress';
      issue.timeline.push({
        at: new Date(),
        label: `Industry funding (₹${project.fundingAmount.toLocaleString('en-IN')}) approved by ${industryName}. Target completion: ${deadline || 'Scheduled'}`,
        actor: industryName,
        role: 'industry',
      });
      await issue.save();

      // Notify citizen reporter
      await Notification.create({
        recipient: issue.reporter,
        recipientRole: 'citizen',
        issueId: String(issue._id),
        projectId: String(project._id),
        title: 'Project Funded & Execution Started! 🚀',
        message: `${industryName} approved funding for "${issue.title}". University team has commenced implementation with a set completion deadline.`,
        type: 'funding_approved',
      });
    }

    // Notify university
    await Notification.create({
      recipient: project.universityId,
      recipientRole: 'university',
      projectId: String(project._id),
      title: `Funding Approved: ${project.title}`,
      message: `${industryName} committed ₹${project.fundingAmount.toLocaleString('en-IN')} with target deadline ${deadline || '3 months'}.`,
      type: 'funding_approved',
    });

    res.json({
      id: project._id,
      _id: project._id,
      issueId: project.issueId,
      title: project.title,
      funded: project.funded,
      status: project.status,
      industry: project.industry,
      fundingAmount: project.fundingAmount,
      deadline: project.deadline,
      milestones: project.milestones,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update project milestones & track progress
// @route   PATCH /api/projects/:projectId/milestones
// @access  Private
const updateMilestones = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { milestones } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const prevMilestones = project.milestones || [];
    project.milestones = milestones;

    const issue = await Issue.findById(project.issueId).catch(() => null);

    // Notify citizen if a milestone was newly completed
    const newlyCompleted = milestones.find((m, i) => m.done && !prevMilestones[i]?.done);
    if (newlyCompleted && issue) {
      issue.timeline.push({
        at: new Date(),
        label: `Milestone completed: ${newlyCompleted.name}`,
        actor: project.university || 'University Team',
        role: 'university',
      });
      await issue.save();

      if (issue.reporter) {
        await Notification.create({
          recipient: issue.reporter,
          recipientRole: 'citizen',
          issueId: String(issue._id),
          projectId: String(project._id),
          title: 'Milestone Achieved! ⚙️',
          message: `University team completed milestone: "${newlyCompleted.name}" for "${project.title}".`,
          type: 'milestone_completed',
        });
      }
    }

    // Check if all milestones are completed
    const allDone = milestones.length > 0 && milestones.every((m) => m.done);
    if (allDone) {
      project.status = 'Completed';

      // Update linked issue to Resolved
      if (issue) {
        issue.status = 'Resolved';
        issue.timeline.push({
          at: new Date(),
          label: 'All project milestones achieved. Issue verified as Resolved on the ground.',
          actor: 'Sahayog Platform',
          role: 'system',
        });
        await issue.save();

        // Notify citizen
        if (issue.reporter) {
          await Notification.create({
            recipient: issue.reporter,
            recipientRole: 'citizen',
            issueId: String(issue._id),
            projectId: String(project._id),
            title: 'Civic Issue Resolved & Verified! ✅',
            message: `Great news! The solution for "${issue.title}" has been successfully deployed and verified.`,
            type: 'issue_resolved',
          });
        }
      }
    }

    await project.save();

    res.json({
      id: project._id,
      _id: project._id,
      milestones: project.milestones,
      status: project.status,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single project details
// @route   GET /api/projects/:id
// @access  Public / Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  saveTeam,
  submitProposal,
  fundProject,
  updateMilestones,
  getProjectById,
};
