"""Configuration class to manage application settings and environment variables."""
import os
from dotenv import load_dotenv

load_dotenv()

class Config: # pylint: disable=too-few-public-methods
    """Configuration class to manage application settings and environment variables.
    This class loads environment variables from a .env file and provides access to
    configuration settings such as API keys, model names, and allowed file extensions.
    Attributes:
        OPENAI_API_KEY (str): The API key for accessing the OpenAI service.
        OPENAI_MODEL (str): The name of the OpenAI model to use for generating responses.
        FLASK_ENV (str): The environment in which the Flask application is running 
        (e.g., development, production).
        ALLOWED_EXTENSIONS (list): A list of allowed file extensions for resume uploads.
        HR_CHATBOT_MODEL (str): The name of the model used for the HR chatbot functionality.
    """
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    ALLOWED_EXTENSIONS = os.getenv("ALLOWED_EXTENSIONS", "pdf").split(',')
    HR_CHATBOT_MODEL = os.getenv("HR_CHATBOT_MODEL", "Qwen/Qwen2.5-0.5B-Instruct")
