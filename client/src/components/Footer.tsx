import React from 'react';
import { Link } from 'wouter';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xl font-bold">DocQuiz</span>
            </div>
            <p className="text-neutral-400 text-sm mt-1">Convert documents to quizzes with ease</p>
          </div>
          
          <div className="flex space-x-6">
            <Link href="/privacy">
              <a className="text-neutral-400 hover:text-white transition">
                Privacy Policy
              </a>
            </Link>
            <Link href="/terms">
              <a className="text-neutral-400 hover:text-white transition">
                Terms of Service
              </a>
            </Link>
            <Link href="/help">
              <a className="text-neutral-400 hover:text-white transition">
                Help & Support
              </a>
            </Link>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-neutral-700 text-center text-neutral-500 text-sm">
          &copy; {new Date().getFullYear()} DocQuiz. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
