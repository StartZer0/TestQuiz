import React from 'react';
import { Link, useLocation } from 'wouter';

const NavBar: React.FC = () => {
  const [location] = useLocation();

  return (
    <header className="bg-primary-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <Link href="/">
            <h1 className="text-2xl font-bold cursor-pointer">DocQuiz</h1>
          </Link>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/">
                <a className={`hover:text-white/80 transition font-medium ${location === '/' ? 'text-white' : 'text-white/90'}`}>
                  Home
                </a>
              </Link>
            </li>
            <li>
              <Link href="/my-quizzes">
                <a className={`hover:text-white/80 transition font-medium ${location === '/my-quizzes' ? 'text-white' : 'text-white/90'}`}>
                  My Quizzes
                </a>
              </Link>
            </li>
            <li>
              <Link href="/help">
                <a className={`hover:text-white/80 transition font-medium ${location === '/help' ? 'text-white' : 'text-white/90'}`}>
                  Help
                </a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
