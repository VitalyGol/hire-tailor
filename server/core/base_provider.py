"""Base class for providers, defining the interface for interacting with different AI providers.
This abstract class serves as a blueprint for specific provider implementations that will
implement the methods to generate prompts and retrieve data based on those prompts."""
from abc import ABC, abstractmethod


class BaseProvider(ABC):
    """Base class for providers, defining the interface for interacting with different AI providers.
    This abstract class serves as a blueprint for specific provider implementations that will
    implement the methods to generate prompts and retrieve data based on those prompts."""

    @abstractmethod
    def get_data(self, prompt):
        """Abstract method to retrieve data from the provider based on a given prompt.
        :param prompt: The prompt for which to retrieve data.
        :return: The data retrieved from the provider.
        """

    @abstractmethod
    def get_parsed_data(self, prompt, text_format='text'):
        """Abstract method to retrieve parsed data from the provider based on a given prompt.
        :param prompt: The prompt for which to retrieve parsed data.
        :param text_format: The format in which to return the data.
        :return: The parsed data retrieved from the provider.
        """
