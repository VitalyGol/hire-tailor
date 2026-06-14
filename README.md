# HireTailor

## 📋 Project Overview

**HireTailor** is an AI-powered resume tailoring platform designed to help job seekers adapt their resumes to specific job descriptions. Using advanced AI technology and OpenAI's language models, HireTailor generates ATS-friendly, tailored resumes that increase your chances of getting noticed by recruiters.

The platform combines a modern Angular frontend with a Flask-based backend.

---

## ✨ Features

### Core Functionality
- **Resume Upload & Parsing**: Upload PDF resumes and automatically extract structured profile information
- **AI-Powered Resume Generation**: Generate tailored resumes based on job descriptions using OpenAI's GPT models
- **Interactive AI Consultant**: Chat with an AI consultant to get personalized advice on how to tailor your resume for specific roles
- **Tailoring History**: Save and manage multiple resume tailoring sessions
- **Multi-Language Support**: Generate resumes in different languages
- **ATS Optimization**: Ensure generated resumes pass Applicant Tracking System filters

### Application Pages
- **New Tailoring**: Create a new resume tailoring session by uploading your resume and providing a job description
- **Tailoring Details**: View and manage details of a specific tailoring session
- **Generated Resume**: Preview and download your AI-tailored resume
- **AI Consultant Chat**: Get real-time advice from an AI consultant about your resume and the target role
- **History**: Browse all your previous tailoring sessions
- **User Profile**: Manage your profile information
- **Resume Templates**: (Planned) Browse and use resume templates

---

## 🖥️ Server

### API Overview

The HireTailor server provides three main REST API endpoints:

#### 1. **POST `/consultant/ask`**
Ask the AI consultant for advice on how to tailor your resume for a specific job.

**Request Body:**
```json
{
  "resume": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "summary": "string",
    "experience": [...],
    "education": [...],
    "skills": [...]
  },
  "job_requirement": "string (job description)",
  "chat_history": [
    {
      "role": "user|assistant",
      "text": "string",
      "createdAt": "ISO8601 timestamp"
    }
  ]
}
```

**Response:**
```json
{
  "id": "string",
  "text": "string (consultant advice)",
  "createdAt": "ISO8601 timestamp"
}
```

#### 2. **POST `/resume/generate`**
Generate an AI-tailored resume based on a job description.

**Request Body:**
```json
{
  "resume": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "summary": "string",
    "experience": [...],
    "education": [...],
    "skills": [...]
  },
  "job_requirement": "string (job description)",
  "language": "string (e.g., 'en', 'es', 'fr')"
}
```

**Response:**
```json
{
  "id": "string",
  "generated_resume": "string (markdown formatted resume)",
  "createdAt": "ISO8601 timestamp"
}
```

#### 3. **POST `/resume/extract`**
Extract structured information from a resume PDF file.

**Request:**
- Multipart form-data with file upload
- File field: `file` (PDF format)

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "summary": "string",
  "experience": [...],
  "education": [...],
  "skills": [...]
}
```

### How to Run the Server

#### Prerequisites
- Python 3.11+
- OpenAI API key

#### Local Development Setup

1. **Create and activate virtual environment:**
   ```bash
   cd server
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

4. **Run the server:**
   ```bash
   python server.py
   ```

The server will be available at `http://localhost:5000`

### Server Project Structure

```
server/
├── server.py                 # Flask application and API route definitions
├── requirements.txt          # Python dependencies
├── Dockerfile               # Docker image configuration
├── docker-compose.yml       # Multi-container orchestration
├── core/
│   ├── base_prompt_builder.py    # Abstract base for prompt building
│   ├── base_provider.py          # Abstract base for AI providers
│   └── config.py                 # Configuration management
├── formatters/
│   └── resume_prompt_formatter.py # Resume-specific prompt formatting
├── models/
│   ├── ai/
│   │   ├── extract_models.py     # Models for extracting resume data
│   │   └── resume_model.py       # Resume data models
│   └── api/
│       ├── consultant_request.py # Request model for consultant endpoint
│       ├── consultant_response.py# Response model for consultant endpoint
│       └── resume_request.py     # Request model for resume generation
├── providers/
│   └── openai_provider.py        # OpenAI API integration
└── service/
    ├── consultant.py       # AI consultant service logic
    ├── pdf.py             # PDF parsing and text extraction
    ├── prompt_builder.py  # Prompt construction for AI requests
    └── resume_generator.py # Resume generation service logic
```

**Key Components:**
- **Server**: Flask application handling HTTP requests and CORS
- **Core**: Base classes for extensibility (easily add new providers)
- **Providers**: OpenAI integration for LLM capabilities
- **Services**: Business logic for consultancy, resume generation, and PDF parsing
- **Models**: Pydantic models for request validation and data structure

---

## 🎨 Client

### Project Overview

The HireTailor client is a modern single-page application built with **Angular 21** and **Material Design**. It provides an intuitive interface for users to upload resumes, generate tailored versions, and interact with an AI consultant.

**Technology Stack:**
- **Framework**: Angular 21 with standalone components
- **Styling**: SCSS with Angular Material Design
- **State Management**: RxJS for reactive data flow
- **API Communication**: Angular HttpClient with interceptors
- **Markdown Support**: ngx-markdown for rendering AI-generated content
- **UI Components**: Angular Material for consistent design

### Features
- Responsive design optimized for desktop and tablet
- Real-time spinner/loading indicators during API calls
- Session management and local storage for tailoring history
- Markdown rendering for AI consultant responses
- Form validation and error handling

### How to Run the Client

#### Prerequisites
- Node.js 18+ and npm 11+

#### Local Development Setup

1. **Install dependencies:**
   ```bash
   cd web/hire-tailor
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

The application will open automatically at `http://localhost:4200`

#### Build for Production

```bash
npm run build
```

Output will be in `dist/hire-tailor/`

#### Other Useful Commands

```bash
# Run linter
npm run lint

# Format code with Prettier
npm run format

# Run unit tests
npm run test

# Watch mode for development
npm run watch
```

### Client Project Structure

```
web/hire-tailor/
├── angular.json              # Angular CLI configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── eslint.config.js          # ESLint configuration
├── src/
│   ├── index.html            # Main HTML entry point
│   ├── main.ts               # Bootstrap entry point
│   ├── styles.scss           # Global styles
│   ├── environments/         # Environment-specific configurations
│   │   ├── environment.ts    # Development environment
│   │   └── environment.prod.ts # Production environment
│   └── app/
│       ├── app.ts            # Root component
│       ├── app.html          # Root template
│       ├── app.routes.ts     # Route definitions
│       ├── app.config.ts     # App configuration
│       ├── app.scss          # Root styles
│       ├── features/         # Feature modules (lazy-loaded)
│       │   ├── ai-consultant/
│       │   │   ├── ai-consultant.component.ts
│       │   │   ├── ai-consultant.component.html
│       │   │   └── ai-consultant.component.scss
│       │   ├── new-tailoring/
│       │   │   ├── new-tailoring.component.ts
│       │   │   ├── new-tailoring.component.html
│       │   │   └── new-tailoring.component.scss
│       │   ├── tailoring-resume/
│       │   │   ├── tailoring-resume.component.ts
│       │   │   ├── tailoring-resume.component.html
│       │   │   └── tailoring-resume.component.scss
│       │   ├── tailoring-details/
│       │   │   ├── tailoring-details.component.ts
│       │   │   ├── tailoring-details.component.html
│       │   │   └── tailoring-details.component.scss
│       │   ├── history/
│       │   │   ├── history.component.ts
│       │   │   ├── history.component.html
│       │   │   └── history.component.scss
│       │   ├── user-profile/
│       │   │   ├── user-profile.component.ts
│       │   │   ├── user-profile.component.html
│       │   │   └── user-profile.component.scss
│       │   └── resume-template/
│       │       ├── resume-template.component.ts
│       │       ├── resume-template.component.html
│       │       └── resume-template.component.scss
│       ├── layout/
│       │   └── app-layout/
│       │       ├── app-layout.component.ts
│       │       ├── app-layout.component.html
│       │       └── app-layout.component.scss
│       ├── pages/
│       │   └── placeholder-page/
│       │       ├── placeholder-page.component.ts
│       │       ├── placeholder-page.component.html
│       │       └── placeholder-page.component.scss
│       ├── services/        # Shared services
│       │   ├── consultant-ai-service.ts    # API calls to consultant endpoint
│       │   ├── upload.service.ts           # File upload handling
│       │   ├── storage.service.ts          # Local storage management
│       │   ├── tailoring-storage.service.ts# Tailoring session storage
│       │   ├── spinner.service.ts          # Loading state management
│       │   └── page-communication.service.ts # Inter-component communication
│       ├── interceptors/    # HTTP interceptors
│       │   └── spinner.interceptor.ts      # Show spinner during HTTP requests
│       └── models/          # Data models organized by feature
│           ├── shared/
│           ├── consultant-ai/
│           ├── new-tailoring/
│           ├── tailoring-resume/
│           ├── resume-template/
│           └── user-profile/
└── public/                   # Static assets
```

**Key Architecture Patterns:**
- **Standalone Components**: Modern Angular approach with lazy-loaded features
- **Services**: Centralized business logic and state management
- **Interceptors**: Global HTTP handling (loading spinners, error handling)
- **Reactive Forms**: Form validation and management
- **RxJS**: Observable patterns for async operations
- **Material Design**: Consistent, accessible UI components

---

## 📦 Technologies Used

### Backend
- **Flask**: Python web framework
- **OpenAI API**: GPT-based language models
- **PyPDF**: PDF parsing and text extraction
- **Pydantic**: Data validation and serialization
- **Flask-CORS**: Cross-Origin Resource Sharing support

### Frontend
- **Angular 21**: Modern web framework
- **Angular Material**: UI component library
- **TypeScript**: Typed JavaScript
- **RxJS**: Reactive programming library
- **SCSS**: CSS preprocessor
- **ngx-markdown**: Markdown rendering

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration

---

## 📝 License

[Add your license information here]

---

## 👥 Contributing

[Add contribution guidelines here]

---

## 📧 Contact

[Add contact information here]
