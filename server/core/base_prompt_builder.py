
"""
Base class for prompt builders, defining the interface
for generating prompts for resume creation, information extraction, and consultant advice.
This abstract class serves as a blueprint for specific prompt builders that will implement
the methods to create prompts based on the provided job requirements,
resume content, and user messages.
"""
from typing import List
from abc import ABC, abstractmethod
from models.api.consultant_request import ChatMessage


class BasePromptBuilder(ABC):
    """Base class for prompt builders, defining the interface
    for generating prompts for resume creation, information extraction, and consultant advice.
    This abstract class serves as a blueprint for specific prompt builders that will implement
    the methods to create prompts based on the provided job requirements,
    resume content, and user messages."""

    @abstractmethod
    def get_resume_prompt(self, language: str, job_requirement: str, resume: str):
        """
        Abstract method to generate a prompt for resume creation. 
        It takes the desired language,
        job requirements, and existing resume content as input and
        returns a prompt that can be used
        to generate a new resume tailored to the job requirements.
        :param language: The language in which the resume should be generated.
        :param job_requirement: The job requirements that the resume
        should be tailored to.
        :param resume: The existing resume content that can be used
        as a reference for generating the new resume.
        :return: A prompt string that can be used for resume generation.
        """

    @abstractmethod
    def extract_info_prompt(self, resume: str):
        """Abstract method to generate a prompt for extracting information from a resume.
        It takes the resume content as input and returns a prompt that can be used to extract
        structured information from the resume, such as skills, experience, and education.
        :param resume: The resume content from which information should be extracted.
        :return: A prompt string that can be used for information extraction."""

    @abstractmethod
    def consultatnt_prompt(self, user_message: str, history_chat: List[ChatMessage], job_requirement: str, resume: str):
        """Abstract method to generate a prompt for consulting a career advisor.
        It takes the user's message, job requirements, and resume content as input 
        and returns a prompt
        that can be used to provide advice to the user based on their career goals 
        and the job requirements.
        :param user_message: The message from the user seeking advice.
        :param job_requirement: The job requirements that the advice should be tailored to.
        :param resume: The resume content that can be used as a reference for providing advice.
        :return: A prompt string that can be used for consulting a career advisor."""
