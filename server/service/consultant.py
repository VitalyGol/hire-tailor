from server.core.base_provider import BaseProvider
from server.formatters.resume_prompt_formatter import prepare_resume_for_prompt
from server.models.ai.extract_models import UserProfile
from server.service.prompt_builder import PromptBuilder


class Consultant:
    def __init__(self, provider: BaseProvider, prompt_builder: PromptBuilder):
        self.provider = provider
        self.prompt_builder = prompt_builder

    def ask_consultant(self, user_message: str, job_requirement: str, resume: UserProfile):
        resume_str = prepare_resume_for_prompt(resume)
        prompt = self.prompt_builder.consultatnt_prompt(user_message, job_requirement, resume_str)
        data = self.provider.get_data(prompt)
        return data

   