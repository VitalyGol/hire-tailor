from typing import List

from pydantic import BaseModel, ConfigDict

from models.ai.extract_models import CourseCertificate, Education, UserLanguage, WorkExperience

class ResumeModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    professionalTitle: str
    professionalSummary: str
    workExperience: List[WorkExperience]
    education: List[Education]
    courses: List[CourseCertificate]
    languages: List[UserLanguage]