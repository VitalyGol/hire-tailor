"""
This module defines the Flask application and its API endpoints 
for handling consultant advice requests, resume generation, and 
information extraction from resume PDFs. It includes error handling
for various scenarios such as validation errors, missing files, 
unsupported file types, and unexpected server errors. 
The application uses CORS to allow cross-origin requests and relies on services like 
OpenAIProvider, 
PromptBuilder, ResumeGenerator, and ConsultantService to process the incoming 
requests and generate appropriate responses.
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from pydantic import ValidationError
from core.config import Config
from providers.openai_provider import OpenAIProvider
from providers.qwen_provider import QwenProvider
from models.api.consultant_request import ConsultantRequest
from models.api.resume_request import ResumeRequest
from service.qwen_prompt_builder import QwenPromptBuilder
from service.pdf import extract_text_from_pdf
from service.prompt_builder import PromptBuilder
from service.resume_generator import ResumeGenerator
from service.consultant import ConsultantService


app = Flask(__name__)
CORS(app)

@app.route('/consultant/ask', methods=['POST'])
def ask_consultant():
    """
    API endpoint to ask a consultant for advice based on job requirements, resume, and chat history.
    It validates the incoming request data, processes it using the ConsultantService,
    and returns the consultant's response in JSON format.
    If the request data fails validation, it responds with appropriate error 
    messages and status codes.
    """
    try:
        consultant_request = ConsultantRequest(**request.get_json())
        response = ConsultantService(provider=QwenProvider(),
                                     prompt_builder=QwenPromptBuilder()).ask_consultant(
            job_requirement=consultant_request.job_requirement,
            resume=consultant_request.resume,
            history_chat=consultant_request.chat_history
        )
        return jsonify(response.model_dump()), 200
    except ValidationError as e:
        return jsonify(e.errors()), 400

@app.route('/resume/generate', methods=['POST'])
def generate_resume():
    """"
    API endpoint to generate a resume based on the provided job requirements and existing resume.
    It validates the incoming request data, processes it using the ResumeGenerator service, 
    and returns the generated resume in JSON format. 
    If the request data fails validation, it responds with appropriate error messages and status 
    codes.
    """
    try:
        resume_request = ResumeRequest(**request.get_json())
        response = ResumeGenerator(provider=OpenAIProvider(),
                                prompt_builder=PromptBuilder()).generate_resume(
            language=resume_request.language,
            job_requirement=resume_request.job_requirement,
            resume=resume_request.resume
        )
        return jsonify(response.model_dump()), 200
    except ValidationError as e:
        return jsonify(e.errors()), 400


@app.route('/resume/extract', methods=['POST'])
def extract_info():
    """
    API endpoint to extract information from a resume PDF file. It validates the uploaded file, 
    extracts text from it, and then uses the ResumeGenerator service to process the extracted
    text and return structured information. 
    The endpoint handles various error cases, such as missing files, 
    unsupported file types, empty files, and validation errors,
    providing appropriate responses for each scenario.
    """
    try:
        if 'file' not in request.files:
            raise ValidationError([{
                "loc": ["file"],
                "msg": "File is required",
                "type": "value_error.missing"
            }])
        file = request.files['file']

        if not file.filename:
            raise ValidationError([{
                "loc": ["file", "filename"],
                "msg": "File name is required",
                "type": "value_error.missing"
            }])

        if '.' not in file.filename:
            raise ValidationError([{
                "loc": ["file", "filename"],
                "msg": "File must have an extension",
                "type": "value_error"
            }])

        extension = file.filename.rsplit('.', 1)[1].lower()

        if extension not in Config.ALLOWED_EXTENSIONS:
            raise ValidationError([{
                "loc": ["file", "extension"],
                "msg": "Unsupported file type",
                "type": "value_error"
            }])

        pdf_bytes = file.read()

        if not pdf_bytes:
            raise ValidationError([{
                "loc": ["file", "content"],
                "msg": "Uploaded file is empty",
                "type": "value_error"
            }])

        resume_text = extract_text_from_pdf(pdf_bytes)

        if not resume_text.strip():
            raise ValidationError([{
                "loc": ["file", "content"],
                "msg": "Could not extract text from PDF",
                "type": "value_error"
            }])

        generator = ResumeGenerator(
            provider=OpenAIProvider(),
            prompt_builder=PromptBuilder()
        )

        response = generator.extract_info(resume_text)

        return jsonify(response.model_dump(mode="json")), 200

    except ValidationError as e:
        return jsonify({"error": "Validation failed", "details": e.errors()}), 400


if __name__ == '__main__':
    if Config.FLASK_ENV == "development":
        app.run(debug=True)
    else:
        app.run(debug=False)
