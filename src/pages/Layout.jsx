
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home } from "lucide-react";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-redirect from root path
  useEffect(() => {
    if (location.pathname === '/') {
      window.location.href = '/Home';
    }
  }, [location.pathname]);

  // Handle login redirect
  useEffect(() => {
    // Detect if we're being redirected to login page
    const currentUrl = window.location.href;
    if (currentUrl.includes('login') || currentUrl.includes('auth')) {
      // Get target URL from query params if it exists
      const urlParams = new URLSearchParams(window.location.search);
      const targetUrl = urlParams.get('from_url') || urlParams.get('redirect') || '/Home';
      
      // Direct redirect to bypass login
      window.location.href = targetUrl;
    }
  }, [window.location.href]);

  const goToHome = () => {
    window.location.href = '/Home';
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
