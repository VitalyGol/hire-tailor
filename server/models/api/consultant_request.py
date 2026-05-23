from pydantic import BaseModel, ConfigDict
from typing import List
from models.ai.extract_models import UserProfile

class ChatMessage(BaseModel):
    role: str
    text: str
    createdAt: str

class ConsultantRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    resume: UserProfile
    job_requirement: str
    chat_history: List[ChatMessage]