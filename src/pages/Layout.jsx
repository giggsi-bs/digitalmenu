
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home } from "lucide-react";
import NetlifyHandler from "./components/NetlifyHandler";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-redirect from root path
  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/Home');  // שינינו ל-H גדולה
    }
  }, [location.pathname]);

  const goToHome = () => {
    navigate('/Home');  // שינינו ל-H גדולה
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <NetlifyHandler />
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

      {/* Script injection for Netlify redirects */}
      <script dangerouslySetInnerHTML={{ __html: `
        // Check if we're on Netlify
        if (window.location.hostname.includes('netlify')) {
          // If we're being redirected to login page
          if (window.location.href.includes('login') || window.location.href.includes('auth')) {
            const urlParams = new URLSearchParams(window.location.search);
            const targetUrl = urlParams.get('from_url') || urlParams.get('redirect') || '/Home';
            window.location.replace(targetUrl);
          }
        }
      `}} />
    </div>
  );
}
