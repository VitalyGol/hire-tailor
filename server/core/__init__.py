"""Core module for the server application.
This module contains the core components and functionalities that are essential
for the operation of the server application. It includes classes and functions
that provide foundational services, such as configuration management, base provider
interfaces, and base prompt builder interfaces. These components serve as the building
blocks for more specific functionalities implemented in other parts of the application,
such as resume generation and information extraction. The core module is designed
to be modular and extensible, allowing for easy integration of additional
features and services as needed."""
from .config import Config
from .base_provider import BaseProvider
from .base_prompt_builder import BasePromptBuilder
