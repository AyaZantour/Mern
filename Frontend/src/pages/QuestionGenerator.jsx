import React, { useState } from 'react';
import { questionAPI, testAPI } from '../services/api';

const QuestionGenerator = () => {
  const [formData, setFormData] = useState({
    type: 'qcm_radio',
    jobTitle: '',
    category: '',
    facile: 1,
    moyenne: 1,
    difficile: 1,
    numOptions: 4
  });
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState({});
  const [currentTest, setCurrentTest] = useState(null);
  const [showTestSection, setShowTestSection] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  // Handle question selection
  const handleSelectQuestion = (questionId) => {
    setSelectedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestData = {
        type: formData.type,
        jobTitle: formData.jobTitle,
        category: formData.category,
        numOptions: formData.numOptions,
        facile: formData.facile,
        moyenne: formData.moyenne,
        difficile: formData.difficile
      };

      console.log('Sending request:', requestData);
      const response = await questionAPI.generate(requestData);
      console.log('Response:', response.data);

      let questions = [];

      if (response.data.success) {
        // Map AI-generated questions
        questions = response.data.data.map((q, index) => ({
          ...q,
          id: q._id || `ai-${Date.now()}-${index}`,
          isMock: false
        }));
        console.log(`✅ Generated ${questions.length} AI questions`);
      } else {
        console.error('API returned error, using mock data.');
        const mockQuestions = getMockQuestions(formData).map((q, i) => ({
          ...q,
          id: `mock-${Date.now()}-${i}`,
          isMock: true
        }));
        questions = mockQuestions;
        console.log(`⚠️ Using ${questions.length} mock questions`);
      }

      setGeneratedQuestions(prev => [...questions, ...prev]);


    } catch (error) {
      console.error('API Error:', error);
      
      // Fallback to mock questions
      const mockQuestions = getMockQuestions(formData).map((q, i) => ({
        ...q,
        id: `mock-${Date.now()}-${i}`,
        isMock: true
      }));
      
      setGeneratedQuestions(prev => [...prev, ...mockQuestions]);
      console.log(`⚠️ Network error, using ${mockQuestions.length} mock questions`);

    } finally {
      setLoading(false);
    }
  };



// ========================================
// CRITICAL FIX: handleAddToTest function
// Replace this function in QuestionGenerator.jsx
// ========================================

const handleAddToTest = async () => {
  const selectedIds = Object.keys(selectedQuestions).filter(id => selectedQuestions[id]);

  if (selectedIds.length === 0) {
    alert('Veuillez sélectionner au moins une question');
    return;
  }

  const selectedQuestionsData = generatedQuestions.filter(q => selectedIds.includes(q.id));
  setTestLoading(true);

  try {
    const questionIds = [];
    
    // Process each selected question
    for (const question of selectedQuestionsData) {
      let questionId;
      
      if (question.isMock || !question._id) {
        // Mock question - save it to database first
        console.log('💾 Saving mock question to database:', question.text.substring(0, 50));
        
        try {
          const saveResponse = await questionAPI.create({
            text: question.text,
            type: question.type || formData.type,
            difficulty: question.difficulty || 'moyenne',
            jobTitle: question.jobTitle || formData.jobTitle,
            category: question.category || formData.category,
            options: question.options || [],
            correctOptions: question.correctOptions || [],
            starterCode: question.starterCode || '',
            language: question.language || '',
            time: question.time || 1,
            addedBy: 'Manual',
            validated: true
          });
          
          if (saveResponse.data.success) {
            questionId = saveResponse.data.data._id;
            console.log('✅ Mock question saved with ID:', questionId);
            
            // Update the question in state with the real ID
            setGeneratedQuestions(prev => prev.map(q => 
              q.id === question.id ? { ...q, _id: questionId, isMock: false } : q
            ));
          } else {
            console.error('❌ Failed to save mock question:', saveResponse.data.error);
            continue; // Skip this question
          }
        } catch (saveError) {
          console.error('❌ Error saving mock question:', saveError);
          continue; // Skip this question
        }
      } else {
        // Real question with existing _id
        questionId = question._id;
      }
      
      if (questionId) {
        questionIds.push(questionId);
      }
    }

    if (questionIds.length === 0) {
      alert('Aucune question valide à ajouter au test');
      setTestLoading(false);
      return;
    }

    console.log('📋 Question IDs to add:', questionIds);
    
    // Calculate total duration
    const duration = selectedQuestionsData.reduce((total, q) => total + (q.time || 1), 0);
    
    let response;
    const testTitle = `Test ${formData.jobTitle || 'Technique'} - ${new Date().toLocaleDateString('fr-FR')}`;

    if (currentTest && currentTest._id) {
      // ✅ CRITICAL FIX: Update existing test - APPEND questions, don't replace
      console.log('📝 Updating existing test:', currentTest._id);
      console.log('📊 Current questions:', currentTest.questions?.length || 0);
      console.log('➕ Adding questions:', questionIds.length);
      
      // Get existing question IDs (handle both populated and non-populated)
      const existingQuestionIds = (currentTest.questions || []).map(q => {
        // If q is an object with _id, extract it; otherwise it's already an ID
        return typeof q === 'object' && q._id ? q._id : q;
      });
      
      console.log('📌 Existing question IDs:', existingQuestionIds);
      
      // ✅ APPEND new questions to existing ones
      const allQuestionIds = [...existingQuestionIds, ...questionIds];
      
      console.log('📦 Final question array:', allQuestionIds);
      
      response = await testAPI.update(currentTest._id, {
        questions: allQuestionIds,  // ✅ This now includes old + new
        duration: (currentTest.duration || 0) + duration
      });
      
      console.log('✅ Test updated successfully');
    } else {
      // Create new test
      console.log('🆕 Creating new test');
      response = await testAPI.create({
        title: testTitle,
        description: `Test pour ${formData.jobTitle || 'divers postes'}`,
        jobTitle: formData.jobTitle || 'Divers',
        category: formData.category || 'Général',
        questions: questionIds,
        duration: duration
      });
      console.log('✅ New test created');
    }

    if (response.data.success) {
      const updatedTest = response.data.data;
      console.log('📊 Updated test has', updatedTest.questions?.length, 'questions');
      
      setCurrentTest(updatedTest);
      setShowTestSection(true);
      setSelectedQuestions({});
      
      alert(currentTest 
        ? `✅ ${questionIds.length} questions ajoutées au test! Total: ${updatedTest.questions?.length} questions` 
        : '✅ Test créé avec succès!');
    } else {
      alert(' Erreur: ' + (response.data.error || 'Échec de création du test'));
    }

  } catch (error) {
    console.error(' Error creating/updating test:', error);
    alert(' Erreur lors de la création du test: ' + (error.response?.data?.error || error.message));
  } finally {
    setTestLoading(false);
  }
};







//   const handleAddToTest = async () => {
//     const selectedIds = Object.keys(selectedQuestions).filter(id => selectedQuestions[id]);

//     if (selectedIds.length === 0) {
//       alert('Veuillez sélectionner au moins une question');
//       return;
//     }

//     const selectedQuestionsData = generatedQuestions.filter(q => selectedIds.includes(q.id));
//     setTestLoading(true);

//     try {
//       const questionIds = [];
      
//       // Process each selected question
//       for (const question of selectedQuestionsData) {
//         let questionId;
        
//         if (question.isMock || !question._id) {
//           // Mock question - save it to database first
//           console.log('Saving mock question to database:', question.text.substring(0, 50));
          
//           try {
//             const saveResponse = await questionAPI.create({
//               text: question.text,
//               type: question.type || formData.type,
//               difficulty: question.difficulty || 'moyenne',
//               jobTitle: question.jobTitle || formData.jobTitle,
//               category: question.category || formData.category,
//               options: question.options || [],
//               correctOptions: question.correctOptions || [],
//               time: question.time || 1,
//               addedBy: 'Manual',
//               validated: true
//             });
            
//             if (saveResponse.data.success) {
//               questionId = saveResponse.data.data._id;
//               console.log('✅ Mock question saved with ID:', questionId);
              
