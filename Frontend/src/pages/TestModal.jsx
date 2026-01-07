import React, { useState, useEffect } from 'react';

const TestModal = ({ selectedQuestions, onSubmit, onClose, defaultJobTitle = '', defaultCategory = '' }) => {
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    duration: 60,
    jobTitle: defaultJobTitle,
    category: defaultCategory
  });

  useEffect(() => {
    if (defaultJobTitle) {
      setTestData(prev => ({
        ...prev,
        jobTitle: defaultJobTitle,
        title: `Test Technique ${defaultJobTitle}`,
        description: `Test technique pour le poste de ${defaultJobTitle}`
      }));
    }
  }, [defaultJobTitle]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setTestData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(testData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Créer un Nouveau Test
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {selectedQuestions} question{selectedQuestions > 1 ? 's' : ''} sélectionnée{selectedQuestions > 1 ? 's' : ''}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du test *
              </label>
              <input
                type="text"
                name="title"
                value={testData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Ex: Test Technique Développeur Frontend"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={testData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Description du test..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée (minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={testData.duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="1"
                  max="240"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poste *
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={testData.jobTitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Ex: Développeur Frontend"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie *
              </label>
              <input
                type="text"
                name="category"
                value={testData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Ex: JavaScript, React, Node.js"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Créer le Test
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestModal;