"""OpenAIProvider class to interact with the OpenAI API for generating responses based on prompts.
This class implements the BaseProvider interface and provides methods to retrieve data and 
parsed data from the OpenAI API. It uses the OpenAI client to send requests and handle responses,
including error handling for any issues that may arise during the API interaction."""
from core.base_provider import BaseProvider
from core.config import Config
from openai import OpenAI, OpenAIError


class OpenAIProvider(BaseProvider):
    """
    OpenAIProvider class to interact with the OpenAI API for generating responses based on prompts.
    This class implements the BaseProvider interface and provides methods to retrieve data and 
    parsed data from the OpenAI API. It uses the OpenAI client to send requests and handle 
    responses, including error handling for any issues that may arise during the API interaction.
    """

    def __init__(self):
        self.client = OpenAI(api_key=Config.OPENAI_API_KEY)
        self.model = Config.OPENAI_MODEL

    def get_data(self, prompt):
        """
        Method to retrieve data from the OpenAI API based on a given prompt.
        It sends a request to the OpenAI API with the specified model and prompt, and returns
        the output text from the response. If an error occurs during the API interaction, it
        catches the exception, logs the error message, and returns None.
        :param prompt: The prompt for which to retrieve data.
        :return: The data retrieved from the OpenAI API, or None if an error occurs
        """
        try:
            response = self.client.responses.create(
                model=self.model,
                max_output_tokens=1800,
                prompt=prompt,
            )
            return response.output_text
        except OpenAIError as e:
            print(f"Error while getting data from OpenAI: {e}")
            return None

    def get_parsed_data(self, prompt, text_format='text'):
        """Method to retrieve parsed data from the OpenAI API based on a given prompt.
        It sends a request to the OpenAI API with the specified model and prompt,
        and returns the parsed output
        from the response in the specified text format. If an error occurs during the API 
        interaction, it catches the exception, logs the error message, and returns None.
        :param prompt: The prompt for which to retrieve parsed data.
        :param text_format: The format in which to return the data.
        :return: The parsed data retrieved from the OpenAI API, or None if an error occurs
        """
        try:
            response = self.client.responses.parse(
                model=self.model,
                max_output_tokens=1800,
                prompt=prompt,
                text_format=text_format
            )
            return response.output_parsed
        except OpenAIError as e:
            print(f"Error while getting data from OpenAI: {e}")
            return None
