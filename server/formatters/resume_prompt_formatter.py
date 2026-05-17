from models.ai.extract_models import UserProfile


def prepare_resume_for_prompt(profile: UserProfile) -> str:
    lines: list[str] = []

    def format_date_range(start_date: str, end_date: str | None) -> str:
        return f"{start_date} - {end_date or 'Present'}"

    # Work Experience
    lines.append("# Work Experience")

    if profile.workExperience:
        for experience in profile.workExperience:
            lines.append(
                f"## {experience.position} | {experience.companyName}"
            )
            lines.append(
                f"Period: {format_date_range(experience.startDate, experience.endDate)}"
            )

            if experience.projects:
                lines.append("Projects:")
                for project in experience.projects:
                    lines.append(f"- {project.projectName}: {project.projectDescription}")

            lines.append("")
    else:
        lines.append("No work experience provided.")
        lines.append("")

    # Education
    lines.append("# Education")

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
    lines.append("# Courses and Certificates")

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
    lines.append("# Languages")

    if profile.languages:
        for user_language in profile.languages:
            lines.append(
                f"- {user_language.language}: {user_language.level.value}"
            )
    else:
        lines.append("No languages provided.")

    return "\n".join(lines).strip()