//               // Update the question in state with the real ID
//               setGeneratedQuestions(prev => prev.map(q => 
//                 q.id === question.id ? { ...q, _id: questionId, isMock: false } : q
//               ));
//             } else {
//               console.error('Failed to save mock question:', saveResponse.data.error);
//               continue; // Skip this question
//             }
//           } catch (saveError) {
//             console.error('Error saving mock question:', saveError);
//             continue; // Skip this question
//           }
//         } else {
//           // Real question with existing _id
//           questionId = question._id;
//         }
        
//         if (questionId) {
//           questionIds.push(questionId);
//         }
//       }

//       if (questionIds.length === 0) {
//         alert('Aucune question valide à ajouter au test');
//         setTestLoading(false);
//         return;
//       }

//       console.log('Question IDs for test:', questionIds);
      
//       // Calculate total duration
//       const duration = selectedQuestionsData.reduce((total, q) => total + (q.time || 1), 0);
      
//       let response;
//       const testTitle = `Test ${formData.jobTitle || 'Technique'} - ${new Date().toLocaleDateString('fr-FR')}`;

//       if (currentTest && currentTest._id) {
//         // Update existing test
//         response = await testAPI.update(currentTest._id, {
// questions: [
//   ...((currentTest.questions || []).map(q => q._id)),
//   ...questionIds
// ],
//           duration: (currentTest.duration || 0) + duration
//         });
//         console.log('Updating existing test');
//       } else {
//         // Create new test
//         response = await testAPI.create({
//           title: testTitle,
//           description: `Test pour ${formData.jobTitle || 'divers postes'}`,
//           jobTitle: formData.jobTitle || 'Divers',
//           category: formData.category || 'Général',
//           questions: questionIds,
//           duration: duration
//         });
//         console.log('Creating new test');
//       }

//       if (response.data.success) {
//         setCurrentTest(response.data.data);
//         setShowTestSection(true);
//         setSelectedQuestions({});
//         alert(currentTest ? 'Questions ajoutées au test!' : 'Test créé avec succès!');
//       } else {
//         alert('Erreur: ' + (response.data.error || 'Échec de création du test'));
//       }

