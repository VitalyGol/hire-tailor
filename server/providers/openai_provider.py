from core.base_provider import BaseProvider
from core.config import Config
from openai import OpenAI, OpenAIError

class OpenAIProvider(BaseProvider):
      def __init__(self):
        self.client = OpenAI(api_key=Config.OPENAI_API_KEY)
        self.model = Config.OPENAI_MODEL

        def get_data(self, prompt, text_format = 'text'):
            try:
                response = self.client.responses.create(
                    model=self.model,
                    max_output_tokens=1800,
                    messages=[prompt],
                    text_format=text_format
                )
            except OpenAIError as e:
                print(f"Error while getting data from OpenAI: {e}")
                return None
            return response.choices[0].message.content  