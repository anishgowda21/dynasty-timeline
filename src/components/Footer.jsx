import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import React from "react";

const Footer = () => {
  const socialLinks = [
    {
      icon: <Github size={20} />,
      href: "https://github.com/anishgowda21",
      label: "GitHub"
    },
    {
      icon: <Twitter size={20} />,
      href: "https://twitter.com/gowda_anish21",
      label: "Twitter"
    },
    {
      icon: <Mail size={20} />,
      href: "mailto:simplecomplexthinker@protonmail.com",
      label: "Email"
    }
  ];

  return (
    <footer className="bg-gray-800 text-white py-4 mt-12 dark:bg-gray-950">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <p className="text-xl font-bold">
              Dynasty Timeline
            </p>
            <p className="mt-2 text-sm text-gray-300">
              &copy; {new Date().getFullYear()} All rights reserved
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <p className="mb-3 text-sm font-medium">
              Made with <span className="text-red-400">❤️</span> by{" "}
              <a
                href="https://github.com/anishgowda21/dynasty-timeline"
                className="text-dynasty-primary hover:text-dynasty-primary-light transition-colors hover:underline font-semibold"
              >
                Anish
              </a>
            </p>
            
            <div className="flex gap-4 mt-2">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-xs text-gray-400">
          <p>Explore historical dynasties across time and civilizations</p>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;