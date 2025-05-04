import React, { useEffect } from 'react';

// This component handles authentication bypass
export default function BypassAuth() {
  useEffect(() => {
    // Function to check for login redirects
    const checkForLoginRedirect = () => {
      const currentUrl = window.location.href;
      if (currentUrl.includes('login') || currentUrl.includes('auth')) {
        const urlParams = new URLSearchParams(window.location.search);
        const targetUrl = urlParams.get('from_url') || urlParams.get('redirect') || '/Home';
        console.log("BypassAuth: Detected login redirect, going to:", targetUrl);
        window.location.replace(targetUrl);
        return true;
      }
      return false;
    };
    
    // Run check immediately
    const didRedirect = checkForLoginRedirect();
    
    // If we didn't redirect, set up interval to check periodically
    if (!didRedirect) {
      const intervalId = setInterval(checkForLoginRedirect, 1000);
      return () => clearInterval(intervalId);
    }
  }, []);
  
  return null; // This component doesn't render anything
}