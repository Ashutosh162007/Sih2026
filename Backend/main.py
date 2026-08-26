# this file contains code to develop backend using fastapi 

from fastapi import FastAPI
from pydantic import BaseModel
from AI.restructure_complain import restructure_complaint
from Backend.db import create_complaint, update_ai_result

app = FastAPI()


class Complaint(BaseModel):
    user_id: str
    user_name: str
    complaint_query: str


@app.post("/citizen")
def register_complaint(data: Complaint):

    ai_result = restructure_complaint(data)
    complaint_id = create_complaint(data)
    update_ai_result(complaint_id, ai_result)

    # Later:
    # 1. Save to MongoDB
    # 2. Send complaint to restructure.py
    # 3. Get LLM result
    # 4. Update MongoDB

    return {
        "message": "Complaint received"
    }

print("no error")