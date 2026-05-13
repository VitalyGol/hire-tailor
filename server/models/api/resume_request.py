from pydantic import BaseModel

class ResumeRequest(BaseModel):
    resume: str
    job_requirement: str
    language: str