//     } catch (error) {
//       console.error('Error creating/updating test:', error);
//       alert('Erreur lors de la création du test: ' + (error.response?.data?.error || error.message));
//     } finally {
//       setTestLoading(false);
//     }
//   };

  const handleRefresh = async (difficulty, index) => {
    try {
      console.log('Refreshing question with difficulty:', difficulty);
      const response = await questionAPI.refresh({
        type: formData.type,
        difficulty: difficulty,
        jobTitle: formData.jobTitle || 'Developer',
        category: formData.category || 'Technology',
        numOptions: formData.numOptions
      });
      
      if (response.data.success) {
        const newQuestion = {
          ...response.data.data,
          id: response.data.data._id,
          isMock: false
        };
        
        setGeneratedQuestions(prev => {
          const newQuestions = [...prev];
          newQuestions[index] = newQuestion;
          return newQuestions;
        });
        
        // If this question was selected, deselect it
        if (selectedQuestions[prev[index]?.id]) {
          setSelectedQuestions(prev => {
            const updated = { ...prev };
            delete updated[prev[index]?.id];
            return updated;
          });
        }
        
        console.log('✅ Question refreshed');
      }
    } catch (error) {
      console.error('Refresh failed:', error);
      
      // Create a mock replacement question
      const mockQuestion = {
        id: `mock-refresh-${Date.now()}`,
        text: `[Mock Refresh] ${difficulty} question for ${formData.jobTitle || 'Developer'} about ${formData.category || 'Technology'}`,
        type: formData.type,
        difficulty: difficulty,
        jobTitle: formData.jobTitle || 'Developer',
        category: formData.category || 'Technology',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctOptions: ['Option A'],
        time: difficulty === 'facile' ? 0.5 : difficulty === 'moyenne' ? 2 : 5,
        isMock: true
      };
      
      setGeneratedQuestions(prev => {
        const newQuestions = [...prev];
        newQuestions[index] = mockQuestion;
        return newQuestions;
      });
      
      alert('⚠️ Using mock question (AI refresh failed)');
    }
  };

  const getMockQuestions = (data) => {
    const questions = [];
    const difficulties = [
      { key: 'facile', label: 'facile', count: data.facile },
      { key: 'moyenne', label: 'moyenne', count: data.moyenne },
      { key: 'difficile', label: 'difficile', count: data.difficile }
    ];
    
    let counter = 0;
    difficulties.forEach(diff => {
      for (let i = 0; i < diff.count; i++) {
        questions.push({
          id: `mock-${Date.now()}-${counter}`,
          text: `${diff.label} question ${i+1} for ${data.jobTitle || 'Developer'} about ${data.category || 'Technology'}`,
          type: data.type,
          difficulty: diff.label,
          jobTitle: data.jobTitle || 'Developer',
          category: data.category || 'Technology',
          options: ['Option A (correct)', 'Option B', 'Option C', 'Option D'],
          correctOptions: ['Option A (correct)'],
          time: diff.label === 'facile' ? 0.5 : diff.label === 'moyenne' ? 2 : 5,
          isMock: true
        });
        counter++;
      }
    });
    
    return questions;
  };

  // Select all questions
  const selectAllQuestions = () => {
    const allQuestionIds = generatedQuestions.map(q => q.id);
    const allSelected = allQuestionIds.every(id => selectedQuestions[id]);
    
    if (allSelected) {
      // Deselect all
      setSelectedQuestions({});
    } else {
      // Select all
      const newSelection = {};
      allQuestionIds.forEach(id => {
        newSelection[id] = true;
      });
      setSelectedQuestions(newSelection);
    }
  };

  const selectedCount = Object.values(selectedQuestions).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Question Generator
          </h1>
          <p className="text-gray-600">
            Créez des questions et assemblez votre test
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Configuration Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Configuration
            </h2>

            <form onSubmit={handleGenerate} className="space-y-4">
              
              {/* Question Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de Question
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="qcm_radio">QCM (Choix unique)</option>
                  <option value="qcm_checkbox">QCM (Choix multiples)</option>
                  <option value="code">Question de code</option>
                  <option value="libre">Question ouverte</option>
                </select>
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poste visé
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  placeholder="Développeur Frontend, Data Scientist..."
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technologie
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="JavaScript, React, Python..."
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Number of Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre d'options (QCM)
                </label>
                <input
                  type="number"
                  name="numOptions"
                  value={formData.numOptions}
                  onChange={handleInputChange}
                  min="2"
                  max="6"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Difficulty Levels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Questions par difficulté
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <label className="block text-xs text-gray-600 mb-1">Facile</label>
                    <input
                      type="number"
                      name="facile"
                      value={formData.facile}
                      onChange={handleInputChange}
                      min="0"
                      max="10"
                      className="w-full p-1 border border-gray-300 rounded text-center"
                    />
                  </div>
                  <div className="text-center">
                    <label className="block text-xs text-gray-600 mb-1">Moyenne</label>
                    <input
                      type="number"
                      name="moyenne"
                      value={formData.moyenne}
                      onChange={handleInputChange}
                      min="0"
                      max="10"
                      className="w-full p-1 border border-gray-300 rounded text-center"
                    />
                  </div>
                  <div className="text-center">
                    <label className="block text-xs text-gray-600 mb-1">Difficile</label>
                    <input
                      type="number"
                      name="difficile"
                      value={formData.difficile}
                      onChange={handleInputChange}
                      min="0"
                      max="10"
                      className="w-full p-1 border border-gray-300 rounded text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
              >
                {loading ? 'Génération...' : 'Générer des Questions'}
              </button>
            </form>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Generated Questions Section */}
            <div className="bg-white rounded-lg shadow-md">
              {generatedQuestions.length > 0 ? (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={generatedQuestions.length > 0 && 
                                  generatedQuestions.every(q => selectedQuestions[q.id])}
                          onChange={selectAllQuestions}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <h2 className="text-xl font-semibold text-gray-900">
                          Questions Générées ({generatedQuestions.length})
                        </h2>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">
                        {selectedCount} question(s) sélectionnée(s)
                        {generatedQuestions.some(q => q.isMock) && 
                          <span className="ml-2 text-orange-600">
                            (Certaines questions sont en mode démo)
                          </span>
                        }
                      </p>
                    </div>
                    
                    {/* Bouton Ajouter au Test */}
                    {selectedCount > 0 && (
                      <button
                        onClick={handleAddToTest}
                        disabled={testLoading}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                      >
                        {testLoading ? 'Ajout...' : `Ajouter au Test (${selectedCount})`}
                      </button>
                    )}
                  </div>

                  {/* Questions List */}
                  <div className="space-y-4">
                    {generatedQuestions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={!!selectedQuestions[question.id]}
                              onChange={() => handleSelectQuestion(question.id)}
                              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            
                            <div className="flex items-center gap-2">
                              {question.isMock && (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                  DÉMO
                                </span>
                              )}
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                question.difficulty === 'facile' || question.difficulty === 'easy'
                                  ? 'bg-green-100 text-green-800' 
                                  : question.difficulty === 'moyenne' || question.difficulty === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {question.difficulty}
                              </span>
                              <span className="text-xs text-gray-500">
                                {question.time || 1} min
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRefresh(question.difficulty, index)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            🔄 Remplacer
                          </button>
                        </div>
                        
                        <h3 className="text-gray-900 font-medium mb-3">
                          {question.text}
                        </h3>
                        
                        {question.options && question.options.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Options:</h4>
                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => (
                                <div 
                                  key={optIndex}
                                  className={`flex items-center p-2 rounded border ${
                                    question.correctOptions?.includes(option) 
                                      ? 'border-green-500 bg-green-50' 
                                      : 'border-gray-200'
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded-full border mr-2 ${
                                    question.correctOptions?.includes(option)
                                      ? 'border-green-500 bg-green-500'
                                      : 'border-gray-400'
                                  }`}></div>
                                  <span className={question.correctOptions?.includes(option) ? 'text-green-800 font-medium' : 'text-gray-700'}>
                                    {option}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-3 text-xs text-gray-500">
                          {question.jobTitle || formData.jobTitle} • {question.category || formData.category}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-gray-400 text-4xl mb-4">❓</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune question générée
                  </h3>
                  <p className="text-gray-600">
                    Configurez les paramètres et générez vos premières questions
                  </p>
                </div>
              )}
            </div>

            {/* Test Section */}
            {showTestSection && currentTest && (
              <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">📝 Test en Cours</h2>
                    <p className="text-gray-600">
                      {currentTest.title} • {currentTest.questions?.length || 0} questions • {currentTest.duration || 0} min
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowTestSection(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm"
                    >
                      Masquer
                    </button>
                    <button
                      onClick={() => {
                        if (!currentTest) {
                          alert('Aucun test en cours');
                          return;
                        }
                        if (window.confirm('Finaliser ce test? Vous pourrez ensuite l\'envoyer aux candidats.')) {
                          window.location.href = `/candidate-portal?testId=${currentTest._id}`;
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Finaliser et Envoyer
                    </button>
                  </div>
                </div>
                
                {/* Liste des questions dans le test */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Questions dans le test:</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {currentTest.questions && currentTest.questions.length > 0 ? (
                      currentTest.questions.map((qId, index) => {
                        // Find the question in generatedQuestions
                        const question = generatedQuestions.find(q => 
                          q._id === qId || q.id === qId
                        );
                        
                        return question ? (
                          <div key={`${qId}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-sm font-medium text-gray-700 bg-white w-6 h-6 rounded-full flex items-center justify-center">
                                  {index + 1}
                                </span>
                                <p className="text-sm text-gray-900">
                                  {question.text.substring(0, 80)}...
                                </p>
                              </div>
                              <div className="flex items-center gap-2 ml-9">
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                  {question.difficulty}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {question.time || 1} min • {question.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div key={`${qId}-${index}`} className="p-3 bg-gray-50 rounded border text-sm text-gray-500">
                            Question #{index + 1} (ID: {typeof qId === 'string' ? qId.substring(0, 8) : '...'})
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        Aucune question dans le test. Sélectionnez des questions ci-dessus.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionGenerator;