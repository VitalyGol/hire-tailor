from pydantic import BaseModel, ConfigDict

class ResumeModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    professional_title: str
    professional_summary: str