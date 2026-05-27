import { IonContent, IonPage, IonIcon } from '@ionic/react';
import { Navbar, Footer, ProtocolsPanel } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import {
  folderOutline,
  calendarOutline,
  clipboardOutline,
  documentOutline
} from 'ionicons/icons';
import './ProtocolsPage.css';

type ProtocolFile = {
  id: string;
  name: string;
  url: string;
  path?: string;
  type?: string;
  size?: number | null;
  order: number;
};

type Protocolo = {
  id: string;

  titulo: string;

  descripcion: string;
  resumen?: string;

  fecha: string;
  fechaRaw?: string;

  categoria: string;

  archivoUrl?: string;
  archivo_url?: string;

  archivoNombre?: string;
  archivo_nombre?: string;

  archivoTipo?: string;
  archivo_tipo?: string;

  archivos?: ProtocolFile[];

  autor?: string | null;
  publicado_por?: string | null;
};

const API_URL = 'http://localhost:3000';

const normalizeFileUrl = (url?: string) => {
  if (!url) return '';

  if (
    url.startsWith('http') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }

  if (url.startsWith('/')) return `${API_URL}${url}`;

  return `${API_URL}/${url}`;
};

const getFileNameFromUrl = (url?: string) => {
  if (!url) return 'Documento';

  const parts = url.split('/');
  return parts[parts.length - 1] || 'Documento';
};

const formatFileType = (file?: ProtocolFile | null) => {
  const type = String(file?.type || '').toLowerCase();
  const name = String(file?.name || '').toLowerCase();

  if (type.includes('pdf') || name.endsWith('.pdf')) return 'PDF';
  if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) {
    return 'DOC';
  }

  if (type.includes('image') || /\.(png|jpg|jpeg|webp)$/i.test(name)) {
    return 'IMG';
  }

  return 'ARCHIVO';
};

