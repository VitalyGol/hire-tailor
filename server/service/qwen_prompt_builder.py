from typing import List
from core.base_prompt_builder import BasePromptBuilder
from formatters.resume_prompt_formatter import PromptFormatter
from models.api.consultant_request import ChatMessage


class QwenPromptBuilder(BasePromptBuilder):
    """Prompt builder that creates chat prompts for the Qwen provider."""

    def consultatnt_prompt(self, user_message: str, history_chat: List[ChatMessage], job_requirement: str, resume: str):
        if len(history_chat) <= 1:
            return [
                    {"role": "system", "content": self._format_system_start_interview()},
                    {"role": "user", "content": (
                        f"""
                            # Candidate resume:

                            {resume}

                            # Job requirements:

                            {job_requirement}

                            Ask the first interview question.
                        """
                    )}
                ]

        assistant_questions = [ item.text for item in history_chat if item.role == "assistant"]
        last_question = assistant_questions[-1]

        history_chat_str = PromptFormatter.prepare_history_chat_for_prompt(history_chat[-6:-1])

        return [
            {"role": "system", "content": self._format_system_prompt()},
            {"role": "user", "content":
             f"""
                Job Requirements

                {job_requirement}

                # Previous Question

                {last_question}

                # Candidate Answer

                {user_message}

                # Recent Interview History

                {history_chat_str}
             """}
        ]

    def get_resume_prompt(self, job_requirement: str, resume: str, language: str):
        return ""

    def extract_info_prompt(self, resume: str, schema: str):
        return [
            {"role": "system", "content":
            """
                Extract structured data from CV/résumé text and return only valid JSON.

                # Instructions
                - Extract only information explicitly present in the CV.
                - Do not invent or infer missing facts.
                - Preserve the logical structure of the CV.
                - Output must match the JSON schema exactly.
                - Do not add extra fields.
                - Return JSON only. No markdown. No explanations.

                # Missing Data Rules
                - For required string fields, use "[unclear]" if the value is missing, ambiguous, or unreadable.
                - For optional nullable fields, use null if the value is missing.
                - For arrays, use [] if no data is found.
                - Dates should be preserved as written in the CV.
                - If the CV says "today", "present", "היום", or similar, use null for endDate.

                # Extraction Rules
                - personalInfo: extract name, email, and phone.
                - professionalTitle: extract the main professional title if present.
                - professionalSummary: extract the summary/profile paragraph.
                - workExperience: group experience by company and position.
                - projects: extract named projects under each work experience.
                - skills: extract technologies mentioned for each project.
                - education: extract formal education only.
                - courses: extract courses and certifications.
                - languages: map language levels to:
                beginner, intermediate, advanced, fluent, native.
            """
            },
            {"role": "user", "content":
             f"""
                # JSON Schema
                {schema}

                # CV Text
                {resume}
            """
        }]

    def _format_system_start_interview(self):
        return """

            # Role

            You are Haim, an HR interviewer.

            # Goal

            Conduct a mock interview for a technology position.

            # Rules

            - Use the candidate's language.
            - Ask exactly one question.
            - Never ask multiple questions.
            - Never repeat previous questions.
            - Keep questions concise.
            - Stay in interviewer role.

            # Output

            Output only the interview question.
            """

    def _format_system_prompt(self):
        return """
            # Role

            You are Haim, an HR Interview Coach for technology positions.

            # Goal

            Help candidates prepare for real HR interviews.

            # Rules

            1. Use the candidate's language.
            2. Evaluate the candidate's answer.
            3. Explain what was good and what can be improved.
            4. Ask EXACTLY ONE follow-up interview question.
            5. Never repeat previous questions.
            6. Keep feedback concise.
            7. Focus on HR topics:
            - experience
            - communication
            - teamwork
            - motivation
            - conflict resolution
            - strengths and weaknesses

            # Output Format

            Return ONLY valid JSON.

            {
                "feedback": "string",
                "next_question": "string"
            }
            # Example Output

            {
                "feedback": "Good example. Add more details about your responsibilities.",
                "next_question": "Tell me about a difficult conflict with a teammate."
            }
            """
