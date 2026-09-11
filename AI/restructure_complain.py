import os
import sys
import json
import re
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Setup NVIDIA Model using langchain-nvidia-ai-endpoints or OpenAI compatible client
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
NVIDIA_MODEL = os.getenv("NVIDIA_MODEL", "meta/llama-3.3-70b-instruct")

_llm = None

def get_nvidia_llm():
    global _llm
    if _llm is not None:
        return _llm
    
    api_key = os.getenv("NVIDIA_API_KEY")
    model_name = os.getenv("NVIDIA_MODEL", "meta/llama-3.3-70b-instruct")

    try:
        from langchain_nvidia_ai_endpoints import ChatNVIDIA
        _llm = ChatNVIDIA(
            model=model_name,
            nvidia_api_key=api_key,
            temperature=0.2,
            max_tokens=1024,
        )
        return _llm
    except Exception as e:
        try:
            from langchain_openai import ChatOpenAI
            _llm = ChatOpenAI(
                model=model_name,
                openai_api_key=api_key,
                openai_api_base="https://integrate.api.nvidia.com/v1",
                temperature=0.2,
                max_tokens=1024,
            )
            return _llm
        except Exception:
            return None


SYSTEM_PROMPT = """SOCIETAL CHALLENGE EVALUATION & STRUCTURING ENGINE (JHARKHAND, INDIA)
You are the AI Societal Challenge Evaluation and Structuring Assistant for the Sahayog civic platform.

MULTILINGUAL & REGIONAL LANGUAGE INSTRUCTIONS:
1. SUPPORT REGIONAL INDIAN LANGUAGES: Submissions can be in English, Hindi, Khortha (खोरठा), Santhali (संथाली / Ol Chiki), Bengali (বাংলা), Nagpuri, Magahi, Bhojpuri, Mundari, Ho, Kurukh, or mixed/Romanized Indian scripts (e.g. "hameen chas prakhand ke bhandra gaon... bijli aaru paani ke killat").
2. NEVER reject a submission merely because it is written in Hindi, Khortha, or any Indian regional language.
3. Understand regional terms (e.g., "हमीन" = we/our, "चास/भंडरा" = Chas block/Bhandra village, "किल्लत" = scarcity, "मेहरारू" = women, "पटवन" = irrigation/watering crops, "चापाकल" = handpump, "निहोरा" = humble petition/request, "बिजली/पानी" = electricity/water).

EVALUATION & FILTERING:
1. REJECT ONLY if the input is unintelligible, random keyboard mashing (e.g. "adfdsafsfasf", "afdafadafdasfdgadsg", "djjnadlfkldfjslf"), gibberish, abusive, obscene, or fraudulent.
2. REJECT if the issue is TRIVIAL or VERY SMALL (e.g. a minor personal inconvenience, lost personal item, domestic chore, or petty matter that does not qualify as a societal/civic/infrastructure challenge).
3. If REJECTED, return ONLY:
   {
     "isLegitimate": false,
     "rejectionReason": "Constructive, clear explanation in English of why this reported issue is invalid, unintelligible, or too trivial for community/institutional intervention."
   }

STRUCTURED FORMULATION (For Accepted Issues):
- If ACCEPTED, translate the context and convert it into a formal, structured English JSON response for university researchers and CSR sponsors:
   {
     "isLegitimate": true,
     "primary_category": "Infrastructure | Water & Sanitation | Waste Management | Public Safety | Environment | Agriculture | Healthcare | Education | Rural Livelihoods | Mobility",
     "secondary_category": null,
     "priority": "High | Medium | Low",
     "severity": {
         "score": 85,
         "publicRisk": 80,
         "urgency": 90,
         "flooding": 60,
         "factors": ["Critical risk description 1", "Risk factor 2"]
     },
     "structured_complaint": "A concise, formal, professional 2-3 sentence problem formulation in English.",
     "aiProblemStatement": "**Structured Problem Formulation:**\\n\\n**Context & Location:** Locality and District.\\n\\n**Core Challenge:** Comprehensive formal description translated into English.\\n\\n**Severity Assessment:** Urgency and Public Risk evaluation.\\n\\n**Recommended Innovation Objective:** Actionable engineering/scientific objective for university teams.",
     "aiSummary": "1-sentence executive English summary with priority and location.",
     "routing": {
         "recipient_type": "UNIVERSITY",
         "recommended_department": "Civil Engineering / Environmental Science / etc."
     },
     "location": {
         "district": null,
         "block": null,
         "landmark": null
     }
   }

STRICT RULES:
1. Always return strictly valid JSON without markdown outside fences.
2. Formulate all output fields in formal English while capturing the true meaning of regional inputs.
"""


