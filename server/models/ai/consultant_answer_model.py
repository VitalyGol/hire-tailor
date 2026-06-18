from pydantic import BaseModel, ConfigDict

class ConsultantAnswerModel(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    feedback: str
    next_question: str