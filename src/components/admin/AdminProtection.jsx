import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminProtection({ children, onAuthenticated }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'giggsiAdmin2024') {
      setIsAuthenticated(true);
      onAuthenticated && onAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "giggsi2024") {
      localStorage.setItem('adminAuth', 'giggsiAdmin2024');
      setIsAuthenticated(true);
      onAuthenticated && onAuthenticated(true);
    } else {
      setError("סיסמה שגויה");
    }
  };

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">גיגסי - ממשק ניהול</h1>
          <p className="mt-2 text-sm text-gray-600">הזן סיסמה כדי להיכנס</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="סיסמה"
              className="text-right"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
            >
              כניסה
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}