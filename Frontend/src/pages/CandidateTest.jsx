

// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { candidateTestAPI } from '../services/api';

// const CandidateTest = () => {
//   const { uniqueLink } = useParams();
//   const navigate = useNavigate();
//   const [testData, setTestData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [answers, setAnswers] = useState([]);
//   const [currentQuestion, setCurrentQuestion] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(null);
//   const [submitting, setSubmitting] = useState(false);

//   // Define fetchTest function BEFORE using it
//   const fetchTest = async () => {
//     try {
//       const response = await candidateTestAPI.getByLink(uniqueLink);
//       if (response.data.success) {
//         setTestData(response.data.data);
//         // Initialize answers array
//         const initialAnswers = new Array(response.data.data.questions.length).fill('');
//         setAnswers(initialAnswers);
        
//         // Start timer based on test duration
//         startTestTimer(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching test:', error);
//       setError(error.response?.data?.error || 'Test non trouvé ou expiré');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Separate function for timer logic
//   const startTestTimer = (testData) => {
//     if (!testData) return;

//     // Calculate test duration from test data
//     // Option A: Use test.duration field (in minutes)
//     const testDurationMinutes = testData.test?.duration || 60;
//     const testDurationMs = testDurationMinutes * 60 * 1000;
    
//     // Calculate end time based on when test started
//     const startTime = testData.startedAt ? new Date(testData.startedAt).getTime() : Date.now();
//     const endTime = startTime + testDurationMs;

//     const calculateTimeLeft = () => {
//       const now = Date.now();
//       const diff = endTime - now;
      
//       if (diff <= 0) {
//         setError('Temps écoulé! Le test est terminé.');
//         // Auto-submit when time runs out
//         if (testData.status !== 'completed') {
//           autoSubmitTest();
//         }
//         return null;
//       }
      
//       const hours = Math.floor(diff / (1000 * 60 * 60));
//       const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//       const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
//       return { hours, minutes, seconds };
//     };

//     setTimeLeft(calculateTimeLeft());
//     const timer = setInterval(() => {
//       const newTime = calculateTimeLeft();
//       if (!newTime) {
//         clearInterval(timer);
//       }
//       setTimeLeft(newTime);
//     }, 1000);

//     return () => clearInterval(timer);
//   };

//   const autoSubmitTest = async () => {
//     try {
//       if (!testData || testData.status === 'completed') return;
      
//       const response = await candidateTestAPI.submit(testData._id, { answers });
//       if (response.data.success) {
//         alert('Temps écoulé! Test soumis automatiquement.');
//         navigate('/test-completed');
//       }
//     } catch (error) {
//       console.error('Error auto-submitting test:', error);
//     }
//   };

// // // FIND THIS:
// // const handleAnswerChange = (value) => {
// //   const newAnswers = [...answers];
// //   newAnswers[currentQuestion] = value;
// //   setAnswers(newAnswers);
// // };

// // REPLACE WITH:
// const handleAnswerChange = (value) => {
//   const currentQ = testData.questions[currentQuestion];
//   const questionId = currentQ.question._id;
  
//   setAnswers(prev => ({
//     ...prev,
//     [questionId]: value
//   }));
// };


// // ADD THIS NEW FUNCTION (after handleAnswerChange):
// const handleCheckboxChange = (option) => {
//   const currentQ = testData.questions[currentQuestion];
//   const questionId = currentQ.question._id;
//   const currentAnswers = answers[questionId] || [];
  
//   let newAnswers;
//   if (Array.isArray(currentAnswers) && currentAnswers.includes(option)) {
//     newAnswers = currentAnswers.filter(a => a !== option);
//   } else {
//     newAnswers = [...(Array.isArray(currentAnswers) ? currentAnswers : []), option];
//   }
  
//   setAnswers(prev => ({
//     ...prev,
//     [questionId]: newAnswers
//   }));
// };


//   const handleNext = () => {
//     if (currentQuestion < testData.questions.length - 1) {
//       setCurrentQuestion(currentQuestion + 1);
//     }
//   };

