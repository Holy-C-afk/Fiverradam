// pages/index.tsx

import { useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { setToken } from "@/utils/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams({
      username : email,
      password : password,
});
      const response = await api.post("/auth/token", formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      const token = response.data.access_token;
      setToken(token);
      router.push("/dashboard");
    } catch (error: any) {
      setError("Erreur de connexion. Vérifiez vos identifiants.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">🚛 Billun</h1>
          <p className="text-gray-600">Connexion à votre espace</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Adresse email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
} 
