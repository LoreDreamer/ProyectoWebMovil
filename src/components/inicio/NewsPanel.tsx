import './NewsPanel.css';

export const NewsPanel: React.FC = () => (
  <div className="news-panel">
    <h3>Novedades</h3>
    <p>Actividades y comunicados recientes del equipo TIC.</p>
    
    <div className="news-item">
      <div className="news-date">MAR <span>2</span></div>
      <div className="news-text">
        <strong>Capacitación:</strong>
        <p>Gestión segura de correos...</p>
      </div>
    </div>

    <div className="news-item">
      <div className="news-date">MAR <span>18</span></div>
      <div className="news-text">
        <strong>Capacitación:</strong>
        <p>Gestión segura de correos...</p>
      </div>
    </div>
  </div>
);

export default NewsPanel;