//   const handlePrev = () => {
//     if (currentQuestion > 0) {
//       setCurrentQuestion(currentQuestion - 1);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!window.confirm('Êtes-vous sûr de vouloir soumettre vos réponses? Cette action est irréversible.')) {
//       return;
//     }
    
//     setSubmitting(true);
//     try {
//       const response = await candidateTestAPI.submit(testData._id, { answers });
//       if (response.data.success) {
//         alert('Test soumis avec succès! Votre score: ' + response.data.data.score + '/' + testData.totalQuestions);
//         navigate('/test-completed');
//       }
//     } catch (error) {
//       console.error('Error submitting test:', error);
//       alert('Erreur lors de la soumission du test');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   useEffect(() => {
//     fetchTest();
//   }, [uniqueLink]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           <p className="mt-4 text-gray-600">Chargement du test...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
//           <div className="text-red-500 text-4xl mb-4">❌</div>
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
//           <p className="text-gray-600 mb-6">{error}</p>
//           <button
//             onClick={() => navigate('/')}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
//           >
//             Retour à l'accueil
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const currentQ = testData.questions[currentQuestion];
//   const question = currentQ.question;
//   // ADD THIS after "const question = currentQ.question;" (07/01/2026):
// const questionId = question._id;
// const currentAnswer = answers[questionId];


//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white shadow">
//         <div className="max-w-6xl mx-auto px-4 py-4">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-xl font-bold text-gray-900">{testData.test?.title || 'Test de Recrutement'}</h1>
//               <p className="text-gray-600">Candidat: {testData.candidateName}</p>
//             </div>
            
//             {/* Timer */}
//             {timeLeft && (
//               <div className="text-right">
//                 <div className="text-sm text-gray-500 mb-1">Temps restant:</div>
//                 <div className="text-2xl font-mono font-bold text-blue-600">
//                   {String(timeLeft.hours).padStart(2, '0')}:
//                   {String(timeLeft.minutes).padStart(2, '0')}:
//                   {String(timeLeft.seconds).padStart(2, '0')}
//                 </div>
//                 <div className="text-xs text-gray-500 mt-1">
//                   Durée: {testData.test?.duration || 60} minutes
//                 </div>
//               </div>
//             )}
//           </div>
          
//           {/* Progress Bar */}
//           <div className="mt-4">
//             <div className="flex justify-between text-sm text-gray-600 mb-1">
//               <span>Question {currentQuestion + 1} sur {testData.questions.length}</span>
//               <span>{Math.round(((currentQuestion + 1) / testData.questions.length) * 100)}% complété</span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <div 
//                 className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                 style={{ width: `${((currentQuestion + 1) / testData.questions.length) * 100}%` }}
//               ></div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Test Content */}
//       <div className="max-w-4xl mx-auto px-4 py-8">
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           {/* Question Header */}
//           <div className="flex justify-between items-start mb-6">
//             <div>
//               <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-2">
//                 Question {currentQuestion + 1}
//               </span>
//               {question.difficulty && (
//                 <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
//                   question.difficulty === 'facile' || question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
//                   question.difficulty === 'moyenne' || question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
//                   'bg-red-100 text-red-800'
//                 }`}>
//                   {question.difficulty}
//                 </span>
//               )}
//             </div>
//             <div className="text-gray-500 text-sm">
//               {question.time && `${question.time} min`}
//             </div>
//           </div>

//           {/* Question Text */}
//           <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
//             {question.text}
//           </h2>

//           {/* Options (for MCQ) */}
//           {/* {question.options && question.options.length > 0 && (
//             <div className="space-y-3">
//               {question.options.map((option, index) => (
//                 <label
//                   key={index}
//                   className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
//                     answers[currentQuestion] === option
//                       ? 'border-blue-500 bg-blue-50'
//                       : 'border-gray-200 hover:border-gray-300'
//                   }`}
//                 >
//                   <input
//                     type={question.type === 'qcm_checkbox' ? 'checkbox' : 'radio'}
//                     name={`question-${currentQuestion}`}
//                     value={option}
//                     checked={answers[currentQuestion] === option}
//                     onChange={() => handleAnswerChange(option)}
//                     className={question.type === 'qcm_checkbox' ? 'rounded' : 'rounded-full'}
//                   />
//                   <span className="ml-3 flex-1">{option}</span>
//                 </label>
//               ))}
//             </div>
//           )} */}


