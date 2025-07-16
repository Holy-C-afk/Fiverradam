// components/MaterialForm.tsx

import { useState, useEffect } from "react";
import api from "@/utils/api";

interface Material {
  id?: number;
  nom: string;
  type_materiel: string;
  marque: string;
  modele: string;
  numero_serie: string;
  date_acquisition: string;
  statut: string;
  description?: string;
}

export default function MaterialForm() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [formData, setFormData] = useState<Material>({
    nom: "",
    type_materiel: "",
    marque: "",
    modele: "",
    numero_serie: "",
    date_acquisition: "",
    statut: "actif",
    description: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

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
        await api.put(`/materiels/${editingId}`, formData);
      } else {
        await api.post("/materiels/", formData);
      }
      
      resetForm();
      fetchMaterials();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (material: Material) => {
    setFormData(material);
    setEditingId(material.id || null);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce matériel ?")) {
      try {
        await api.delete(`/materiels/${id}`);
        fetchMaterials();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      type_materiel: "",
      marque: "",
      modele: "",
      numero_serie: "",
      date_acquisition: "",
      statut: "actif",
      description: "",
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
              Nom
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
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
              <option value="camion">Camion</option>
              <option value="remorque">Remorque</option>
              <option value="equipement">Équipement</option>
              <option value="outil">Outil</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marque
            </label>
            <input
              type="text"
              value={formData.marque}
              onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modèle
            </label>
            <input
              type="text"
              value={formData.modele}
              onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de série
            </label>
            <input
              type="text"
              value={formData.numero_serie}
              onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date d'acquisition
            </label>
            <input
              type="date"
              value={formData.date_acquisition}
              onChange={(e) => setFormData({ ...formData, date_acquisition: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
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
              <option value="actif">Actif</option>
              <option value="maintenance">En maintenance</option>
              <option value="retire">Retiré</option>
            </select>
          </div>
          
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
          <h3 className="text-lg font-semibold">Liste du matériel</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Marque/Modèle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  N° Série
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
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
                    {material.nom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {material.type_materiel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {material.marque} {material.modele}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {material.numero_serie}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      material.statut === 'actif' 
                        ? 'bg-green-100 text-green-800' 
                        : material.statut === 'maintenance'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {material.statut}
                    </span>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
