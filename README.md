# MERN Question Generator

An AI-powered platform for generating technical interview questions and creating tests for candidates.

## 🚀 Features

- **AI-Powered Question Generation**: Uses Gemini AI to create technical questions
- **Multiple Question Types**: QCM, coding questions, open-ended questions
- **Difficulty Levels**: Easy, medium, and hard questions
- **Test Creation**: Compile selected questions into tests
- **Candidate Portal**: Send tests to candidates with unique links

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **AI**: Google Gemini API

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Google Gemini API key

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Add your credentials
npm run dev