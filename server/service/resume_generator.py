
from core.base_provider import BaseProvider
from models.ai.extract_models import UserProfile
from formatters.resume_prompt_formatter import PromptFormatter
from core.base_prompt_builder import BasePromptBuilder
from models.ai.resume_model import ResumeModel

class ResumeGenerator:
    def __init__(self, provider: BaseProvider, prompt_builder: BasePromptBuilder):
        self.provider = provider
        self.prompt_builder = prompt_builder

    def generate_resume(self, language: str, job_requirement: str, resume: UserProfile):
        resume_str = PromptFormatter.prepare_resume_for_prompt(resume)
        prompt = self.prompt_builder.get_resume_prompt(language, job_requirement, resume_str)
        data = self.provider.get_data(prompt, text_format=ResumeModel)
        return data
    
    def extract_info(self, resume: str):
        prompt = self.prompt_builder.extract_info_prompt(resume)
        data = self.provider.get_data(prompt, text_format=UserProfile)
        return data