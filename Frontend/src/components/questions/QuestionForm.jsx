import React from 'react';

const QuestionForm = ({ formData, loading, onSubmit, onInputChange }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Paramètres des Questions
      </h2>
      
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Type de question */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de Question
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={onInputChange}
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
            Poste
          </label>
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={onInputChange}
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
            onChange={onInputChange}
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
            onChange={onInputChange}
            min="2"
            max="6"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Difficulty Levels */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Questions par Difficulté
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <label className="block text-xs text-gray-600 mb-1">Facile</label>
              <input
                type="number"
                name="facile"
                value={formData.facile}
                onChange={onInputChange}
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
                onChange={onInputChange}
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
                onChange={onInputChange}
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
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          {loading ? 'Génération en cours...' : 'Générer les Questions'}
        </button>
      </form>
    </div>
  );
};

export default QuestionForm; 