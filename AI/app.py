"""
Sahayog AI Engine — FastAPI Microservice
Provides:
1. Societal Challenge NLP Restructuring & Problem Formulation
2. Multi-factor Severity & Risk Assessment (Public Risk, Flooding, Urgency)
3. Proximity-aware HEI Domain Recommendation
4. Duplicate Detection
"""

import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Sahayog AI Microservice",
    description="AI-Powered Societal Challenge Structuring and Severity Analysis API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Request Models
class ComplaintInput(BaseModel):
    user_id: Optional[str] = "guest"
    user_name: Optional[str] = "Citizen Reporter"
    complaint_query: str = Field(..., description="Raw citizen problem description")
    title: Optional[str] = ""
    category: Optional[str] = None
    district: Optional[str] = "Ranchi"
    block: Optional[str] = "Kanke"
    landmark: Optional[str] = ""
    evidence_urls: Optional[List[str]] = []

class DuplicateCheckInput(BaseModel):
    new_query: str
    existing_issues: List[Dict[str, Any]] = []

CATEGORY_KEYWORDS = {
    "Water & Sanitation": ["water", "drain", "borewell", "fluoride", "contamination", "pipeline", "leakage", "drinking", "sewage"],
    "Waste Management": ["garbage", "dump", "trash", "plastic", "waste", "landfill", "litter", "compost"],
    "Infrastructure": ["road", "bridge", "pothole", "culvert", "crack", "collapse", "footpath", "drainage"],
    "Public Safety": ["light", "dark", "accident", "women", "school", "hazard", "cctv", "danger", "electrocution"],
    "Agriculture": ["crop", "farmer", "storage", "harvest", "spoilage", "irrigation", "soil", "pest", "mandi"],
    "Healthcare": ["hospital", "clinic", "medicine", "doctor", "disease", "malaria", "dengue", "fluorosis"],
    "Environment": ["pollution", "dust", "smoke", "flyash", "air", "mining", "forest", "wildlife"],
    "Rural Livelihoods": ["artisan", "tribal", "weaving", "handicraft", "employment", "shg", "self help"],
}

HIGH_SEVERITY_WORDS = [
    "accident", "death", "fatal", "toxic", "poison", "critical", "urgent", "immediate",
    "flood", "collapse", "epidemic", "fluorosis", "children", "school"
]

def analyze_complaint_nlp(data: ComplaintInput) -> Dict[str, Any]:
    text = f"{data.title} {data.complaint_query}".lower()

    # 1. Determine Category
    matched_category = data.category or "Infrastructure"
    best_score = 0
    for cat, keywords in CATEGORY_KEYWORDS.items():
        count = sum(1 for kw in keywords if kw in text)
        if count > best_score:
            best_score = count
            matched_category = cat

    # 2. Multi-factor Severity Scoring
    urgency = 45
    public_risk = 40
    flooding = 25
    factors = []

    for hw in HIGH_SEVERITY_WORDS:
        if hw in text:
            urgency += 12
            public_risk += 14
            factors.append(f"Contains critical alert token: '{hw}'")

    if any(k in text for k in ["water", "flood", "drain", "rain", "overflow"]):
        flooding += 45
        factors.append("Hydrological / inundation hazard identified")

    if any(k in text for k in ["road", "bridge", "crack", "collapse"]):
        flooding += 35
        factors.append("Structural physical integrity risk")

    if any(k in text for k in ["dark", "light", "women", "children", "school"]):
        public_risk += 30
        urgency += 18
        factors.append("Vulnerable population nighttime safety factor")

    urgency = min(96, max(20, urgency))
    public_risk = min(96, max(20, public_risk))
    flooding = min(96, max(15, flooding))
    score = round((urgency * 0.4) + (public_risk * 0.4) + (flooding * 0.2))

    priority = "High" if score >= 75 else "Medium" if score >= 50 else "Low"

    location_str = f"{data.block or 'Block'}, {data.district or 'District'}"
    if data.landmark:
        location_str += f" ({data.landmark})"

    ai_problem_statement = (
        f"**Structured Problem Formulation:**\n\n"
        f"**Context & Location:** Reported in {location_str} regarding **{matched_category}**.\n\n"
        f"**Core Challenge:** {data.complaint_query}. The challenge poses measurable disruption to community welfare and municipal utility infrastructure.\n\n"
        f"**Severity Assessment ({priority} Priority - Score {score}/100):** Public Safety Risk: {public_risk}%, Urgency for Intervention: {urgency}%, Environmental/Hazard Factor: {flooding}%.\n\n"
        f"**Recommended Innovation Objective:** Formulate multidisciplinary student & faculty engineering interventions for field validation and CSR deployment."
    )

    return {
        "success": True,
        "primary_category": matched_category,
        "priority": priority,
        "aiProblemStatement": ai_problem_statement,
        "severity": {
            "score": score,
            "publicRisk": public_risk,
            "urgency": urgency,
            "flooding": flooding,
            "factors": factors,
        },
        "location": {
            "district": data.district,
            "block": data.block,
            "landmark": data.landmark,
        },
    }

@app.get("/")
def root():
    return {
        "service": "Sahayog AI Engine",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
    }

@app.get("/api/ai/health")
def health():
    return {"status": "healthy", "service": "Sahayog AI Engine"}

@app.post("/api/ai/restructure")
def restructure_complaint_endpoint(data: ComplaintInput):
    """
    Accepts raw citizen complaint input and produces structured problem formulation + severity.
    """
    if not data.complaint_query or len(data.complaint_query.strip()) < 5:
        raise HTTPException(status_code=400, detail="Complaint query must be at least 5 characters long")
    
    result = analyze_complaint_nlp(data)
    return result

@app.post("/api/ai/severity")
def evaluate_severity(data: ComplaintInput):
    """
    Calculates multi-factor composite severity score.
    """
    result = analyze_complaint_nlp(data)
    return {"severity": result["severity"], "priority": result["priority"]}

@app.post("/api/ai/duplicate-check")
def duplicate_check(data: DuplicateCheckInput):
    """
    Checks if a reported complaint matches any existing challenge in the database.
    """
    new_words = set(data.new_query.lower().split())
    duplicates = []

    for issue in data.existing_issues:
        existing_words = set(f"{issue.get('title', '')} {issue.get('description', '')}".lower().split())
        intersection = new_words.intersection(existing_words)
        similarity = len(intersection) / max(1, len(new_words.union(existing_words)))
        if similarity > 0.45:
            duplicates.append({
                "issue_id": issue.get("id") or issue.get("_id"),
                "title": issue.get("title"),
                "similarity_score": round(similarity, 2),
            })

    return {
        "is_duplicate": len(duplicates) > 0,
        "duplicates": duplicates,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
