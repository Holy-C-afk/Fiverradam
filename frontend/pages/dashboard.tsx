// pages/dashboard.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { isAuthenticated } from "@/utils/auth";
import Sidebar from "@/components/Sidebar";
import UserForm from "@/components/UserForm";
import MaterialForm from "@/components/MaterialForm";
import SignalForm from "@/components/SignalForm";
import ApkSection from "@/components/ApkSection";

export default function Dashboard() {
  const [tab, setTab] = useState("users");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/");
      return;
    }
    
    if (router.query.tab) {
      setTab(router.query.tab as string);
    }
    
    setLoading(false);
  }, [router.query, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {tab === "users" && "👤 Gestion des Utilisateurs"}
            {tab === "materials" && "🚚 Gestion du Matériel"}
            {tab === "signals" && "🛠️ Gestion des Signalements"}
            {tab === "apk" && "📱 Application Mobile"}
            {tab === "profile" && "⚙️ Mon Profil"}
          </h1>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          {tab === "users" && <UserForm />}
          {tab === "materials" && <MaterialForm />}
          {tab === "signals" && <SignalForm />}
          {tab === "apk" && <ApkSection />}
          {tab === "profile" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Mon profil</h2>
              <p className="text-gray-600">
                Fonctionnalité de modification de profil à venir...
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
