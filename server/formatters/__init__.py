"""Formatters module for the server application.
This module contains classes and functions responsible for formatting 
data and preparing it for processing by AI models. The formatters take 
raw data, such as user profiles and chat history,
and convert it into structured formats that can be used to generate prompts for AI processing.
The formatters are designed to be modular and reusable, allowing for easy integration
with different AI models and providers. They play a crucial role in ensuring that the data
is presented in a way that maximizes the effectiveness of the AI models and improves the
quality of the generated responses and resumes. 
"""
from .resume_prompt_formatter import PromptFormatter
