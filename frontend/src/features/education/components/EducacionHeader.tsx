import React from 'react';
import './EducacionHeader.css';

interface HeaderProps {
  category: string;
  title: string;
}

export const EducacionHeader: React.FC<HeaderProps> = ({ category, title }) => {
  return (
    <>
      {/* Forzamos la importación de la tipografía exacta del Advice */}
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600&display=swap');
      </style>
      
      <header className="edu-header-card">
        <div className="edu-header-content">
          <span className="edu-badge">{category}</span>
          <h1 className="edu-title">{title}</h1>
        </div>
      </header>
    </>
  );
};

export default EducacionHeader;