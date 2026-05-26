"""Consultant response model defining the structure of the data returned by the consultant API.
This model includes the answer provided by the consultant based on the user's resume, job 
requirements, and chat history. The ConsultantResponse model is used to encapsulate the response
data from the consultant API and provide a structured format for processing and presenting the
consultant's answer to the user."""
from pydantic import BaseModel

class ConsultantResponse(BaseModel):
    """Model representing the response from the consultant API containing the answer 
    to the user's query."""
    answer: str
