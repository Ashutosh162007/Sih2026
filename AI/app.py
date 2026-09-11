"""
Sahayog AI Engine — FastAPI Microservice Powered by NVIDIA NIM Models
Endpoints:
- POST /api/ai/restructure (Converts citizen complaint into structured research statement & severity using NVIDIA)
- POST /api/ai/severity (Computes composite severity and risk factors)
- POST /api/ai/duplicate-check (Checks for semantic duplicates)
- GET /api/ai/health
"""

import os
import sys
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

from restructure_complain import restructure_complaint

app = FastAPI(
    title="Sahayog AI Microservice (NVIDIA NIM)",
    description="AI-Powered Societal Challenge Structuring & Severity Engine powered by NVIDIA Models",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ComplaintInput(BaseModel):
    user_id: Optional[str] = "guest"
    user_name: Optional[str] = "Citizen Reporter"
    complaint_query: Optional[str] = ""
    description: Optional[str] = ""
    title: Optional[str] = ""
    category: Optional[str] = None
    district: Optional[str] = "Ranchi"
    block: Optional[str] = "Kanke"
    landmark: Optional[str] = ""
    evidence_urls: Optional[List[str]] = []

class DuplicateCheckInput(BaseModel):
    new_query: str
    existing_issues: List[Dict[str, Any]] = []

@app.get("/")
def root():
    return {
        "service": "Sahayog AI Engine",
        "provider": "NVIDIA",
        "model": os.getenv("NVIDIA_MODEL", "meta/llama-3.3-70b-instruct"),
        "status": "online",
        "docs": "/docs",
    }

@app.get("/api/ai/health")
def health():
    return {
        "status": "healthy",
        "service": "Sahayog AI Engine",
        "provider": "NVIDIA",
        "has_nvidia_key": bool(os.getenv("NVIDIA_API_KEY")),
        "model": os.getenv("NVIDIA_MODEL", "meta/llama-3.3-70b-instruct"),
    }

@app.post("/api/ai/restructure")
def restructure_endpoint(data: ComplaintInput):
    """
    Passes citizen complaint to NVIDIA's model to synthesize formal problem formulation,
    category classification, and severity risk factors.
    """
    text = data.complaint_query or data.description or data.title
    if not text or len(text.strip()) < 4:
        raise HTTPException(status_code=400, detail="Complaint query or description is required.")

    result = restructure_complaint(data)
    if result.get("isLegitimate") is False:
        raise HTTPException(
            status_code=400,
            detail=result.get("rejectionReason", "The submission contains unintelligible, inappropriate, or illegal content.")
        )

    return {
        "success": True,
        **result
    }

@app.post("/api/ai/severity")
def evaluate_severity_endpoint(data: ComplaintInput):
    """
    Evaluates multi-factor composite severity using NVIDIA model.
    """
    result = restructure_complaint(data)
    if result.get("isLegitimate") is False:
        raise HTTPException(
            status_code=400,
            detail=result.get("rejectionReason", "The submission contains unintelligible, inappropriate, or illegal content.")
        )

    return {
        "severity": result.get("severity"),
        "priority": result.get("priority", "Medium"),
    }

@app.post("/api/ai/duplicate-check")
def duplicate_check_endpoint(data: DuplicateCheckInput):
    """
    Checks if a newly reported issue is a duplicate of existing complaints.
    """
    new_words = set(data.new_query.lower().split())
    duplicates = []

    for issue in data.existing_issues:
        existing_words = set(f"{issue.get('title', '')} {issue.get('description', '')}".lower().split())
        intersection = new_words.intersection(existing_words)
        union = new_words.union(existing_words)
        similarity = len(intersection) / max(1, len(union))
        if similarity > 0.4:
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
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
