

import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Settings } from "lucide-react";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to Home on first load if we're at root
  useEffect(() => {
    if (location.pathname === '/') {
      window.location.href = '/Home';
    }
  }, [location.pathname]);

  const goToHome = () => {
    window.location.href = '/Home';
  };

  const goToAdmin = () => {
    window.location.href = '/Admin';
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {children}
      
      <nav className="fixed bottom-0 right-0 left-0 bg-white border-t py-2 z-50">
        <div className="max-w-md mx-auto flex justify-around">
          <button 
            onClick={goToHome}
            className="flex flex-col items-center text-gray-600 hover:text-red-600"
          >
            <Home className="w-6 h-6" />
            <span className="text-sm">בית</span>
          </button>
          <button 
            onClick={goToAdmin}
            className="flex flex-col items-center text-gray-600 hover:text-red-600"
          >
            <Settings className="w-6 h-6" />
            <span className="text-sm">ניהול</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

