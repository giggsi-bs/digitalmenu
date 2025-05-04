import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function NetlifyHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Handle login redirects
    const currentUrl = window.location.href;
    if (currentUrl.includes('login?from_url=') || currentUrl.includes('auth?redirect=')) {
      const urlParams = new URLSearchParams(window.location.search);
      const targetUrl = urlParams.get('from_url') || urlParams.get('redirect');
      if (targetUrl) {
        window.location.href = targetUrl;
        return;
      }
    }
  }, []);
  
  return null; // This component doesn't render anything
}