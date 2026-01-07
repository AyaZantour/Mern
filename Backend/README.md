# AI-Powered IT Recruiter Question Generator - Backend API

## Installation
1. Clone the repository
2. Run `npm install`
3. Create `.env` file with required variables
4. Run `npm run dev`

## API Endpoints

### Questions
- `POST /api/questions/generate` - Generate questions
- `POST /api/questions/refresh` - Refresh single question
- `GET /api/questions` - Get all questions

### Tests
- `POST /api/tests` - Create test
- `GET /api/tests` - Get all tests
- `GET /api/tests/:id` - Get single test
- `PUT /api/tests/:id` - Update test
- `DELETE /api/tests/:id` - Delete test

### Candidate Tests
- `POST /api/candidate-tests` - Create candidate test
- `GET /api/candidate-tests` - Get all candidate tests
- `GET /api/candidate-tests/link/:uniqueLink` - Get test by link
- `PUT /api/candidate-tests/:id/submit` - Submit test answers

### Send Test
- `POST /api/send-test` - Send test to candidate via email

## Environment Variables
- `MONGO_URI` - MongoDB connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `EMAIL_USER` - Email for sending tests
- `EMAIL_PASS` - Email app password
- `PORT` - Server port (default: 5000)