from flask import Flask, jsonify, request
from flask_cors import CORS
from pydantic import ValidationError
from core.config import Config
from models.api.resume_request import ResumeRequest
from providers.openai_provider import OpenAIProvider
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

if __name__ == '__main__':
    if Config.FLASK_ENV == "development":
        app.run(debug=True)
    else:
        app.run(debug=False)

