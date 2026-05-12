
from core.base_provider import BaseProvider

class ResumeGenerator:
    def __init__(self, provider: BaseProvider):
        self.provider = provider

    def generate_resume(self):
        data = self.provider.get_data()
        # Process the data and generate a resume
        resume = f"Name: {data['name']}\nExperience: {data['experience']}\nSkills: {', '.join(data['skills'])}"
        return resume