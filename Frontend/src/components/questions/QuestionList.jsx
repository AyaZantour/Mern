import React from 'react';
import QuestionCard from './QuestionCard';

const QuestionList = ({ questions, onRefreshQuestion }) => {
  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="text-gray-400 text-4xl mb-4">?</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucune Question Générée
        </h3>
        <p className="text-gray-600">
          Configurez les paramètres et générez vos premières questions IA
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Questions Générées
        </h2>
        <p className="text-gray-600 text-sm">
          {questions.length} question(s) créée(s)
        </p>
      </div>
      
      <div className="space-y-4">
        {questions.map((question, index) => (
          <QuestionCard 
            key={question.id || question._id || index} 
            question={question} 
            onRefresh={onRefreshQuestion} 
          />
        ))}
      </div>
    </div>
  );
};

export default QuestionList; 