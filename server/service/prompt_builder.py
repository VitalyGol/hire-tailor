class PromptBuilder:
    def get_resume_prompt(self, language: str, job_requirement: str, resume: str):
        prompt = {
            "id": "pmpt_6a0422fe89208194a3a61dc00ecab910066104b9e7dc11a6",
            "version": "9",
            "variables": {
            "resume": resume,
            "job_requirements": job_requirement,
            "language": language
            }
        }
        return prompt
        