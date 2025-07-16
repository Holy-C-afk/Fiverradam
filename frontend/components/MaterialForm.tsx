// components/MaterialForm.tsx

import { useState, useEffect, useCallback } from "react";
import api from "@/utils/api";

interface Material {
  id?: number;
  identifiant: string;
  plaque: string;
  type_materiel: string;
  statut: string;
  kilometrage?: number;
  date_controle_technique?: string;
  options?: string;
  responsable_id?: number;
}

export default function MaterialForm() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [formData, setFormData] = useState<Material>({
    identifiant: "",
    plaque: "",
    type_materiel: "",
    statut: "disponible",
    kilometrage: 0,
    date_controle_technique: "",
    options: "",
    responsable_id: undefined,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  // Fonction pour récupérer les matériels
  const fetchMaterials = useCallback(async () => {
    try {
      const response = await api.get("/materiels/");
      setMaterials(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement du matériel:", error);
    }
  }, []);

  // Fonction pour vérifier les mises à jour automatiques
  const checkForUpdates = useCallback(async () => {
    try {
      const response = await api.get("/materiels/events");
      const newUpdate = response.data.last_update;
      
      if (lastUpdate && newUpdate !== lastUpdate) {
        // Il y a eu une mise à jour, recharger les données
        await fetchMaterials();
      }
      
      setLastUpdate(newUpdate);
    } catch (error) {
      console.error("Erreur lors de la vérification des mises à jour:", error);
    }
  }, [lastUpdate, fetchMaterials]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // Polling pour les mises à jour automatiques toutes les 2 secondes
  useEffect(() => {
    const interval = setInterval(checkForUpdates, 2000);
    return () => clearInterval(interval);
  }, [checkForUpdates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await api.put(`/materiels/${editingId}`, formData);
      } else {
        const response = await api.post("/materiels/", formData);
        if (response.data.created) {
          // Material créé avec succès, mise à jour immédiate
          await fetchMaterials();
        }
      }
      
      resetForm();
      if (!editingId) {
        // Force refresh for new materials
        await fetchMaterials();
      }
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      if (error.response?.data?.detail) {
        alert("Erreur: " + error.response.data.detail);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (material: Material) => {
    setFormData({
      identifiant: material.identifiant,
      plaque: material.plaque,
      type_materiel: material.type_materiel,
      statut: material.statut,
      kilometrage: material.kilometrage || 0,
      date_controle_technique: material.date_controle_technique || "",
      options: material.options || "",
      responsable_id: material.responsable_id || undefined,
    });
    setEditingId(material.id || null);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce matériel ?")) {
      try {
        await api.delete(`/materiels/${id}`);
        await fetchMaterials();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      identifiant: "",
      plaque: "",
      type_materiel: "",
      statut: "disponible",
      kilometrage: 0,
      date_controle_technique: "",
      options: "",
      responsable_id: undefined,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Formulaire */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">
          {editingId ? "Modifier le matériel" : "Nouveau matériel"}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Identifiant
            </label>
            <input
              type="text"
              value={formData.identifiant}
              onChange={(e) => setFormData({ ...formData, identifiant: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plaque d'immatriculation
            </label>
            <input
              type="text"
              value={formData.plaque}
              onChange={(e) => setFormData({ ...formData, plaque: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de matériel
            </label>
            <select
              value={formData.type_materiel}
              onChange={(e) => setFormData({ ...formData, type_materiel: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner un type</option>
              <option value="CAMION">Camion</option>
              <option value="REMORQUE">Remorque</option>
              <option value="VOITURE">Voiture</option>
              <option value="EQUIPEMENT">Équipement</option>
              <option value="OUTIL">Outil</option>
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
              <option value="disponible">Disponible</option>
              <option value="en_service">En service</option>
              <option value="en_maintenance">En maintenance</option>
              <option value="hors_service">Hors service</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kilométrage
            </label>
            <input
              type="number"
              value={formData.kilometrage || 0}
              onChange={(e) => setFormData({ ...formData, kilometrage: parseInt(e.target.value) || 0 })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de contrôle technique
            </label>
            <input
              type="date"
              value={formData.date_controle_technique || ""}
              onChange={(e) => setFormData({ ...formData, date_controle_technique: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options / Notes
            </label>
            <textarea
              value={formData.options || ""}
              onChange={(e) => setFormData({ ...formData, options: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div className="md:col-span-2 lg:col-span-3 flex gap-2">
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

      {/* Liste du matériel */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Liste du matériel ({materials.length})</h3>
          <p className="text-sm text-gray-500 mt-1">
            Dernière mise à jour: {lastUpdate ? new Date(lastUpdate).toLocaleString() : "En attente..."}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Identifiant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Plaque
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kilométrage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {materials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {material.identifiant}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {material.plaque}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {material.type_materiel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      material.statut === 'disponible' 
                        ? 'bg-green-100 text-green-800' 
                        : material.statut === 'en_service'
                        ? 'bg-blue-100 text-blue-800'
                        : material.statut === 'en_maintenance'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {material.statut.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {material.kilometrage || 0} km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(material)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(material.id!)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Aucun matériel trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
