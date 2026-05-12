
from core.base_provider import BaseProvider
from prompt_builder import PromptBuilder

class ResumeGenerator:
    def __init__(self, provider: BaseProvider, prompt_builder: PromptBuilder):
        self.provider = provider
        self.prompt_builder = prompt_builder

    def generate_resume(self, language: str, job_requirement: str, resume: str):
        prompt = self.prompt_builder.get_resume_prompt(language, job_requirement, resume)
        data = self.provider.get_data(prompt)
        return data