def _fallback_restructure(complaint_text: str, user_name: str = "", district: str = "", block: str = "") -> Dict[str, Any]:
    """Deterministic fallback NLP parser if NVIDIA API is unavailable or offline."""
    text = complaint_text.lower()
    
    category_map = {
        "Water & Sanitation": ["water", "drain", "borewell", "fluoride", "contamination", "pipeline", "leakage", "sewage", "drinking", "पानी", "जल", "चापाकल", "कुआँ", "नल", "बोरवेल", "सीवेज", "टैंकर", "नाली"],
        "Waste Management": ["garbage", "dump", "trash", "plastic", "waste", "landfill", "litter", "compost", "कचरा", "कूड़ा", "गंदगी", "प्लास्टिक"],
        "Infrastructure": ["road", "bridge", "pothole", "culvert", "crack", "collapse", "footpath", "pavement", "drainage", "power", "electricity", "transformer", "voltage", "सड़क", "बिजली", "ट्रांसफार्मर", "पुल", "नाली", "वोल्टेज"],
        "Public Safety": ["light", "dark", "accident", "women", "school", "hazard", "cctv", "danger", "electrocution", "safety", "सुरक्षा", "अंधेरा", "लाइट", "दुर्घटना", "खतरा", "महिला"],
        "Agriculture": ["crop", "farmer", "storage", "harvest", "spoilage", "irrigation", "soil", "pest", "mandi", "खेती", "किसान", "फसल", "पटवन", "सिंचाई"],
        "Healthcare": ["hospital", "clinic", "medicine", "doctor", "disease", "malaria", "dengue", "fluorosis", "health", "अस्पताल", "दवा", "डॉक्टर", "स्वास्थ्य", "बीमारी"],
        "Environment": ["pollution", "dust", "smoke", "flyash", "air", "mining", "forest", "wildlife", "tree", "प्रदूषण", "धूल", "धुआं", "जंगल", "नदी"],
        "Rural Livelihoods": ["artisan", "tribal", "weaving", "handicraft", "employment", "shg", "self help", "रोजगार", "आजीविका", "कारीगर"],
        "Education": ["school", "college", "hostel", "teacher", "classroom", "books", "student", "स्कूल", "विद्यालय", "छात्र", "शिक्षक"],
        "Mobility": ["bus", "transport", "traffic", "auto", "roadway", "बस", "गाड़ी", "यातायात"],
    }
    
    matched_cat = "Infrastructure"
    best_cnt = 0
    for cat, kws in category_map.items():
        cnt = sum(1 for kw in kws if kw in text)
        if cnt > best_cnt:
            best_cnt = cnt
            matched_cat = cat

    urgency = 50
    public_risk = 45
    flooding = 25
    factors = []

    if any(k in text for k in ["accident", "fatal", "death", "toxic", "poison", "critical", "urgent", "danger"]):
        urgency += 25
        public_risk += 30
        factors.append("High severity alert terms identified")

    if any(k in text for k in ["water", "flood", "drain", "overflow", "leak"]):
        flooding += 45
        factors.append("Hydrological / waterlogging vulnerability")

    if any(k in text for k in ["dark", "light", "women", "children", "school"]):
        public_risk += 30
        urgency += 15
        factors.append("Nighttime safety / vulnerable demographic impact")

    urgency = min(96, max(20, urgency))
    public_risk = min(96, max(20, public_risk))
    flooding = min(96, max(15, flooding))
    score = round((urgency * 0.4) + (public_risk * 0.4) + (flooding * 0.2))
    priority = "High" if score >= 75 else "Medium" if score >= 50 else "Low"

    loc_str = f"{block or 'Block'}, {district or 'District'}"
    ai_problem_statement = (
        f"**Structured Problem Formulation:**\n\n"
        f"**Context & Location:** Reported in {loc_str} regarding **{matched_cat}**.\n\n"
        f"**Core Challenge:** {complaint_text}. The challenge directly impacts daily community life, public safety, and municipal utility access.\n\n"
        f"**Severity Assessment ({priority} Priority - Score {score}/100):** Public Safety Risk: {public_risk}%, Urgency for Intervention: {urgency}%, Environmental/Hazard Factor: {flooding}%.\n\n"
        f"**Recommended Innovation Objective:** Formulate multidisciplinary student & faculty technical interventions for field prototyping and CSR deployment."
    )

    return {
        "primary_category": matched_cat,
        "secondary_category": None,
        "priority": priority,
        "severity": {
            "score": score,
            "publicRisk": public_risk,
            "urgency": urgency,
            "flooding": flooding,
            "factors": factors,
        },
        "structured_complaint": f"Community challenge regarding {matched_cat.lower()} in {loc_str}: {complaint_text}",
        "aiProblemStatement": ai_problem_statement,
        "aiSummary": f"AI identified {priority.toLowerCase() if hasattr(priority, 'toLowerCase') else priority.lower()} priority {matched_cat.lower()} challenge in {loc_str} with {score}% severity.",
        "routing": {
            "recipient_type": "UNIVERSITY",
            "recommended_department": matched_cat,
        },
        "location": {
            "district": district,
            "block": block,
            "landmark": "",
        },
    }


