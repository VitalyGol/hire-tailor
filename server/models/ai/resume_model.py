from pedantic import BaseModel

class ResumeModel(BaseModel):
    job_name: str
    candidate_profile: str
    experience: list[dict]
    education: list[dict]