from typing import List

from pydantic import BaseModel, ConfigDict

from models.ai.extract_models import CourseCertificate, Education, UserLanguage, WorkExperience

class ResumeModel(BaseModel):
    """Tailored resume content generated for a specific job requirement."""

    model_config = ConfigDict(extra="forbid")

    professionalTitle: str
    professionalSummary: str
    workExperience: List[WorkExperience]
    education: List[Education]
    courses: List[CourseCertificate]
    languages: List[UserLanguage]
