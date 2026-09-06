"""Sahayog AI Service — FastAPI endpoint for LLM complaint structuring.

Exposes the LangChain/Mistral pipeline (AI/restructure_complain.py) as a
simple HTTP service so the Express backend can call it synchronously.

Usage:
    uvicorn app:app --host 0.0.0.0 --port 8000
"""

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from restructure_complain import restructure_complaint

app = FastAPI(
    title="Sahayog AI Service",
    description="Structures and classifies unstructured civic complaints.",
    version="1.0.0",
)


class ComplaintRequest(BaseModel):
    user_id: Optional[str] = Field(default=None, description="Platform user id")
    user_name: Optional[str] = Field(default="", description="Reporter name")
    complaint_query: str = Field(..., description="Unstructured citizen complaint text")
    title: Optional[str] = Field(default="", description="Optional short title")
    district: Optional[str] = Field(default=None)
    block: Optional[str] = Field(default=None)


@app.get("/health")
def health():
    return {"status": "healthy", "service": "sahayog-ai"}


@app.post("/ai/structure")
def structure_complaint(req: ComplaintRequest):
    """Structure, classify, and score a citizen complaint."""
    try:
        result = restructure_complaint(req.model_dump())
    except Exception as exc:  # noqa: BLE001 - surface LLM/parse failures cleanly
        raise HTTPException(status_code=502, detail=f"AI processing failed: {exc}")

    # Merge requested context back so the backend can persist everything
    result["original_complaint"] = req.complaint_query
    result.setdefault("title", req.title or "")
    return result