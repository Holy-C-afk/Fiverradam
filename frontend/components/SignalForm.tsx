// components/SignalForm.tsx

import { useState, useEffect } from "react";
import api from "@/utils/api";

interface Signal {
  id?: number;
  materiel_id: number;
  description: string;
  photo_url?: string;
  date_signalement?: string;
}

export default function SignalForm() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [formData, setFormData] = useState<Signal>({
    materiel_id: 0,
    description: "",
    photo_url: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSignals();
    fetchMaterials();
  }, []);

  const fetchSignals = async () => {
    try {
      const response = await api.get("/anomalies/");
      setSignals(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des signalements:", error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await api.get("/materiels/");
      setMaterials(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement du matériel:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client
    if (formData.materiel_id === 0) {
      alert("Veuillez sélectionner un matériel");
      return;
    }
    
    if (!formData.description.trim()) {
      alert("Veuillez saisir une description");
      return;
    }
    
    setLoading(true);

    try {
      // Préparer les données à envoyer (ne pas envoyer photo_url si vide)
      const dataToSend = {
        materiel_id: formData.materiel_id,
        description: formData.description.trim(),
        ...(formData.photo_url && formData.photo_url.trim() && { photo_url: formData.photo_url.trim() })
      };
      
      if (editingId) {
        await api.put(`/anomalies/${editingId}`, dataToSend);
      } else {
        await api.post("/anomalies/", dataToSend);
      }
      
      resetForm();
      fetchSignals();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de l'enregistrement. Veuillez vérifier les données saisies.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (signal: Signal) => {
    setFormData(signal);
    setEditingId(signal.id || null);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce signalement ?")) {
      try {
        await api.delete(`/anomalies/${id}`);
        fetchSignals();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      materiel_id: 0,
      description: "",
      photo_url: "",
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Formulaire */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">
          {editingId ? "Modifier le signalement" : "Nouveau signalement"}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matériel concerné *
            </label>
            <select
              value={formData.materiel_id}
              onChange={(e) => setFormData({ ...formData, materiel_id: parseInt(e.target.value) })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value={0}>Sélectionner un matériel</option>
              {materials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.identifiant} - {material.type_materiel} ({material.plaque})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Photo (optionnel)
            </label>
            <input
              type="url"
              value={formData.photo_url || ""}
              onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/photo.jpg"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description de l'anomalie *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
              placeholder="Décrivez l'anomalie détectée..."
            />
          </div>
          
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : editingId ? "Modifier" : "Signaler l'anomalie"}
            </button>
            
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Liste des signalements */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Anomalies signalées</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Matériel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date de signalement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {signals.map((signal) => (
                <tr key={signal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{signal.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {materials.find(m => m.id === signal.materiel_id)?.identifiant || `ID: ${signal.materiel_id}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {signal.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {signal.date_signalement ? new Date(signal.date_signalement).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(signal)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(signal.id!)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
