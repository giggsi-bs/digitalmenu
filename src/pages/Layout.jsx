
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-redirect logic
  useEffect(() => {
    // Bypass Netlify login redirects
    if (document) {
      // Add event listener for storage changes
      const checkUrl = () => {
        const currentUrl = window.location.href;
        if (currentUrl.includes('login') || currentUrl.includes('auth')) {
          const urlParams = new URLSearchParams(window.location.search);
          const targetUrl = urlParams.get('from_url') || urlParams.get('redirect') || '/Home';
          console.log("Redirecting from login page to:", targetUrl);
          window.location.replace(targetUrl);
        }
      };

      // Run immediately
      checkUrl();
      
      // Also set a timer to check periodically (handle post-login redirect)
      const intervalId = setInterval(checkUrl, 500);
      
      // Clean up
      return () => clearInterval(intervalId);
    }
  }, []);

  // Regular navigation
  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/Start'); // Go to Start page which doesn't need auth
    }
  }, [location.pathname, navigate]);

  const goToHome = () => {
    navigate('/Home');
  };

  // Don't show layout for Start or NotAuth pages
  if (currentPageName === 'Start' || currentPageName === 'NotAuth') {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {children}
      
      {/* כשרות הודעה */}
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
        // Netlify login bypass
        function checkForLoginRedirect() {
          if (window.location.href.includes('login') || window.location.href.includes('auth')) {
            const urlParams = new URLSearchParams(window.location.search);
            const targetUrl = urlParams.get('from_url') || urlParams.get('redirect') || '/Home';
            console.log("Script detected login page, redirecting to:", targetUrl);
            window.location.replace(targetUrl);
            return true;
          }
          return false;
        }
        
        // Run immediately
        checkForLoginRedirect();
        
        // Also run periodically
        setInterval(checkForLoginRedirect, 500);
      `}} />
    </div>
  );
}