export const ProtocolsPage: React.FC = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  const [protocolos, setProtocolos] = useState<Protocolo[]>([]);

  const normalizeFiles = (protocol: Protocolo): ProtocolFile[] => {
    const filesFromArray = Array.isArray(protocol.archivos)
      ? protocol.archivos
      : [];

    const normalizedFiles = filesFromArray
      .filter((file) => file?.url || file?.path)
      .map((file, index) => {
        const url = file.url || file.path || '';

        return {
          id: String(file.id || `${protocol.id}-archivo-${index + 1}`),
          name: file.name || getFileNameFromUrl(url),
          url,
          path: file.path || url,
          type: file.type || '',
          size: typeof file.size === 'number' ? file.size : null,
          order: index + 1
        };
      });

    if (normalizedFiles.length > 0) {
      return normalizedFiles;
    }

    const fallbackUrl = protocol.archivoUrl || protocol.archivo_url || '';

    if (!fallbackUrl) return [];

    return [
      {
        id: `${protocol.id}-archivo-principal`,
        name:
          protocol.archivoNombre ||
          protocol.archivo_nombre ||
          getFileNameFromUrl(fallbackUrl),
        url: fallbackUrl,
        path: fallbackUrl,
        type: protocol.archivoTipo || protocol.archivo_tipo || '',
        size: null,
        order: 1
      }
    ];
  };

  const normalizeProtocol = (protocol: Protocolo): Protocolo => {
    const files = normalizeFiles(protocol);
    const mainFile = files[0];

    return {
      ...protocol,
      id: String(protocol.id),
      titulo: protocol.titulo || 'Protocolo institucional',
      descripcion: protocol.descripcion || protocol.resumen || '',
      fecha: protocol.fecha || '',
      categoria: protocol.categoria || 'Ciberseguridad',
      archivoUrl: protocol.archivoUrl || protocol.archivo_url || mainFile?.url || '',
      archivoNombre:
        protocol.archivoNombre ||
        protocol.archivo_nombre ||
        mainFile?.name ||
        '',
      archivos: files
    };
  };

  const cargarProtocolos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/protocolos`);

      if (!response.ok) {
        throw new Error('No se pudieron cargar los protocolos');
      }

      const data = await response.json();

      setProtocolos(
        Array.isArray(data)
          ? data.map((protocol) => normalizeProtocol(protocol))
          : []
      );
    } catch (error) {
      console.error('Error al cargar protocolos:', error);
      setProtocolos([]);
    }
  };

  useEffect(() => {
    cargarProtocolos();

    const handler = () => cargarProtocolos();
    window.addEventListener('protocolos-updated', handler);

    return () => {
      window.removeEventListener('protocolos-updated', handler);
    };
  }, []);

  const getMainFile = (protocolo: Protocolo) => {
    const files = normalizeFiles(protocolo);

    return files[0] || null;
  };

  const openFile = (file?: ProtocolFile | null) => {
    if (!file?.url) {
      alert('Este archivo no está disponible.');
      return;
    }

    window.open(normalizeFileUrl(file.url), '_blank');
  };

  const downloadFile = (file?: ProtocolFile | null) => {
    if (!file?.url) {
      alert('Este archivo no está disponible.');
      return;
    }

    const link = document.createElement('a');

    link.href = normalizeFileUrl(file.url);
    link.download = file.name || 'protocolo';
    link.target = '_blank';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewFile = (protocolo: Protocolo) => {
    openFile(getMainFile(protocolo));
  };

  const handleDownloadFile = (protocolo: Protocolo) => {
    downloadFile(getMainFile(protocolo));
  };

  return (
    <IonPage>
      <Navbar />

      <IonContent fullscreen className="protocolos-content">
        <div className="protocolos-shell">
          <header className="protocolos-header">
            <div>
              <h1>Protocolos institucionales</h1>

              <p>
                Documentación oficial publicada por el equipo TIC.
              </p>
            </div>
          </header>

          {isAdmin && (
            <section style={{ marginBottom: 24 }}>
              <ProtocolsPanel />
            </section>
          )}

          <section className="protocolos-grid">
            {protocolos.length === 0 ? (
              <p>No hay protocolos disponibles.</p>
            ) : (
              protocolos.map((p) => {
                const mainFile = getMainFile(p);
                const files = normalizeFiles(p);
                const fileCount = files.length;

                return (
                  <article key={p.id} className="protocolo-card">
                    <div className="protocolo-card-header">
                      <div className="icon-clipboard-wrapper">
                        <IonIcon icon={clipboardOutline} />
                      </div>

                      <span className="badge-pdf">
                        {fileCount > 1
                          ? `${fileCount} ARCHIVOS`
                          : formatFileType(mainFile)}
                      </span>
                    </div>

                    <div className="protocolo-card-meta">
                      <div className="meta-item">
                        <IonIcon icon={folderOutline} />
                        <span>{p.categoria}</span>
                      </div>

                      <div className="meta-item">
                        <IonIcon icon={calendarOutline} />
                        <span>{p.fecha || 'Sin fecha'}</span>
                      </div>

                      {mainFile?.name && (
                        <div className="meta-item">
                          <IonIcon icon={documentOutline} />
                          <span>{mainFile.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="protocolo-card-body">
                      <h2>{p.titulo}</h2>
                      <p>{p.descripcion}</p>
                    </div>

                    {files.length > 1 && (
                      <div className="protocolo-files-preview">
                        {files.map((file, index) => (
                          <button
                            key={file.id}
                            type="button"
                            className="protocolo-file-chip"
                            onClick={() => openFile(file)}
                          >
                            <IonIcon icon={documentOutline} />
                            <span>
                              {index + 1}. {file.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="protocolo-card-actions">
                      <button
                        type="button"
                        className="btn-view-pdf"
                        onClick={() => handleViewFile(p)}
                      >
                        Ver archivo
                      </button>

                      <button
                        type="button"
                        className="btn-download"
                        onClick={() => handleDownloadFile(p)}
                      >
                        Descargar
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </section>

          <section className="protocolos-cta">
            <div className="cta-icon">📋</div>

            <div>
              <strong>¿Necesitas un documento adicional?</strong>
              <p>Contacta al equipo TIC.</p>
            </div>

            <button className="cta-button" type="button">
              Solicitar
            </button>
          </section>
        </div>

        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default ProtocolsPage;