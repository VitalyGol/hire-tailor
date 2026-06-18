from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class UserLanguageLevel(str, Enum):
    """Supported proficiency levels for extracted user languages."""

    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"
    fluent = "fluent"
    native = "native"


class PersonalInfo(BaseModel):
    """Personal contact details extracted from a user's resume."""

    model_config = ConfigDict(extra="forbid")

    firstName: str
    lastName: str
    email: str
    phoneNumber: Optional[str] = None   

class WorkProject(BaseModel):
    """Project details associated with a work experience entry."""

    model_config = ConfigDict(extra="forbid")

    projectName: str
    projectDescription: str
    skills: List[str]


class WorkExperience(BaseModel):
    """Professional experience entry extracted from a user's resume."""

    model_config = ConfigDict(extra="forbid")

    startDate: str
    endDate: Optional[str] = None
    companyName: str
    position: str
    projects: List[WorkProject]


class Education(BaseModel):
    """Formal education entry extracted from a user's resume."""

    model_config = ConfigDict(extra="forbid")

    institution: str
    specialization: str
    startDate: str
    endDate: Optional[str] = None


class CourseCertificate(BaseModel):
    """Course or certificate entry extracted from a user's resume."""

    model_config = ConfigDict(extra="forbid")

    title: str
    organization: str
    issueDate: str
    certificateUrl: Optional[str] = None


class UserLanguage(BaseModel):
    """Language and proficiency pair extracted from a user's resume."""

    model_config = ConfigDict(extra="forbid")

    language: str
    level: UserLanguageLevel


class UserProfile(BaseModel):
    """Structured user profile extracted from resume content."""

    model_config = ConfigDict(extra="forbid")

    personalInfo: PersonalInfo
    professionalTitle: Optional[str] = None
    professionalSummary: Optional[str] = None
    workExperience: List[WorkExperience]
    education: List[Education]
    courses: List[CourseCertificate]
    languages: List[UserLanguage]
