from flask import Flask, jsonify, redirect, request
from flask_cors import CORS
from pydantic import ValidationError
from core.config import Config
from models.api.resume_request import ResumeRequest
from providers.openai_provider import OpenAIProvider
from service.pdf import extract_text_from_pdf
from service.prompt_builder import PromptBuilder
from service.resume_generator import ResumeGenerator


app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/resume/generate', methods=['POST'])
def generate_resume():
    try:
        resume_request = ResumeRequest(**request.get_json())
        response = ResumeGenerator(provider=OpenAIProvider(), prompt_builder=PromptBuilder()).generate_resume(
            language=resume_request.language,
            job_requirement=resume_request.job_requirement,
            resume=resume_request.resume
        )
        return jsonify(response.model_dump()), 200
    except ValidationError as e:
        return jsonify(e.errors()), 400


@app.route('/resume/extract', methods=['POST'])
def extract_info():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "File is required"}), 400

        file = request.files['file']

        if not file.filename:
            return jsonify({"error": "File name is required"}), 400

        if '.' not in file.filename:
            return jsonify({"error": "Unsupported file type"}), 400

        extension = file.filename.rsplit('.', 1)[1].lower()

        if extension not in Config.ALLOWED_EXTENSIONS:
            return jsonify({"error": "Unsupported file type"}), 400

        pdf_bytes = file.read()

        if not pdf_bytes:
            return jsonify({"error": "Uploaded file is empty"}), 400

        resume_text = extract_text_from_pdf(pdf_bytes)

        if not resume_text.strip():
            return jsonify({"error": "Could not extract text from PDF"}), 400

        generator = ResumeGenerator(
            provider=OpenAIProvider(),
            prompt_builder=PromptBuilder()
        )

        response = generator.extract_info(resume_text)

        return jsonify(response.model_dump(mode="json")), 200

    except ValidationError as e:
        return jsonify({"error": "Validation failed", "details": e.errors()}), 400

    except Exception:
        return jsonify({"error": "Unexpected server error"}), 500

if __name__ == '__main__':
    if Config.FLASK_ENV == "development":
        app.run(debug=True)
    else:
        app.run(debug=False)

