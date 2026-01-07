// components/TestBuilder.jsx
import React from 'react';

const TestBuilder = ({
  currentTest,
  generatedQuestions,
  handleFinalizeTest,
  setShowTestSection
}) => {
  if (!currentTest) return null;

  return (
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
            onClick={handleFinalizeTest}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Finaliser et Envoyer
          </button>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-700 mb-3">Questions dans le test:</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {currentTest.questions && currentTest.questions.length > 0 ? (
            currentTest.questions.map((qId, index) => {
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
                  Question #{index + 1} (ID: {qId.substring(0, 8)}...)
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
  );
};

export default TestBuilder;
