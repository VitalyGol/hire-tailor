from core.base_prompt_builder import BasePromptBuilder


class PromptBuilder(BasePromptBuilder):
    def get_resume_prompt(self, language: str, job_requirement: str, resume: str):
        prompt = {
            "id": "pmpt_6a0422fe89208194a3a61dc00ecab910066104b9e7dc11a6",
            "version": "13",
            "variables": {
            "resume": resume,
            "job_requirements": job_requirement,
            "language": language
            }
        }
        return prompt
        
    def extract_info_prompt(self, resume: str):
        prompt =  {
            "id": "pmpt_6a0575331ae88197a60f5cfd70c72fab0e0c4e855c31cb5b",
            "version": "2",
            "variables": {
            "resume": resume
            }
        }
        return prompt
    
    def consultatnt_prompt(self,question: str, history_chat: str, job_requirement: str, resume: str):
        prompt = {
            "id": "pmpt_6a06c8ba8128819592587478a484f8780511c3be90afb08b",
            "version": "5",
            "variables": {
            "job_requirements": job_requirement,
            "resume": resume,
            "history_chat": history_chat,
            "question": question
            }
        }
        return prompt