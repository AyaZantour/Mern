import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { candidateTestAPI, testAPI } from '../services/api';

const TestEvaluation = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [candidateTests, setCandidateTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    fetchTestAndCandidates();
  }, [testId]);

  const fetchTestAndCandidates = async () => {
    try {
      setLoading(true);
      // Fetch test details
      const testResponse = await testAPI.getById(testId);
      if (testResponse.data.success) {
        setTest(testResponse.data.data);
      }

      // Fetch all candidate tests for this test
      const candidatesResponse = await candidateTestAPI.getAll();
      if (candidatesResponse.data.success) {
        // Filter for this specific test
        const filtered = candidatesResponse.data.data.filter(
          ct => ct.test && ct.test._id === testId
        );
        setCandidateTests(filtered);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateCandidate = (candidateTest) => {
    setSelectedCandidate(candidateTest);
  };

  const handleScoreQuestion = async (questionIndex, isCorrect) => {
    if (!selectedCandidate) return;

    // Create updated questions array
    const updatedQuestions = [...selectedCandidate.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      isCorrect: isCorrect,
      evaluatedByHuman: true,
      evaluatorComment: ''
    };

    // Update local state
    setSelectedCandidate({
      ...selectedCandidate,
      questions: updatedQuestions
    });
  };

  const saveEvaluation = async () => {
    if (!selectedCandidate) return;

    try {
      setEvaluating(true);
      
      // Calculate score based on evaluations
      const score = selectedCandidate.questions.reduce((total, q) => {
        return total + (q.isCorrect ? 1 : 0);
      }, 0);

      console.log('📤 Sending evaluation data:', {
      candidateTestId: selectedCandidate._id,
      score,
      questionCount: selectedCandidate.questions.length
    });

      // Send evaluation to backend
      const response = await candidateTestAPI.evaluate(selectedCandidate._id, {
        questions: selectedCandidate.questions,
        score: score,
        evaluatedBy: 'recruiter', // or get current user
        evaluationDate: new Date()
      });

      if (response.data.success) {
        alert('Évaluation sauvegardée!');
        // Refresh data
        fetchTestAndCandidates();
        setSelectedCandidate(null);
      }
    } catch (error) {
      console.error('Error saving evaluation:', error);
      console.error('Error details:', error.response?.data);

      alert('Erreur lors de la sauvegarde');
    } finally {
      setEvaluating(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'sent': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'expired': 'bg-red-100 text-red-800',
      'evaluated': 'bg-purple-100 text-purple-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/manage-tests')}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Retour aux tests
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Évaluation des Candidats - {test?.title}
          </h1>
          <p className="text-gray-600">
            {candidateTests.length} candidat(s) ont passé ce test
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Candidates List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Liste des Candidats</h2>
            
            {candidateTests.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun candidat</h3>
                <p className="text-gray-600">Aucun candidat n'a encore passé ce test</p>
              </div>
            ) : (
              <div className="space-y-4">
                {candidateTests.map((ct) => (
                  <div
                    key={ct._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedCandidate?._id === ct._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleEvaluateCandidate(ct)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{ct.candidateName}</h3>
                        <p className="text-sm text-gray-500">{ct.candidateEmail}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(ct.status)}`}>
                          {ct.status === 'completed' && !ct.evaluatedByHuman ? 'À évaluer' :
                           ct.status === 'completed' && ct.evaluatedByHuman ? 'Évalué' : ct.status}
                        </span>
                        {ct.score !== undefined && (
                          <span className="text-sm font-medium">
                            Score: {ct.score}/{ct.totalQuestions}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Complété le: {new Date(ct.completedAt || ct.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Evaluation Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {selectedCandidate ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Évaluation de {selectedCandidate.candidateName}
                  </h2>
                  <div className="text-right">
                    <div className="text-lg font-medium text-gray-900">
                      Score actuel: {selectedCandidate.score || 0}/{selectedCandidate.totalQuestions}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedCandidate.questions.filter(q => q.isCorrect).length} questions correctes
                    </div>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                  {selectedCandidate.questions.map((item, index) => {
                    const question = item.question;
                    console.log('Question data:', { 
    index, 
    questionType: question.type, 
    answer: item.answer,
    questionText: question.text 
  });
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                              Question {index + 1}
                            </span>
                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded ${
                              question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                              question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {question.difficulty}
                            </span>
                          </div>
                          <div>
                            {question.type === 'qcm' || question.type === 'qcm_checkbox' ? (
                              <span className="text-sm text-gray-500">QCM</span>
                            ) : question.type === 'code' ? (
                              <span className="text-sm text-gray-500">Code</span>
                            ) : (
                              <span className="text-sm text-gray-500">Réponse libre</span>
                            )}
                          </div>
                        </div>

                        {/* Question Text */}
                        <h3 className="font-medium text-gray-900 mb-3">
                          {question.text}
                        </h3>

                        {/* For MCQ: Show options with correct/incorrect */}
                        {question.type === 'qcm' && question.options && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`p-2 rounded ${
                                    option === question.correctAnswer
                                      ? 'bg-green-100 text-green-800 border border-green-200'
                                      : option === item.answer
                                      ? 'bg-red-100 text-red-800 border border-red-200'
                                      : 'bg-gray-50 text-gray-700'
                                  }`}
                                >
                                  {option}
                                  {option === question.correctAnswer && (
                                    <span className="ml-2 text-xs font-medium">✓ Correcte</span>
                                  )}
                                  {option === item.answer && option !== question.correctAnswer && (
                                    <span className="ml-2 text-xs font-medium">✗ Choix du candidat</span>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 text-sm">
                              <span className="font-medium">Réponse du candidat: </span>
                              <span className={`font-medium ${
                                item.answer === question.correctAnswer 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {item.answer || 'Pas de réponse'}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* For Code/Open-ended: Show candidate's answer */}
                        {(question.type === 'code' || question.type === 'libre') && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Réponse du candidat:</p>
                            <div className="bg-gray-50 p-3 rounded border border-gray-200">
                              {question.type === 'code' ? (
                                <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                                  {item.answer || 'Aucune réponse fournie'}
                                </pre>
                              ) : (
                                <p className="text-gray-800">{item.answer || 'Aucune réponse fournie'}</p>
                              )}
                            </div>
                            
                            {/* If there's a correct answer for reference */}
                            {question.correctAnswer && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 mb-2">Réponse attendue:</p>
                                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                  <p className="text-blue-800">{question.correctAnswer}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Evaluation Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleScoreQuestion(index, true)}
                            className={`px-4 py-2 rounded-md ${
                              item.isCorrect 
                                ? 'bg-green-600 text-white' 
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            ✓ Correct
                          </button>
                          <button
                            onClick={() => handleScoreQuestion(index, false)}
                            className={`px-4 py-2 rounded-md ${
                              item.isCorrect === false 
                                ? 'bg-red-600 text-white' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            ✗ Incorrect
                          </button>
                          <span className="text-sm text-gray-500 ml-auto pt-2">
                            {item.isCorrect === true ? 'Marquée comme correcte' :
                             item.isCorrect === false ? 'Marquée comme incorrecte' :
                             'Non évaluée'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Save Evaluation Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        Score final après évaluation: {selectedCandidate.questions.filter(q => q.isCorrect).length}/{selectedCandidate.totalQuestions}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedCandidate(null)}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={saveEvaluation}
                        disabled={evaluating}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
                      >
                        {evaluating ? 'Sauvegarde...' : 'Sauvegarder l\'évaluation'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-5xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez un candidat</h3>
                <p className="text-gray-600">
                  Choisissez un candidat dans la liste pour évaluer ses réponses
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestEvaluation;