import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-12 dark:bg-gray-950">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Dynasty Timeline</p>
      </div>
    </footer>
  );
};

export default Footer;
