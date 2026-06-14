"""
Consultant request model defining the structure of the data required for a consultant request.
This model includes the user's resume information, job requirements, and chat history.
The ConsultantRequest model is used to encapsulate all the necessary information for processing
a consultant request and generating a response based on the user's profile and job requirements.
"""
from typing import List
from pydantic import BaseModel, ConfigDict
from models.ai.extract_models import UserProfile

class ChatMessage(BaseModel):
    """Model representing a single chat message in the consultant request."""
    role: str
    text: str
    createdAt: str

class ConsultantRequest(BaseModel):
    """Model representing the consultant request containing the user's resume, 
    job requirements, and chat history."""
    model_config = ConfigDict(extra="forbid")

    resume: UserProfile
    job_requirement: str
    chat_history: List[ChatMessage]
