from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class UserLanguageLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"
    fluent = "fluent"
    native = "native"


class PersonalInfo(BaseModel):
    model_config = ConfigDict(extra="forbid")

    firstName: str
    lastName: str
    email: str


class WorkProject(BaseModel):
    model_config = ConfigDict(extra="forbid")

    projectName: str
    projectDescription: str


class WorkExperience(BaseModel):
    model_config = ConfigDict(extra="forbid")

    startDate: str
    endDate: Optional[str] = None
    companyName: str
    position: str
    projects: List[WorkProject]


class Education(BaseModel):
    model_config = ConfigDict(extra="forbid")

    institution: str
    specialization: str
    startDate: str
    endDate: Optional[str] = None


class CourseCertificate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    organization: str
    issueDate: str
    certificateUrl: Optional[str] = None


class UserLanguage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    language: str
    level: UserLanguageLevel


class UserProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    personalInfo: PersonalInfo
    workExperience: List[WorkExperience]
    education: List[Education]
    courses: List[CourseCertificate]
    languages: List[UserLanguage]