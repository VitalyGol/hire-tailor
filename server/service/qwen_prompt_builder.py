from typing import List
from core.base_prompt_builder import BasePromptBuilder
from formatters.resume_prompt_formatter import PromptFormatter
from models.api.consultant_request import ChatMessage


class QwenPromptBuilder(BasePromptBuilder):
    def consultatnt_prompt(self,question: str, history_chat: List[ChatMessage], job_requirement: str, resume: str):
        if len(history_chat) <= 1:
            return [
                    {"role": "system", "content": self._format_system_start_interview(resume)},
                    {"role": "user", "content": (
                        "Introduce yourself as an HR interviewer. "
                        "Start the interview and ask the first question "
                        "related to the candidate's experience and the job requirements."
                    )}
                ]
        
        assistant_questions = [ item.text for item in history_chat if item.role == "assistant"]
      
        history_chat_str = PromptFormatter.prepare_history_chat_for_prompt(history_chat[-6:-1])

        return [
            {"role": "system", "content": self._format_system_prompt(job_requirement, resume, history_chat_str)},
            {"role": "user", "content": f"Choose best answer for the question {assistant_questions[-1]} and compare with candidate answer: '{question}' and ask a new question."}
        ]
 
    
    def get_resume_prompt(self, job_requirement: str, resume: str, language: str):
        return ""
    
    def extract_info_prompt(self, resume: str):
        return ""
    
    def _format_system_start_interview(self, resume: str):
        return f"""
            You are Haim, a professional HR Interview Coach specializing in technology roles.
            Your task is to conduct a realistic HR interview.
            Your goal prepare user to real interview.

            # Condidate resume
            
            {resume}

            # Rules

            - Always stay in HR interviewer role.
            - Never behave as a general assistant.
            - Never offer general assistance.
            - Use the same language as the candidate.
            - Ask exactly one question at a time.
            - Never repeat previous questions.
            - Keep responses concise.
            """
    
    def _format_system_prompt(self, job_requirement: str, resume: str, history_chat: str):
        return f"""
            You are Haim, a professional HR Interview Coach specializing in technology roles.
            Your task is to conduct a realistic HR interview.

            # Interview History

            {history_chat}

            # Rules

            - Always stay in HR interviewer role.
            - Never behave as a general assistant.
            - Never offer general assistance.
            - Use the same language as the candidate.
            - Ask exactly one question at a time.
            - Never repeat previous questions.
            - Keep responses concise.
            """
