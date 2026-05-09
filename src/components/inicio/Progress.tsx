import './Progress.css';

export const Progress: React.FC = () => {
  const skills = [
    { name: 'Phishing', value: 45 },
    { name: 'Contraseñas seguras', value: 37 },
    { name: 'Protección de datos', value: 77 },
    { name: 'Redes WiFi', value: 29 },
  ];

  return (
    <div className="progress-container">
      <h3>CONOCIMIENTO EN CIBERSEGURIDAD</h3>
      <p>Tu progreso global a través de los módulos y diagnósticos.</p>
      
      {skills.map((skill) => (
        <div key={skill.name} className="progress-row">
          <span className="skill-name">{skill.name}</span>
          <div className="bar-wrapper">
            <div className="bar-bg">
              <div className="bar-fill" style={{ width: `${skill.value}%` }}></div>
            </div>
            <span className="skill-perc">{skill.value}%</span>
          </div>
        </div>
      ))}
      
      <button className="btn-reforzar">Reforzar</button>
    </div>
  );
};

export default Progress;