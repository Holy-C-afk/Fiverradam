// components/ApkSection.tsx

import { useState } from "react";
import api from "@/utils/api";

export default function ApkSection() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // URL de téléchargement de l'APK (à adapter selon votre hébergement)
  const apkLink = "https://votre-serveur.com/billun-app.apk";

  const handleSendMail = async () => {
    const email = prompt("Entrer l'adresse email pour envoyer le lien de téléchargement APK :");
    if (!email) return;

    setLoading(true);
    setMessage("");

    try {
      await api.post("/contact/send-apk-link", {
        email: email,
        apk_link: apkLink
      });
      setMessage(`✅ Lien de téléchargement envoyé avec succès à ${email}`);
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      setMessage("❌ Erreur lors de l'envoi de l'email");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Créer un lien de téléchargement temporaire
    const link = document.createElement('a');
    link.href = apkLink;
    link.download = 'billun-app.apk';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Section principale */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          📱 Application Mobile Billun
        </h2>
        
        <div className="text-center space-y-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Application Android disponible
            </h3>
            <p className="text-blue-600">
              Téléchargez l'application mobile Billun pour gérer votre flotte depuis votre smartphone ou tablette.
            </p>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium text-lg flex items-center gap-2 transition-colors duration-200"
          >
            📥 Télécharger APK
          </button>
          
          <button
            onClick={handleSendMail}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-medium text-lg flex items-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Envoi..." : "✉️ Envoyer par email"}
          </button>
        </div>

        {/* Message de feedback */}
        {message && (
          <div className={`mt-4 p-4 rounded-lg text-center ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Instructions d'installation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">📋 Instructions d'installation</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
            <div>
              <h4 className="font-semibold">Autoriser les sources inconnues</h4>
              <p className="text-gray-600 text-sm">
                Allez dans Paramètres → Sécurité → Autoriser l'installation d'applications de sources inconnues
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
            <div>
              <h4 className="font-semibold">Télécharger l'APK</h4>
              <p className="text-gray-600 text-sm">
                Cliquez sur le bouton "Télécharger APK" ci-dessus ou recevez le lien par email
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
            <div>
              <h4 className="font-semibold">Installer l'application</h4>
              <p className="text-gray-600 text-sm">
                Ouvrez le fichier APK téléchargé et suivez les instructions d'installation
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
            <div>
              <h4 className="font-semibold">Se connecter</h4>
              <p className="text-gray-600 text-sm">
                Utilisez vos identifiants de connexion web pour accéder à l'application
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fonctionnalités */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">🚀 Fonctionnalités de l'app mobile</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">📍</span>
            <div>
              <h4 className="font-semibold">Géolocalisation</h4>
              <p className="text-sm text-gray-600">Suivi GPS en temps réel</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">📱</span>
            <div>
              <h4 className="font-semibold">Signalements</h4>
              <p className="text-sm text-gray-600">Créer des rapports instantanés</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">📊</span>
            <div>
              <h4 className="font-semibold">Tableaux de bord</h4>
              <p className="text-sm text-gray-600">Statistiques et analytics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">🔄</span>
            <div>
              <h4 className="font-semibold">Synchronisation</h4>
              <p className="text-sm text-gray-600">Données en temps réel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
