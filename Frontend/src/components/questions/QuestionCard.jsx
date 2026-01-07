import React from 'react';

const QuestionCard = ({ question, onRefresh }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            question.difficulty === 'easy' || question.difficulty === 'facile' 
              ? 'bg-green-100 text-green-800' :
            question.difficulty === 'medium' || question.difficulty === 'moyenne' 
              ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {question.difficulty}
          </span>
          <span className="text-xs text-gray-500">
            {question.time} min
          </span>
        </div>
        <button 
          onClick={() => onRefresh(question.difficulty)}
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
            {question.options.map((option, index) => (
              <div 
                key={index}
                className={`flex items-center p-2 rounded border ${
                  question.correctOptions.includes(option) 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border mr-2 ${
                  question.correctOptions.includes(option)
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-400'
                }`}></div>
                <span className={question.correctOptions.includes(option) ? 'text-green-800 font-medium' : 'text-gray-700'}>
                  {option}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard; 