def restructure_complaint(data) -> Dict[str, Any]:
    """
    Analyzes citizen complaint using NVIDIA's LLM model.
    Accepts data object (or dict) with user_id, user_name, complaint_query, district, block.
    """
    user_id = getattr(data, "user_id", None) or (data.get("user_id") if isinstance(data, dict) else "u-citizen")
    user_name = getattr(data, "user_name", None) or (data.get("user_name") if isinstance(data, dict) else "Citizen Reporter")
    complaint_query = getattr(data, "complaint_query", None) or (data.get("complaint_query") if isinstance(data, dict) else "")
    if not complaint_query:
        complaint_query = getattr(data, "description", None) or (data.get("description") if isinstance(data, dict) else "")
    title = getattr(data, "title", None) or (data.get("title") if isinstance(data, dict) else "")
    district = getattr(data, "district", None) or (data.get("district") if isinstance(data, dict) else "Ranchi")
    block = getattr(data, "block", None) or (data.get("block") if isinstance(data, dict) else "Kanke")
    landmark = getattr(data, "landmark", None) or (data.get("landmark") if isinstance(data, dict) else "")

    combined_query = f"{title}: {complaint_query}".strip(" :")

    llm = get_nvidia_llm()
    api_key = os.getenv("NVIDIA_API_KEY")

    if not llm or not api_key:
        # Fallback to local heuristic engine if API key is not configured
        res = _fallback_restructure(combined_query, user_name, district, block)
        res["isLegitimate"] = True
        return res

    human_message = f"""
    Citizen User ID: {user_id}
    Citizen Name: {user_name}
    District: {district}
    Block: {block}
    Landmark: {landmark}
    Complaint Text: {combined_query}
    """

    try:
        from langchain_core.messages import SystemMessage, HumanMessage
        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=human_message),
        ]
        response = llm.invoke(messages)
        content = response.content.strip()

        # Clean JSON from markdown fences if any
        json_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", content, re.DOTALL)
        if json_match:
            content = json_match.group(1)
        elif content.startswith("{") and content.endswith("}"):
            content = content
        else:
            # Search for first { and last }
            start = content.find("{")
            end = content.rfind("}")
            if start != -1 and end != -1:
                content = content[start:end+1]

        parsed = json.loads(content)
        return parsed
    except Exception as err:
        print(f"[NVIDIA LLM Error] {err}, using fallback NLP engine", file=sys.stderr)
        return _fallback_restructure(combined_query, user_name, district, block)
