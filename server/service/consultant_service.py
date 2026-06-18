from typing import List
import re

from pydantic import ValidationError
from core.base_provider import BaseProvider
from formatters.resume_prompt_formatter import PromptFormatter
from models.ai.extract_models import UserProfile
from models.api.consultant_request import ChatMessage
from models.api.consultant_response import ConsultantResponse
from models.ai.consultant_answer_model import ConsultantAnswerModel
from service.prompt_builder import PromptBuilder



class ConsultantService:
    """Service for generating interview coaching responses from chat context."""

    def __init__(self, provider: BaseProvider, prompt_builder: PromptBuilder):
        self.provider = provider
        self.prompt_builder = prompt_builder

    def ask_consultant(self, history_chat: List[ChatMessage], job_requirement: str, resume: UserProfile):
        resume_str = PromptFormatter.prepare_resume_for_prompt(resume)
        question = history_chat[-1].text if history_chat else ""
        prompt = self.prompt_builder.consultatnt_prompt(question, history_chat, job_requirement, resume_str)
        data = self.provider.get_data(prompt, enable_thinking=False)
        text = self._extract_json(data)
        if self.is_valid_json(text):
            consultant_answer = ConsultantAnswerModel.model_validate_json(text)
            text = f"""
                **Feedback:** 
                {consultant_answer.feedback}

                **Next question:** 
                {consultant_answer.next_question}
            """

        return ConsultantResponse(answer=text)

    def _extract_json(self, data: str) -> str:
        text = data.strip()
        text = re.sub(r"^```json\s*", "", text)
        text = re.sub(r"^```\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
        return text

    def is_valid_json(self, text: str) -> bool:
        try:
            ConsultantAnswerModel.model_validate_json(text)
            return True
        except ValidationError:
            return False
