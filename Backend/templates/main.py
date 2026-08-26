from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

app = FastAPI()

templates = Jinja2Templates(directory="templates")

# Temporary storage
complaints = {}

# Home page
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {"request": request}
    )


# Receive complaint
@app.post("/complaints")
async def create_complaint(
    username: str = Form(...),
    complaint: str = Form(...)
):
    complaint_id = len(complaints) + 1

    complaints[complaint_id] = {
        "username": username,
        "complaint": complaint
    }

    return {
        "message": "Complaint submitted successfully",
        "complaint_id": complaint_id,
        "data": complaints[complaint_id]
    }


# Fetch a complaint
@app.get("/complaints/{complaint_id}")
async def get_complaint(complaint_id: int):

    if complaint_id not in complaints:
        return {
            "error": "Complaint not found"
        }

    return complaints[complaint_id]