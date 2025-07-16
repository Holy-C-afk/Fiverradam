// components/SignalForm.tsx

import { useState, useEffect } from "react";
import api from "@/utils/api";

interface Signal {
  id?: number;
  titre: string;
  description: string;
  type_signal: string;
  priorite: string;
  statut: string;
  date_creation?: string;
  materiel_id?: number;
  user_id?: number;
}

export default function SignalForm() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [formData, setFormData] = useState<Signal>({
    titre: "",
    description: "",
    type_signal: "",
    priorite: "moyenne",
    statut: "ouvert",
    materiel_id: undefined,
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
    setLoading(true);

    try {
      if (editingId) {
        await api.put(`/anomalies/${editingId}`, formData);
      } else {
        await api.post("/anomalies/", formData);
      }
      
      resetForm();
      fetchSignals();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
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
      titre: "",
      description: "",
      type_signal: "",
      priorite: "moyenne",
      statut: "ouvert",
      materiel_id: undefined,
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
              Titre
            </label>
            <input
              type="text"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de signalement
            </label>
            <select
              value={formData.type_signal}
              onChange={(e) => setFormData({ ...formData, type_signal: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner un type</option>
              <option value="panne">Panne</option>
              <option value="maintenance">Maintenance</option>
              <option value="accident">Accident</option>
              <option value="probleme_technique">Problème technique</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priorité
            </label>
            <select
              value={formData.priorite}
              onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="basse">Basse</option>
              <option value="moyenne">Moyenne</option>
              <option value="haute">Haute</option>
              <option value="critique">Critique</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ouvert">Ouvert</option>
              <option value="en_cours">En cours</option>
              <option value="resolu">Résolu</option>
              <option value="ferme">Fermé</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matériel concerné (optionnel)
            </label>
            <select
              value={formData.materiel_id || ""}
              onChange={(e) => setFormData({ 
                ...formData, 
                materiel_id: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Aucun matériel spécifique</option>
              {materials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.nom} - {material.marque} {material.modele}
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>
          
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : editingId ? "Modifier" : "Créer"}
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
          <h3 className="text-lg font-semibold">Liste des signalements</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
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
                    {signal.titre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {signal.type_signal}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      signal.priorite === 'critique' 
                        ? 'bg-red-100 text-red-800' 
                        : signal.priorite === 'haute'
                        ? 'bg-orange-100 text-orange-800'
                        : signal.priorite === 'moyenne'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {signal.priorite}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      signal.statut === 'resolu' 
                        ? 'bg-green-100 text-green-800' 
                        : signal.statut === 'en_cours'
                        ? 'bg-blue-100 text-blue-800'
                        : signal.statut === 'ferme'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {signal.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {signal.date_creation ? new Date(signal.date_creation).toLocaleDateString() : '-'}
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
