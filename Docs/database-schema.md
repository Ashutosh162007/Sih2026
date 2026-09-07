# Sahayog — Database Schema Documentation (MongoDB / Mongoose)

## 1. Collections Overview

The database is built on MongoDB Atlas with Mongoose ODM modeling. It supports the tripartite collaboration model (Community Reporters, Universities, and Industry) with an Admin governance layer.

---

## 2. Collections & Schemas

### `users`
Stores authenticated platform actors with role-based access and verification status.

```json
{
  "_id": "ObjectId",
  "name": "String (required)",
  "email": "String (required, unique)",
  "password": "String (hashed with bcrypt, minlength: 6)",
  "role": "enum ['community_reporter', 'university', 'industry', 'admin']",
  "status": "enum ['active', 'pending', 'rejected']",
  "org": "String (Institutional / Company affiliation)",
  "location": {
    "district": "String (e.g. Ranchi)",
    "block": "String (e.g. Kanke)",
    "state": "String (Jharkhand)",
    "lat": "Number",
    "lng": "Number"
  },
  "disciplines": ["String (for universities: Civil Engineering, IoT, etc.)"],
  "contactPhone": "String",
  "website": "String",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### `issues`
Stores grassroots civic challenges submitted by citizens and enriched by the AI engine.

```json
{
  "_id": "ObjectId",
  "title": "String (maxlength: 200)",
  "description": "String (Original citizen narrative)",
  "aiProblemStatement": "String (AI synthesized structured research statement)",
  "aiSummary": "String",
  "category": "enum ['Infrastructure', 'Water & Sanitation', 'Waste Management', 'Public Safety', 'Environment', 'Agriculture', 'Healthcare', 'Education', 'Rural Livelihoods', 'Mobility']",
  "status": "enum ['New', 'Under review', 'Assigned', 'In progress', 'Resolved']",
  "priority": "enum ['High', 'Medium', 'Low']",
  "severity": {
    "flooding": "Number (0-100)",
    "publicRisk": "Number (0-100)",
    "urgency": "Number (0-100)",
    "score": "Number (Composite 0-100)",
    "factors": ["String"]
  },
  "reporter": "ObjectId ref Users",
  "reporterId": "String",
  "reporterName": "String",
  "district": "String (Jharkhand District)",
  "block": "String",
  "landmark": "String",
  "lat": "Number",
  "lng": "Number",
  "images": [
    {
      "url": "String (Cloudinary / S3 URL)",
      "filename": "String",
      "size": "Number"
    }
  ],
  "assignee": "String (University name)",
  "assigneeId": "ObjectId ref Users",
  "nearestUniversities": [
    {
      "universityId": "String",
      "name": "String",
      "distanceKm": "Number",
      "district": "String",
      "matchScore": "Number"
    }
  ],
  "timeline": [
    {
      "at": "ISODate",
      "label": "String",
      "actor": "String",
      "role": "String"
    }
  ],
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### `projects`
Tracks solution design, multidisciplinary research teams, industry sponsorship, deadlines, and milestone achievements.

```json
{
  "_id": "ObjectId",
  "issue": "ObjectId ref Issues",
  "issueId": "String",
  "title": "String",
  "university": "String",
  "universityId": "ObjectId ref Users",
  "industry": "String (Industry Partner / CSR)",
  "industryId": "ObjectId ref Users",
  "status": "enum ['Team forming', 'Awaiting funding', 'Funded', 'In progress', 'Completed']",
  "funded": "Boolean",
  "fundingAmount": "Number (in INR ₹)",
  "fundingDate": "ISODate",
  "deadline": "ISODate (Target completion date set by industry)",
  "mentorshipNotes": "String",
  "team": [
    {
      "discipline": "String",
      "members": ["String"]
    }
  ],
  "proposal": "String (Methodology and technical plan)",
  "expectedImpact": "String",
  "milestones": [
    {
      "name": "String",
      "due": "String (YYYY-MM-DD)",
      "done": "Boolean",
      "completedAt": "ISODate",
      "notes": "String"
    }
  ],
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### `notifications`
Real-time notification ledger for all stakeholders.

```json
{
  "_id": "ObjectId",
  "recipient": "ObjectId ref Users (optional)",
  "recipientRole": "enum ['all', 'community_reporter', 'university', 'industry', 'admin']",
  "issueId": "String",
  "projectId": "String",
  "title": "String",
  "message": "String",
  "type": "enum ['issue_reported', 'team_formed', 'proposal_submitted', 'funding_approved', 'deadline_set', 'milestone_updated', 'issue_resolved', 'account_verified']",
  "read": "Boolean",
  "createdAt": "ISODate"
}
```
