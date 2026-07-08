from langchain_core.prompts import ChatPromptTemplate

def get_pdf_json_prompt(content: str) -> str:
    """
    Returns a prompt for extracting structured data from a PDF document in JSON format.
    """
    prompt = ChatPromptTemplate.from_messages([
        ("system", """
            # Role and Objective
            Extract structured data from CV content provided in text form and return it as a well-defined JSON object.

            # Instructions
            - Analyze the CV content carefully to identify all relevant data fields typically found in the CV.
            - Extract standard sections such as personal information, education, work experience, skills, certifications, and languages.
            - Tailor section names to match the content and structure of the CV.
            - Prioritize accuracy, clarity, and unambiguous section labeling.
            - If any field is ambiguous, unreadable, or missing, use the placeholder `[unclear]`.

            # Output Format
            - Output only a JSON object.
            - Do not include any additional text, explanation, or formatting.
            - Use clear field names and structured nesting.

            """),
        ("user", f"# CV content: \n\n {content}")
    ])
    return prompt.format(content=content)