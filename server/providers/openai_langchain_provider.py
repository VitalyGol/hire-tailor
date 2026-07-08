from core.base_provider import BaseProvider
from core.config import Config
from langchain_openai import ChatOpenAI

class OpenAILangChainProvider(BaseProvider):
    def __init__(self):
        self.client = ChatOpenAI(
            model_name=Config.OPENAI_MODEL, api_key=Config.OPENAI_API_KEY)
    
    def get_data(self, prompt):
        try:
            response = self.client.invoke(prompt)
            return response.output_text
        except Exception as e:
            print(f"Error while getting data from OpenAI: {e}")
            return None
    
    def get_parsed_data(self, prompt, text_format='text'):
        try:
            structured_client = self.client.with_structured_output(text_format, include_raw=False)
            response = structured_client.invoke(prompt)
            return response
        except Exception as e:
            print(f"Error while getting parsed data from OpenAI: {e}")
            return None