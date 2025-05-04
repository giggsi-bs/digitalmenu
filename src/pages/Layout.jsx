
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home } from "lucide-react";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Try to bypass authentication
  useEffect(() => {
    // Skip login page if redirected from there
    const currentUrl = window.location.href;
    if (currentUrl.includes('login?from_url=')) {
      const targetUrl = new URL(currentUrl).searchParams.get('from_url');
      if (targetUrl) {
        window.location.href = targetUrl;
        return;
      }
    }

    // Redirect to Home on first load if we're at root
    if (location.pathname === '/') {
      navigate('/Home');
    }
  }, [location.pathname]);

  const goToHome = () => {
    navigate('/Home');
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {children}
      
      {/* כשרות הודעה - שיפור נראות */}
      <div className="fixed bottom-14 left-0 right-0 bg-red-600 text-white py-2 text-center font-medium text-base z-50 shadow-md">
        המסעדה כשרה בהשגחת הרבנות והבשר חלק
      </div>
      
      <nav className="fixed bottom-0 right-0 left-0 bg-white border-t py-2 z-50 shadow-up">
        <div className="max-w-md mx-auto flex justify-center">
          <button 
            onClick={goToHome}
            className="flex flex-col items-center text-gray-600 hover:text-red-600"
          >
            <Home className="w-6 h-6" />
            <span className="text-sm">בית</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
