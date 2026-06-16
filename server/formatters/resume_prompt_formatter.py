""""Module responsible for formatting user profiles and
chat history into prompts suitable for AI processing."""
from models.ai.extract_models import UserProfile
from models.api.consultant_request import ChatMessage


class PromptFormatter:
    """Module responsible for formatting user profiles and chat history 
    into prompts suitable for AI processing."""
    @staticmethod
    def prepare_history_chat_for_prompt(history_chat: list[ChatMessage]) -> str:
        """Formats the chat history into a string format suitable for inclusion in prompts.
        Each message in the chat history is formatted as "role: text" and separated by newlines.
        :param history_chat: A list of ChatMessage objects representing the chat history.
        :return: A formatted string representing the chat history, or an empty string 
        if no history is provided.
        """
        lines: list[str] = []
        for msg in history_chat:
            lines.append(f" - role: {msg.role} content:{msg.text}")
        return "\n".join(lines) if history_chat else "no data"

    @staticmethod
    def prepare_resume_for_prompt(profile: UserProfile) -> str:
        """Formats the user profile into a string format suitable for inclusion in prompts.
        :param profile: The UserProfile object containing the user's information.
        :return: A formatted string representing the user's profile.
        """
        lines: list[str] = []

        def format_date_range(start_date: str, end_date: str | None) -> str:
            return f"{start_date} - {end_date or 'Present'}"

        # Work Experience
        lines.append("### Work Experience")

        if profile.workExperience:
            for experience in profile.workExperience:
                lines.append(
                    f"#### {experience.position} | {experience.companyName}"
                )
                lines.append(
                    f"Period: {format_date_range(experience.startDate, experience.endDate)}"
                )

                if experience.projects:
                    lines.append("Projects:")
                    for project in experience.projects:
                        lines.append(
                            f"- {project.projectName}: {project.projectDescription}")
                        if project.skills:
                            lines.append(
                                f"  Skills: {', '.join(project.skills)}")

                lines.append("")
        else:
            lines.append("No work experience provided.")
            lines.append("")

        # Education
        lines.append("### Education")

        if profile.education:
            for education in profile.education:
                lines.append(
                    f"- {education.institution} | {education.specialization} "
                    f"({format_date_range(education.startDate, education.endDate)})"
                )
            lines.append("")
        else:
            lines.append("No education provided.")
            lines.append("")

        # Courses
        lines.append("### Courses and Certificates")

        if profile.courses:
            for course in profile.courses:
                course_line = (
                    f"- {course.title} | {course.organization} "
                    f"({course.issueDate})"
                )

                if course.certificateUrl:
                    course_line += f" | Certificate: {course.certificateUrl}"

                lines.append(course_line)

            lines.append("")
        else:
            lines.append("No courses or certificates provided.")
            lines.append("")

        # Languages
        lines.append("### Languages")

        if profile.languages:
            for user_language in profile.languages:
                lines.append(
                    f"- {user_language.language}: {user_language.level.value}"
                )
        else:
            lines.append("No languages provided.")

        return "\n".join(lines).strip()
