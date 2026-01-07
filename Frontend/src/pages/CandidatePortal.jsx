import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { sendTestAPI, testAPI, candidateTestAPI } from '../services/api';

const CandidatePortal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const testIdFromUrl = queryParams.get('testId');

  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(testIdFromUrl || '');
  const [candidateInfo, setCandidateInfo] = useState({
    name: '',
    email: ''
  });
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [candidateTests, setCandidateTests] = useState([]);
  const [activeTab, setActiveTab] = useState('send'); // 'send' or 'history'

  useEffect(() => {
    fetchTests();
    fetchCandidateTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await testAPI.getAll();
      if (response.data.success) {
        setTests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const fetchCandidateTests = async () => {
    try {
      const response = await candidateTestAPI.getAll();
      if (response.data.success) {
        setCandidateTests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching candidate tests:', error);
    }
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await sendTestAPI.send({
        testId: selectedTest,
        candidateName: candidateInfo.name,
        candidateEmail: candidateInfo.email,
        expiresInHours: expiresInHours
      });

      if (response.data.success) {
        setGeneratedLink(response.data.data.testLink);
        fetchCandidateTests(); // Refresh list
        alert('Test créé avec succès! Copiez le lien et envoyez-le au candidat.');
      }
    } catch (error) {
      console.error('Error sending test:', error);
      alert('Erreur lors de la création du test');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Lien copié dans le presse-papier!');
  };

  const getStatusBadge = (status) => {
    const badges = {
      'sent': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'expired': 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Portail Candidats</h1>
          <p className="text-gray-600">Envoyez des tests et suivez les résultats</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('send')}
            className={`px-4 py-2 font-medium ${activeTab === 'send' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Envoyer un Test
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Historique des Tests
          </button>
        </div>

        {/* Send Test Tab */}
        {activeTab === 'send' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Envoyer un Test</h2>
              <form onSubmit={handleSendTest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sélectionner un Test</label>
                  <select
                    value={selectedTest}
                    onChange={(e) => setSelectedTest(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Choisir un test...</option>
                    {tests.map((test) => (
                      <option key={test._id} value={test._id}>
                        {test.title} - {test.jobTitle} ({test.questions?.length || 0} questions)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Candidat</label>
                    <input
                      type="text"
                      value={candidateInfo.name}
                      onChange={(e) => setCandidateInfo({...candidateInfo, name: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email du Candidat</label>
                    <input
                      type="email"
                      value={candidateInfo.email}
                      onChange={(e) => setCandidateInfo({...candidateInfo, email: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expire dans (heures): {expiresInHours}h
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="168" // 7 jours
                    value={expiresInHours}
                    onChange={(e) => setExpiresInHours(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1h</span>
                    <span>24h</span>
                    <span>48h</span>
                    <span>72h</span>
                    <span>168h (7j)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedTest}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
                >
                  {loading ? 'Création en cours...' : 'Créer et Envoyer le Test'}
                </button>
              </form>

              {/* Generated Link */}
              {generatedLink && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="font-medium text-green-800 mb-2">✅ Test créé avec succès!</h3>
                  <p className="text-green-700 mb-2">Envoyez ce lien unique au candidat:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={generatedLink}
                      readOnly
                      className="flex-1 p-2 border border-green-300 rounded bg-white"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedLink)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                      Copier
                    </button>
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    Ce lien expirera dans {expiresInHours} heure(s)
                  </p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">📧 Envoi du Test</h3>
                  <ul className="text-blue-700 space-y-1 text-sm">
                    <li>• Sélectionnez le test à envoyer</li>
                    <li>• Entrez les informations du candidat</li>
                    <li>• Définissez la durée de validité du lien</li>
                    <li>• Copiez le lien généré et envoyez-le au candidat</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">⏱️ Durée du Test</h3>
                  <p className="text-green-700 text-sm">
                    Le candidat dispose de la durée définie dans le test pour compléter l'examen.
                    Une fois le lien expiré, il ne pourra plus y accéder.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-800 mb-2">📊 Suivi des Résultats</h3>
                  <p className="text-purple-700 text-sm">
                    Consultez l'onglet "Historique" pour voir les résultats des tests envoyés,
                    les scores obtenus et le statut de chaque candidat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-md">
            {candidateTests.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 text-4xl mb-4">📨</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun test envoyé</h3>
                <p className="text-gray-600">Envoyez votre premier test à un candidat</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidat</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Envoyé le</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {candidateTests.map((ct) => (
                      <tr key={ct._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{ct.candidateName}</div>
                            <div className="text-sm text-gray-500">{ct.candidateEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{ct.test?.title || 'Test supprimé'}</div>
                          <div className="text-xs text-gray-500">{ct.totalQuestions} questions</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(ct.status)}`}>
                            {ct.status === 'sent' && 'Envoyé'}
                            {ct.status === 'in-progress' && 'En cours'}
                            {ct.status === 'completed' && 'Complété'}
                            {ct.status === 'expired' && 'Expiré'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {ct.status === 'completed' ? (
                            <span className="font-medium text-gray-900">
                              {ct.score}/{ct.totalQuestions} ({Math.round((ct.score/ct.totalQuestions)*100)}%)
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(ct.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {ct.status === 'completed' && (
                            <button
                              onClick={() => navigate(`/test-results/${ct._id}`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Voir résultats
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidatePortal;