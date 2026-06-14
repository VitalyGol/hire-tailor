"""Resume request model defining the structure of the data required for a resume request.
This model includes the user's resume information, job requirements, and the language for resume 
generation.
The ResumeRequest model is used to encapsulate all the necessary information for processing
a resume generation request and generating a tailored resume based on the user's profile and 
job requirements.
"""
from pydantic import BaseModel
from models.ai.extract_models import UserProfile

class ResumeRequest(BaseModel):
    """Model representing the resume request containing the user's resume, job requirements, 
    and language for resume generation."""
    resume: UserProfile
    job_requirement: str
    language: str
