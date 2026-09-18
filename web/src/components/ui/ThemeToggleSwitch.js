"use client";
import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import './ThemeToggleSwitch.css';

const Cloud = ({ className, id }) => (
  <svg className={className} id={id} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 19c2.485 0 4.5-2.015 4.5-4.5 0-2.316-1.745-4.225-4.004-4.475A7.5 7.5 0 0 0 3.275 13.56 3.5 3.5 0 1 0 5 20.5h12.5Z" />
  </svg>
);

export default function ThemeToggleSwitch() {
  const { theme, toggleTheme, toggleStyle } = useTheme();
  
  return (
    <label className={`theme-switch style-${toggleStyle || 'sunset'}`} aria-label="Toggle Theme">
      <input 
        type="checkbox" 
        className="theme-input" 
        checked={theme === 'dark'}
        onChange={toggleTheme}
      />
      <div className="slider round">
        <div className="stars">
           <div className="star" id="star-1"></div>
           <div className="star" id="star-2"></div>
           <div className="star" id="star-3"></div>
           <div className="star" id="star-4"></div>
        </div>
        <Cloud className="cloud-light" id="cloud-1" />
        <Cloud className="cloud-light" id="cloud-2" />
        <Cloud className="cloud-dark" id="cloud-3" />
        <Cloud className="cloud-dark" id="cloud-4" />
        <div className="sun-moon">
          <div className="moon-dot" id="moon-dot-1"></div>
          <div className="moon-dot" id="moon-dot-2"></div>
          <div className="moon-dot" id="moon-dot-3"></div>
        </div>
      </div>
    </label>
  );
}
