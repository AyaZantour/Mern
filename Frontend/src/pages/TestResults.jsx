// ========================================
// Frontend/src/pages/TestResults.jsx
// Complete test results page for viewing candidate answers
// ========================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { candidateTestAPI } from '../services/api';

const TestResults = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [candidateTest, setCandidateTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTestResults();
  }, [testId]);

  const fetchTestResults = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching results for test:', testId);
      
      // Get all candidate tests and find this one
      const response = await candidateTestAPI.getAll();
      
      if (response.data.success) {
        const test = response.data.data.find(ct => ct._id === testId);
        
        if (test) {
          console.log('✅ Test found:', test);
          setCandidateTest(test);
        } else {
          setError('Test non trouvé');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching results:', error);
      setError('Erreur lors du chargement des résultats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  if (error || !candidateTest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600 mb-6">{error || 'Test non trouvé'}</p>
          <button
            onClick={() => navigate('/candidate-portal')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Retour au portail
          </button>
        </div>
      </div>
    );
  }

  const percentage = candidateTest.totalQuestions > 0 
    ? Math.round((candidateTest.score / candidateTest.totalQuestions) * 100)
    : 0;

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-50 border-green-200';
    if (percentage >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/candidate-portal')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ← Retour au portail
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Résultats du Test</h1>
          <p className="text-gray-600">{candidateTest.test?.title || 'Test'}</p>
        </div>

        {/* Candidate Info & Score Card */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Candidate Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations du Candidat</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium text-gray-900">{candidateTest.candidateName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{candidateTest.candidateEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                  candidateTest.status === 'completed' ? 'bg-green-100 text-green-800' :
                  candidateTest.status === 'evaluated' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {candidateTest.status === 'completed' && 'Complété'}
                  {candidateTest.status === 'evaluated' && 'Évalué'}
                  {candidateTest.status === 'sent' && 'Envoyé'}
                  {candidateTest.status === 'in-progress' && 'En cours'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date de soumission</p>
                <p className="font-medium text-gray-900">
                  {candidateTest.completedAt 
                    ? new Date(candidateTest.completedAt).toLocaleString('fr-FR')
                    : 'Non complété'}
                </p>
              </div>
            </div>
          </div>

          {/* Score Card */}
          <div className={`lg:col-span-2 rounded-lg shadow-md p-6 border-2 ${getScoreBgColor(percentage)}`}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Score Final</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-6xl font-bold ${getScoreColor(percentage)}`}>
                  {percentage}%
                </div>
                <p className="text-gray-600 mt-2">
                  {candidateTest.score} / {candidateTest.totalQuestions} questions correctes
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl mb-2">
                  {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {percentage >= 80 && 'Excellent'}
                  {percentage >= 60 && percentage < 80 && 'Bien'}
                  {percentage < 60 && 'À améliorer'}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-500 ${
                    percentage >= 80 ? 'bg-green-600' :
                    percentage >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions & Answers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Détail des Réponses</h2>
          
          <div className="space-y-6">
            {candidateTest.questions && candidateTest.questions.length > 0 ? (
              candidateTest.questions.map((item, index) => {
                const question = item.question;
                if (!question) return null;

                // Parse answer if it's a string
                let userAnswer = item.answer;
                try {
                  if (typeof userAnswer === 'string' && userAnswer.startsWith('[')) {
                    userAnswer = JSON.parse(userAnswer);
                  }
                } catch (e) {
                  // Keep as string if parse fails
                }

                return (
                  <div key={index} className={`border rounded-lg p-6 ${
                    item.isCorrect === true ? 'border-green-200 bg-green-50' :
                    item.isCorrect === false ? 'border-red-200 bg-red-50' :
                    'border-gray-200 bg-gray-50'
                  }`}>
                    {/* Question Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-300 font-semibold text-gray-700">
                          {index + 1}
                        </span>
                        <div>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            question.difficulty === 'facile' ? 'bg-green-100 text-green-800' :
                            question.difficulty === 'moyenne' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {question.difficulty}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            {question.type === 'qcm_radio' && 'QCM (Choix unique)'}
                            {question.type === 'qcm_checkbox' && 'QCM (Choix multiples)'}
                            {question.type === 'code' && 'Question de code'}
                            {question.type === 'libre' && 'Question ouverte'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Result Badge */}
                      {item.isCorrect === true && (
                        <span className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-full flex items-center gap-1">
                          ✓ Correct
                        </span>
                      )}
                      {item.isCorrect === false && (
                        <span className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full flex items-center gap-1">
                          ✗ Incorrect
                        </span>
                      )}
                      {item.isCorrect === null && (
                        <span className="px-3 py-1 bg-gray-400 text-white text-sm font-medium rounded-full">
                          Non évalué
                        </span>
                      )}
                    </div>

                    {/* Question Text */}
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {question.text}
                    </h3>

                    {/* QCM Options */}
                    {(question.type === 'qcm_radio' || question.type === 'qcm_checkbox') && question.options && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => {
                            const isCorrect = question.correctOptions?.includes(option);
                            const isUserAnswer = question.type === 'qcm_checkbox' 
                              ? Array.isArray(userAnswer) && userAnswer.includes(option)
                              : userAnswer === option;
                            
                            return (
                              <div
                                key={optIndex}
                                className={`p-3 rounded border-2 ${
                                  isCorrect && isUserAnswer ? 'border-green-500 bg-green-100' :
                                  isCorrect ? 'border-green-500 bg-green-50' :
                                  isUserAnswer ? 'border-red-500 bg-red-100' :
                                  'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {question.type === 'qcm_checkbox' ? (
                                    <input type="checkbox" checked={isUserAnswer} disabled className="w-4 h-4" />
                                  ) : (
                                    <input type="radio" checked={isUserAnswer} disabled className="w-4 h-4" />
                                  )}
                                  <span className={`flex-1 ${isCorrect ? 'font-medium' : ''}`}>
                                    {option}
                                  </span>
                                  {isCorrect && (
                                    <span className="text-green-600 font-medium text-sm">✓ Correcte</span>
                                  )}
                                  {isUserAnswer && !isCorrect && (
                                    <span className="text-red-600 font-medium text-sm">✗ Votre réponse</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Code/Libre Answer */}
                    {(question.type === 'code' || question.type === 'libre') && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Réponse du candidat:</p>
                        <div className="bg-white p-4 rounded border border-gray-300">
                          {question.type === 'code' ? (
                            <pre className="text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                              {userAnswer || '(Aucune réponse fournie)'}
                            </pre>
                          ) : (
                            <p className="text-gray-800 whitespace-pre-wrap">
                              {userAnswer || '(Aucune réponse fournie)'}
                            </p>
                          )}
                        </div>
                        
                        {/* Expected Answer */}
                        {question.correctOptions && question.correctOptions.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Réponse attendue:</p>
                            <div className="bg-blue-50 p-4 rounded border border-blue-200">
                              <p className="text-blue-900 text-sm whitespace-pre-wrap">
                                {question.correctOptions[0]}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Question Details */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
                      <span>⏱️ {question.time} min</span>
                      <span>📚 {question.category}</span>
                      <span>💼 {question.jobTitle}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucune question dans ce test
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate('/candidate-portal')}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
          >
            Retour au portail
          </button>
          <button
            onClick={() => navigate(`/test-evaluation/${candidateTest.test?._id}`)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Voir tous les candidats pour ce test
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            🖨️ Imprimer les résultats
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResults;