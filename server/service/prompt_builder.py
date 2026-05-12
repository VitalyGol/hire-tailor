class PromptBuilder:
    def get_resume_prompt(self, language: str, job_requirement: str, resume: str):
        prompt = f"Generate a resume in {language} based on the following job requirement: {job_requirement} and the existing resume: {resume}"
        return prompt