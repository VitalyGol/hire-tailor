from pydantic import BaseModel

class ConsultantResponse(BaseModel):
    answer: str