//         {/* 07/01/2026 - UPDATE THE OPTIONS SECTION AS FOLLOWS: */}
//         {question.type === 'qcm_checkbox' && question.options && (
//   <div className="space-y-3">
//     <p className="text-sm text-gray-600 mb-3">Sélectionnez une ou plusieurs réponses</p>
//     {question.options.map((option, index) => {
//       const isChecked = Array.isArray(currentAnswer) && currentAnswer.includes(option);
//       return (
//         <label key={index} className={`flex items-center p-4 border rounded-lg cursor-pointer ${
//           isChecked ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
//         }`}>
//           <input
//             type="checkbox"
//             checked={isChecked}
//             onChange={() => handleCheckboxChange(option)}
//             className="rounded"
//           />
//           <span className="ml-3 flex-1">{option}</span>
//         </label>
//       );
//     })}
//   </div>
// )}




//           {/* Text Input (for open-ended/code questions) */}
//           {(question.type === 'libre' || question.type === 'code') && (
//             <div>
//               <textarea
//                 value={answers[currentQuestion] || ''}
//                 onChange={(e) => handleAnswerChange(e.target.value)}
//                 className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm"
//                 placeholder={
//                   question.type === 'code' 
//                     ? 'Écrivez votre code ici...'
//                     : 'Écrivez votre réponse ici...'
//                 }
//               />
//               {question.type === 'code' && question.starterCode && (
//                 <div className="mt-4">
//                   <h4 className="font-medium text-gray-700 mb-2">Code de départ:</h4>
//                   <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
//                     {question.starterCode}
//                   </pre>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Navigation Buttons */}
//         <div className="flex justify-between">
//           <div>
//             <button
//               onClick={handlePrev}
//               disabled={currentQuestion === 0}
//               className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               ← Précédent
//             </button>
//           </div>
          
//           <div className="flex gap-3">
//             {currentQuestion < testData.questions.length - 1 ? (
//               <button
//                 onClick={handleNext}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
//               >
//                 Suivant →
//               </button>
//             ) : (
//               <button
//                 onClick={handleSubmit}
//                 disabled={submitting}
//                 className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
//               >
//                 {submitting ? 'Soumission...' : 'Soumettre le Test'}
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Question Navigation Dots */}
//         <div className="mt-8">
//           <div className="flex flex-wrap gap-2 justify-center">
//             {testData.questions.map((_, index) => (
//               <button
//                 key={index}
//                 onClick={() => setCurrentQuestion(index)}
//                 className={`w-10 h-10 rounded-full flex items-center justify-center ${
//                   index === currentQuestion
//                     ? 'bg-blue-600 text-white'
//                     : answers[index]
//                     ? 'bg-green-100 text-green-800'
//                     : 'bg-gray-200 text-gray-700'
//                 }`}
//               >
//                 {index + 1}
//               </button>
//             ))}
//           </div>
//           <div className="text-center text-sm text-gray-500 mt-2">
//             <span className="inline-block w-3 h-3 bg-green-100 rounded-full mr-1"></span> Répondu
//             <span className="inline-block w-3 h-3 bg-gray-200 rounded-full ml-4 mr-1"></span> Non répondu
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CandidateTest;







//code 22:23 pm
// ========================================
// COMPLETE FIX for CandidateTest.jsx
// Fixes: QCM options not showing + Can't type in text areas
// ========================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { candidateTestAPI } from '../services/api';

