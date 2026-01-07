import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import QuestionGenerator from './pages/QuestionGenerator';
import TestManager from './pages/TestManager';
import CandidatePortal from './pages/CandidatePortal';
import CandidateTest from './pages/CandidateTest';
import TestEvaluation from './pages/TestEvaluation'; 
import TestResults from './pages/TestResults';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/generate-questions" element={<QuestionGenerator />} />
            <Route path="/manage-tests" element={<TestManager />} />
            <Route path="/candidate-portal" element={<CandidatePortal />} />
            <Route path="/test/:uniqueLink" element={<CandidateTest />} />
            <Route path="/test-evaluation/:testId" element={<TestEvaluation />} />
            <Route path="/test-results" element={<TestResults />} />
            {/* Add more routes as needed */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;