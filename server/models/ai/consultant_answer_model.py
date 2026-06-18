from pydantic import BaseModel, ConfigDict

class ConsultantAnswerModel(BaseModel):
    """Structured interview feedback and the next consultant question."""

    model_config = ConfigDict(extra="forbid")
    
    feedback: str
    next_question: str
