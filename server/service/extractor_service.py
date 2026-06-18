import re
from core.base_prompt_builder import BasePromptBuilder
from core.base_provider import BaseProvider
from models.ai.extract_models import UserProfile


class ExtractorService:
    def __init__(self, provider: BaseProvider, prompt_builder: BasePromptBuilder):
        self.provider = provider
        self.prompt_builder = prompt_builder

    def extract_info(self, resume: str):
        prompt = self.prompt_builder.extract_info_prompt(resume, UserProfile.model_json_schema())
        data = self.provider.get_data(prompt)
        print(f"Output model: {data}")
        data = self._extract_json(data)
        response = UserProfile.model_validate_json(data)

        return response
    
    def _extract_json(self, data: str):
        text = data.strip()
        text = re.sub(r"^```json\s*", "", text)
        text = re.sub(r"^```\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
        return text
