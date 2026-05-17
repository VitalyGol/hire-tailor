from pydantic import BaseModel
from models.ai.extract_models import UserProfile

class ResumeRequest(BaseModel):
    resume: UserProfile
    job_requirement: str
    language: str
