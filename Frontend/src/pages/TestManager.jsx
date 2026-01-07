import React, { useState, useEffect } from 'react';
import { testAPI } from '../services/api';
import { Link } from 'react-router-dom';

const TestManager = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    jobTitle: '',
    category: '',
    duration: 60,
    questions: []
  });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
  setLoading(true);
  try {
    const response = await testAPI.getAll();
    if (response.data.success) {
      // ✅ Sort by createdAt, newest first
      const sortedTests = response.data.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTests(sortedTests);
    }
  } catch (error) {
    console.error('Error fetching tests:', error);
  } finally {
    setLoading(false);
  }
};

  const handleCreateTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await testAPI.create(newTest);
      if (response.data.success) {
        setTests([...tests, response.data.data]);
        setShowCreateForm(false);
        setNewTest({
          title: '',
          description: '',
          jobTitle: '',
          category: '',
          duration: 60,
          questions: []
        });
      }
    } catch (error) {
      console.error('Error creating test:', error);
      alert('Erreur lors de la création du test');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce test?')) return;
    
    try {
      await testAPI.delete(id);
      setTests(tests.filter(test => test._id !== id));
    } catch (error) {
      console.error('Error deleting test:', error);
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestionnaire de Tests</h1>
            <p className="text-gray-600">Créez et gérez vos tests de recrutement</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            + Nouveau Test
          </button>
        </div>

        {/* Create Test Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Créer un Nouveau Test</h2>
            <form onSubmit={handleCreateTest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre du Test</label>
                  <input
                    type="text"
                    value={newTest.title}
                    onChange={(e) => setNewTest({...newTest, title: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poste visé</label>
                  <input
                    type="text"
                    value={newTest.jobTitle}
                    onChange={(e) => setNewTest({...newTest, jobTitle: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={newTest.category}
                    onChange={(e) => setNewTest({...newTest, category: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée (minutes)</label>
                  <input
                    type="number"
                    value={newTest.duration}
                    onChange={(e) => setNewTest({...newTest, duration: parseInt(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                    min="5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTest.description}
                  onChange={(e) => setNewTest({...newTest, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  {loading ? 'Création...' : 'Créer le Test'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tests List */}
        <div className="bg-white rounded-lg shadow-md">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Chargement des tests...</p>
            </div>
          ) : tests.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun test créé</h3>
              <p className="text-gray-600">Commencez par créer votre premier test</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tests.map((test) => (
                <div key={test._id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{test.title}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {test.jobTitle}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                          {test.duration} min
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{test.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Catégorie: {test.category}</span>
                        <span>•</span>
                        <span>Questions: {test.questions?.length || 0}</span>
                        <span>•</span>
                        <span>Créé le: {new Date(test.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
<div className="flex gap-2 ml-4">
  <Link
    to={`/test-evaluation/${test._id}`}
    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
  >
    Voir Candidats
  </Link>
  <Link
    to={`/candidate-portal?testId=${test._id}`}
    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
  >
    Envoyer
  </Link>
  <button
    onClick={() => handleDeleteTest(test._id)}
    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
  >
    Supprimer
  </button>
</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestManager;