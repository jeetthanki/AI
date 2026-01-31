# AI Resume Analyzer

A full-stack web application that uses AI to analyze resumes and provide detailed feedback, scores, and recommendations.

## Features

- 🔐 User authentication (Register & Login)
- 📄 Upload PDF or Word document resumes
- 🤖 AI-powered resume analysis using OpenAI
- 📊 Overall score and detailed feedback
- 💪 Identifies strengths and areas for improvement
- 🛠️ Skills extraction
- 💡 Actionable recommendations
- 💾 MongoDB storage for all user data and analysis history
- 🔒 Secure JWT-based authentication
- 👤 User-specific resume storage

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **AI**: OpenAI GPT-3.5-turbo (with fallback mock analysis)

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- OpenAI API key (optional - app works with mock analysis if not provided)

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resume-analyzer
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_jwt_secret_key_here
```

**Note:** Change `JWT_SECRET` to a strong random string in production!

4. Start MongoDB (if running locally):
```bash
# Make sure MongoDB is running on your system
```

5. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Usage

1. Make sure both backend and frontend servers are running
2. Open your browser and navigate to `http://localhost:3000`
3. **Register** a new account or **Login** with existing credentials
4. Once logged in, upload a PDF or Word document resume
5. Click "Analyze Resume" to get AI-powered feedback
6. View detailed analysis including scores, strengths, improvements, and recommendations
7. All your resumes and analyses are stored securely in the database

## Project Structure

```
.
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ResumeUpload.jsx
│   │   │   ├── AnalysisResults.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Resume.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── resumeRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── services/
│   │   ├── resumeParser.js
│   │   └── aiAnalyzer.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Resume Analysis (Protected - requires authentication)
- `POST /api/resume/analyze` - Upload and analyze a resume (requires token)
- `GET /api/resume/history` - Get user's analysis history (requires token)
- `GET /api/resume/:id` - Get specific resume analysis (requires token)

### Health Check
- `GET /api/health` - Health check endpoint

## Notes

- **Authentication is required** - Users must register/login before accessing the resume analyzer
- All user data and resumes are stored securely in MongoDB
- Each user can only access their own resumes and analyses
- The app works without an OpenAI API key using a mock analysis system
- For best results, provide an OpenAI API key in the `.env` file
- File uploads are limited to 10MB
- Supported file formats: PDF, DOC, DOCX
- Passwords are hashed using bcrypt before storage
- JWT tokens are used for secure authentication

## License

MIT

