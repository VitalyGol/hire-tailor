from core.base_provider import BaseProvider
from formatters.resume_prompt_formatter import PromptFormatter
from models.ai.extract_models import UserProfile
from models.api.consultant_request import ChatMessage
from models.ai.consultant_response import ConsultantResponse
from service.prompt_builder import PromptBuilder
from typing import List


class ConsultantService:
    def __init__(self, provider: BaseProvider, prompt_builder: PromptBuilder):
        self.provider = provider
        self.prompt_builder = prompt_builder

    def ask_consultant(self, history_chat: List[ChatMessage], job_requirement: str, resume: UserProfile):
        resume_str = PromptFormatter.prepare_resume_for_prompt(resume)
        question = history_chat[-1].text if history_chat else "What can I improve in my resume for this job?"
        history_chat_str = PromptFormatter.prepare_history_chat_for_prompt(history_chat[:-10]) if len(history_chat) > 1 else ""
        prompt = self.prompt_builder.consultatnt_prompt(question, history_chat_str, job_requirement, resume_str)
        data = self.provider.get_data(prompt, text_format=ConsultantResponse)
        return data

   