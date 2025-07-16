// components/Sidebar.tsx

import { useRouter } from "next/router";
import { logout } from "@/utils/auth";

const Sidebar = () => {
  const router = useRouter();

  const menu = [
    { label: "Utilisateurs", icon: "👤", path: "/dashboard?tab=users" },
    { label: "Matériel", icon: "🚚", path: "/dashboard?tab=materials" },
    { label: "Signalements", icon: "🛠️", path: "/dashboard?tab=signals" },
    { label: "APK", icon: "📱", path: "/dashboard?tab=apk" },
    { label: "Profil", icon: "⚙️", path: "/dashboard?tab=profile" },
  ];

  const handleLogout = () => {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
    }
  };

  return (
    <div className="flex flex-col bg-blue-700 text-white w-64 h-screen shadow-lg">
      <div className="p-6 border-b border-blue-600">
        <h1 className="text-2xl font-bold text-center">🚛 Billun</h1>
        <p className="text-blue-200 text-sm text-center mt-1">
          Gestion de flotte
        </p>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menu.map((item) => (
          <button
            key={item.label}
            onClick={() => router.push(item.path)}
            className="flex items-center gap-3 w-full text-left hover:bg-blue-600 p-3 rounded-lg transition-colors duration-200"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-blue-600">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-lg text-center transition-colors duration-200 font-medium"
        >
          🚪 Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
