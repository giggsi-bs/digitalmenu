import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BypassAuth from "@/components/BypassAuth";

// This is a completely public starting page 
// that doesn't trigger authentication
export default function Start() {
  const navigate = useNavigate();

  useEffect(() => {
    // After a brief delay, navigate to the Home page
    const timer = setTimeout(() => {
      navigate("/Home");
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-600 text-white">
      <BypassAuth />
      <h1 className="text-3xl font-bold mb-4">גיגסי ספורט בר</h1>
      <p>טוען תפריט...</p>
    </div>
  );
}