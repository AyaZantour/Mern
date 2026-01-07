import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            AI Recruiter
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Generate intelligent technical interview questions powered by AI
          </p>
          <Link
            to="/generate-questions"
            className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <span className="mr-2"></span>
            Start Generating Questions
          </Link>
        </div>

    
      </div>
    </div>
  );
};

export default Home;