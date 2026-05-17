
from abc import ABC, abstractmethod

class BasePromptBuilder(ABC):

    @abstractmethod
    def get_resume_prompt(self, language: str, job_requirement: str, resume: str):
        pass

    @abstractmethod
    def extract_info_prompt(self, resume: str):
        pass

    @abstractmethod
    def consultatnt_prompt(self, user_message: str, job_requirement: str, resume: str):
        pass