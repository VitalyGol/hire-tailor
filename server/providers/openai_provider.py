from core.base_provider import BaseProvider
from core.config import Config
from openai import OpenAI

class OpenAIProvider(BaseProvider):
      def __init__(self):
        self.client = OpenAI(api_key=Config.OPENAI_API_KEY)
        self.model = Config.OPENAI_MODEL

        def get_data(self, prompt):
            response = self.client.responses.create(
                model=self.model,
                max_output_tokens=1800,
                messages=[prompt]
            )
            return response.choices[0].message.content  