const CandidateTest = () => {
  const { uniqueLink } = useParams();
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTest = async () => {
    try {
      console.log('🔍 Fetching test with link:', uniqueLink);
      const response = await candidateTestAPI.getByLink(uniqueLink);
      
      if (response.data.success) {
        const testData = response.data.data;
        console.log('✅ Test loaded:', testData);
        console.log('📊 Questions:', testData.questions.length);
        
        // ✅ DEBUG: Check first question structure
        if (testData.questions.length > 0) {
          const firstQ = testData.questions[0].question;
          console.log('🔍 First question:', {
            text: firstQ.text,
            type: firstQ.type,
            hasOptions: !!firstQ.options,
            optionsCount: firstQ.options?.length,
            options: firstQ.options
          });
        }
        
        setTestData(testData);
        
        // Initialize answers
        const initialAnswers = {};
        testData.questions.forEach((item) => {
          const questionId = item.question._id;
          const questionType = item.question.type;
          initialAnswers[questionId] = questionType === 'qcm_checkbox' ? [] : '';
        });
        setAnswers(initialAnswers);
        
        startTestTimer(testData);
      }
    } catch (error) {
      console.error('❌ Error fetching test:', error);
      setError(error.response?.data?.error || 'Test non trouvé ou expiré');
    } finally {
      setLoading(false);
    }
  };

  const startTestTimer = (testData) => {
    if (!testData) return;

    const testDurationMinutes = testData.test?.duration || 60;
    const testDurationMs = testDurationMinutes * 60 * 1000;
    
    const startTime = testData.startedAt ? new Date(testData.startedAt).getTime() : Date.now();
    const endTime = startTime + testDurationMs;

    const calculateTimeLeft = () => {
      const now = Date.now();
      const diff = endTime - now;
      
      if (diff <= 0) {
        setError('Temps écoulé! Le test est terminé.');
        if (testData.status !== 'completed') {
          autoSubmitTest();
        }
        return null;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      const newTime = calculateTimeLeft();
      if (!newTime) {
        clearInterval(timer);
      }
      setTimeLeft(newTime);
    }, 1000);

    return () => clearInterval(timer);
  };

  const autoSubmitTest = async () => {
    try {
      if (!testData || testData.status === 'completed') return;
      
      const response = await candidateTestAPI.submit(testData._id, { answers });
      if (response.data.success) {
        alert('Temps écoulé! Test soumis automatiquement.');
        navigate('/test-completed');
      }
    } catch (error) {
      console.error('Error auto-submitting test:', error);
    }
  };

  // ✅ FIXED: Simplified answer change handler
  const handleAnswerChange = (value) => {
    const currentQ = testData.questions[currentQuestion];
    const questionId = currentQ.question._id;
    
    console.log('📝 Answer changed:', { questionId, value });
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // ✅ FIXED: Checkbox handler
  const handleCheckboxChange = (option) => {
    const currentQ = testData.questions[currentQuestion];
    const questionId = currentQ.question._id;
    const currentAnswers = answers[questionId] || [];
    
    let newAnswers;
    if (Array.isArray(currentAnswers) && currentAnswers.includes(option)) {
      newAnswers = currentAnswers.filter(a => a !== option);
    } else {
      newAnswers = [...(Array.isArray(currentAnswers) ? currentAnswers : []), option];
    }
    
    console.log('☑️ Checkbox changed:', { questionId, option, newAnswers });
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: newAnswers
    }));
  };

  const handleNext = () => {
    if (currentQuestion < testData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir soumettre vos réponses? Cette action est irréversible.')) {
      return;
    }
    
    setSubmitting(true);
    try {
      console.log('📤 Submitting answers:', answers);
      
      const response = await candidateTestAPI.submit(testData._id, { answers });
      if (response.data.success) {
        alert(`Test soumis avec succès! Votre score: ${response.data.data.score}/${testData.totalQuestions}`);
        navigate('/test-completed');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Erreur lors de la soumission du test');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchTest();
  }, [uniqueLink]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement du test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (!testData || !testData.questions || testData.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Test vide</h1>
          <p className="text-gray-600 mb-6">Ce test ne contient aucune question.</p>
        </div>
      </div>
    );
  }

  const currentQ = testData.questions[currentQuestion];
  const question = currentQ.question;
  const questionId = question._id;
  const currentAnswer = answers[questionId];

  // ✅ DEBUG: Log current question
  console.log('📋 Current question:', {
    index: currentQuestion,
    type: question.type,
    hasOptions: !!question.options,
    optionsCount: question.options?.length,
    currentAnswer
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{testData.test?.title || 'Test de Recrutement'}</h1>
              <p className="text-gray-600">Candidat: {testData.candidateName}</p>
            </div>
            
            {/* Timer */}
            {timeLeft && (
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Temps restant:</div>
                <div className={`text-2xl font-mono font-bold ${
                  timeLeft.minutes < 5 && timeLeft.hours === 0 ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {String(timeLeft.hours).padStart(2, '0')}:
                  {String(timeLeft.minutes).padStart(2, '0')}:
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Durée: {testData.test?.duration || 60} minutes
                </div>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Question {currentQuestion + 1} sur {testData.questions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / testData.questions.length) * 100)}% complété</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / testData.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Question Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-2">
                Question {currentQuestion + 1}
              </span>
              {question.difficulty && (
                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                  question.difficulty === 'facile' || question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  question.difficulty === 'moyenne' || question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {question.difficulty}
                </span>
              )}
            </div>
            <div className="text-gray-500 text-sm">
              {question.time && `${question.time} min`}
            </div>
          </div>

          {/* Question Text */}
          <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
            {question.text}
          </h2>

          {/* ✅ FIXED: Radio Options (QCM Radio) */}
          {question.type === 'qcm_radio' && (
            <div className="space-y-3">
              {question.options && question.options.length > 0 ? (
                question.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      currentAnswer === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${questionId}`}
                      value={option}
                      checked={currentAnswer === option}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3 flex-1 text-gray-900">{option}</span>
                  </label>
                ))
              ) : (
                <div className="text-red-600 p-4 bg-red-50 rounded-lg">
                  ⚠️ Cette question n'a pas d'options. Veuillez contacter l'administrateur.
                </div>
              )}
            </div>
          )}

          {/* ✅ FIXED: Checkbox Options (QCM Checkbox) */}
          {question.type === 'qcm_checkbox' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-3">Sélectionnez une ou plusieurs réponses</p>
              {question.options && question.options.length > 0 ? (
                question.options.map((option, index) => {
                  const isChecked = Array.isArray(currentAnswer) && currentAnswer.includes(option);
                  return (
                    <label
                      key={index}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxChange(option)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="ml-3 flex-1 text-gray-900">{option}</span>
                    </label>
                  );
                })
              ) : (
                <div className="text-red-600 p-4 bg-red-50 rounded-lg">
                  ⚠️ Cette question n'a pas d'options. Veuillez contacter l'administrateur.
                </div>
              )}
            </div>
          )}

          {/* ✅ FIXED: Text Input (for open-ended/code questions) */}
          {(question.type === 'libre' || question.type === 'code') && (
            <div>
              <textarea
                value={currentAnswer || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                placeholder={
                  question.type === 'code' 
                    ? 'Écrivez votre code ici...'
                    : 'Écrivez votre réponse ici...'
                }
                style={{ resize: 'vertical' }}
              />
              {question.type === 'code' && question.starterCode && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Code de départ:</h4>
                  <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                    {question.starterCode}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <div>
            <button
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Précédent
            </button>
          </div>
          
          <div className="flex gap-3">
            {currentQuestion < testData.questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
              >
                Suivant →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Soumission...' : 'Soumettre le Test'}
              </button>
            )}
          </div>
        </div>

        {/* Question Navigation Dots */}
        <div className="mt-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {testData.questions.map((item, index) => {
              const qId = item.question._id;
              const ans = answers[qId];
              const answered = ans && ans !== '' && 
                (item.question.type !== 'qcm_checkbox' || (Array.isArray(ans) && ans.length > 0));
              
              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    index === currentQuestion
                      ? 'bg-blue-600 text-white shadow-lg'
                      : answered
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            <span className="inline-block w-3 h-3 bg-green-100 rounded-full mr-1"></span> Répondu
            <span className="inline-block w-3 h-3 bg-gray-200 rounded-full ml-4 mr-1"></span> Non répondu
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateTest;