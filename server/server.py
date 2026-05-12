from flask import Flask
from flask_cors import CORS
from core.config import Config


app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    return 'Hello, World!'

if __name__ == '__main__':
    if Config.FLASK_ENV == "development":
        app.run(debug=True)
    else:
        app.run(debug=False)

