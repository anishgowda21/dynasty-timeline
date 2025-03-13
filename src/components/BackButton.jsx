import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * A simple back button that either:
 * - Goes back to the previous page if there's history
 * - Goes to home page if there's no history
 * - Shows nothing on the home page
 * - Always goes to home from settings
 */
const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show on home page
  if (location.pathname === '/') {
    return null;
  }
  
  // Function to handle back navigation
  const handleBack = () => {
    // Always go home from settings
    if (location.pathname === '/settings') {
      navigate('/');
      return;
    }
    
    // Check if we have history to go back
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      // No history, go to home
      navigate('/');
    }
  };
  
  return (
    <button
      onClick={handleBack}
      className="flex items-center text-gray-600 hover:text-dynasty-primary dark:text-gray-300 dark:hover:text-blue-400 mb-4"
      aria-label={window.history.length > 2 ? "Go back" : "Go home"}
    >
      <ArrowLeft className="mr-1 h-5 w-5" />
      <span>{window.history.length > 2 && location.pathname !== '/settings' ? 'Back' : 'Home'}</span>
    </button>
  );
};

export default BackButton;
