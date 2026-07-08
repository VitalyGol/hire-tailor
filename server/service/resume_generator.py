
"""
ResumeGenerator class responsible for generating resumes based on user profiles and job 
requirements. This class utilizes a provider to interact with an AI service and a prompt
builder to create prompts for resume generation and information extraction. 
It provides methods to generate a new resume tailored to specific job requirements 
and to extract structured information from an existing resume. 
The class serves as a core component of the resume generation functionality 
in the application, allowing users to create and optimize their resumes for job applications.
"""

from core import BaseProvider, BasePromptBuilder
from formatters import PromptFormatter
from models.ai.resume_model import ResumeModel
from models.ai.extract_models import UserProfile


class ResumeGenerator:
    """
    ResumeGenerator class responsible for generating resumes based on user profiles and job 
    requirements. This class utilizes a provider to interact with an AI service and a prompt
    builder to create prompts for resume generation and information extraction. It provides
    methods to generate a new resume tailored to specific job requirements and to extract
    structured information from an existing resume. 
    The class serves as a core component of the resume generation functionality
    in the application, allowing users to create and optimize their resumes for job applications.
    """

    def __init__(self, provider: BaseProvider, prompt_builder: BasePromptBuilder):
        self.provider = provider
        self.prompt_builder = prompt_builder

    def generate_resume(self, language: str, job_requirement: str, resume: UserProfile):
        """
        Method to generate a new resume based on the provided language, job requirements, 
        and existing resume content. It prepares the existing resume content for prompt generation,
        creates a prompt using the prompt builder,
        and retrieves the generated resume from the provider in a structured format. The generated 
        resume is returned as a ResumeModel instance that can be used for further processing or 
        presentation to the user.
        :param language: The language in which the resume should be generated.
        :param job_requirement: The job requirements that the resume should be tailored to.
        :param resume: The existing resume content that can be used as a reference for generating 
        the new resume.
        :return: A ResumeModel instance containing the generated resume information.
        """
        resume_str = PromptFormatter.prepare_resume_for_prompt(resume)
        prompt = self.prompt_builder.get_resume_prompt(
            language, job_requirement, resume_str)
        data = self.provider.get_parsed_data(prompt, text_format=ResumeModel)
        return data
