// src/components/TestPanel.jsx
import React from 'react';

const TestPanel = ({ currentTest, generatedQuestions, onHide, onFinalize }) => {
  if (!currentTest) return null;

  // helper to normalize qId to string
  const qIdToString = (qId) => {
    if (typeof qId === 'string') return qId;
    if (!qId) return '';
    if (qId._id) return String(qId._id);
    if (qId.toString) return String(qId.toString());
    return String(qId);
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">📝 Test en cours</h2>
          <p className="text-gray-600">
            {currentTest.title} • {(currentTest.questions || []).length} questions • {currentTest.duration || 0} min
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onHide} className="bg-gray-300 px-3 py-1 rounded">Masquer</button>
          <button onClick={onFinalize} className="bg-green-600 text-white px-3 py-1 rounded">Finaliser</button>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="mb-3">Questions dans le test:</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {(currentTest.questions && currentTest.questions.length > 0) ? (
            currentTest.questions.map((qId, index) => {
              const qIdStr = qIdToString(qId);
              const found = generatedQuestions.find(q => (q._id === qIdStr || q.id === qIdStr));
              if (found) {
                return (
                  <div key={`${qIdStr}-${index}`} className="p-3 bg-gray-50 rounded border flex items-center gap-3">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-sm">{index+1}</div>
                    <div>
                      <div className="text-sm font-medium">{found.text.substring(0, 80)}{found.text.length > 80 ? '...' : ''}</div>
                      <div className="text-xs text-gray-500">{found.difficulty} • {found.time || 1} min</div>
                    </div>
                  </div>
                );
              }
              return (
                <div key={`${qIdStr}-${index}`} className="p-3 bg-gray-50 rounded border text-sm text-gray-500">
                  Question #{index+1} (ID: {qIdStr.slice(0,8)}...)
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center py-4">Aucune question dans le test.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPanel;
