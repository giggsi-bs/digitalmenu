import React, { useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";

// This page creates a non-protected route
export default function NotAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Extract path from URL if any
    const urlParams = new URLSearchParams(location.search);
    const path = urlParams.get('path') || 'Home';
    
    // Navigate to the path
    navigate(`/${path}`);
  }, []);
  
  return (
    <div className="flex items-center justify-center h-screen">
      <h1>מעבר לתפריט...</h1>
    </div>
  );
}