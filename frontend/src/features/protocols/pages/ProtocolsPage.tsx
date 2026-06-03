import React, { useEffect, useMemo, useState } from 'react';
import {
  IonContent,
  IonIcon,
  IonPage,
  IonSearchbar
} from '@ionic/react';
import {
  documentTextOutline,
  folderOpenOutline,
  imageOutline,
  openOutline,
  shieldCheckmarkOutline,
  timeOutline
} from 'ionicons/icons';
import {
  Navbar,
  Footer,
  ProtocolsPanel
} from '@/components';
import { useAuth } from '@/context/AuthContext';

import './ProtocolsPage.css';
import { API_URL } from '@/shared/api/apiClient';

type ProtocolCategory = 'Todos' | 'Ciberseguridad' | 'Teletrabajo' | 'Atencion Ciudadana';

interface ProtocolFile {
  id: string;
  name: string;
  url: string;
  path?: string;
  type?: string;
  size?: number | null;
  order: number;
}

interface Protocol {
  id: string;
  titulo: string;
  descripcion?: string;
  resumen?: string;
  fecha?: string;
  fechaOriginal?: string;
  categoria?: string;
  archivoUrl?: string;
  archivo_url?: string;
  archivoNombre?: string;
  archivo_nombre?: string;
  archivoTipo?: string;
  archivo_tipo?: string;
  archivos?: ProtocolFile[];
}


const CATEGORIES: ProtocolCategory[] = [
  'Todos',
  'Ciberseguridad',
  'Teletrabajo',
  'Atencion Ciudadana'
];

const normalizeCategory = (value?: string) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized.includes('teletrabajo')) return 'Teletrabajo';
  if (normalized.includes('atencion') || normalized.includes('ciudadan')) {
    return 'Atencion Ciudadana';
  }

  return 'Ciberseguridad';
};

const buildFileUrl = (url?: string) => {
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

const getCategoryLabel = (category?: string) => {
  const normalized = normalizeCategory(category);

  if (normalized === 'Atencion Ciudadana') return 'Atención Ciudadana';

  return normalized;
};

const getCategoryClass = (category?: string) => {
  const normalized = normalizeCategory(category)
    .toLowerCase()
    .replace(/\s+/g, '-');

  return `protocol-category-${normalized}`;
};

const getProtocolAvailableFiles = (protocol: Protocol): ProtocolFile[] => {
  const files: ProtocolFile[] = [];

  if (protocol.archivoUrl) {
    files.push({
      id: `main-${protocol.id}`,
      name: protocol.archivoNombre || 'Documento principal',
      url: protocol.archivoUrl,
      path: protocol.archivoUrl,
      type: protocol.archivoTipo || protocol.archivo_tipo || '',
      size: null,
      order: 0
    });
  }

  (protocol.archivos || []).forEach((file, index) => {
    if (!file.url && !file.path) return;

    files.push({
      ...file,
      id: file.id || `${protocol.id}-${index + 1}`,
      name: file.name || `Archivo ${index + 1}`,
      url: buildFileUrl(file.url || file.path || ''),
      path: file.path || file.url || '',
      type: file.type || '',
      size: typeof file.size === 'number' ? file.size : null,
      order: index + 1
    });
  });

  const uniqueFiles = new Map<string, ProtocolFile>();

  files.forEach((file) => {
    const key = file.url || file.path || file.name;

    if (!key) return;

    if (!uniqueFiles.has(key)) {
      uniqueFiles.set(key, file);
    }
  });

  return Array.from(uniqueFiles.values());
};

const getFileTypeLabel = (file: ProtocolFile) => {
  const value = `${file.type || ''} ${file.name || ''} ${file.url || ''}`
    .toLowerCase();

  if (value.includes('pdf')) return 'PDF';
  if (
    value.includes('image') ||
    value.includes('.png') ||
    value.includes('.jpg') ||
    value.includes('.jpeg') ||
    value.includes('.webp')
  ) {
    return 'Imagen';
  }

  return 'Archivo';
};

const getFileIcon = (file: ProtocolFile) => {
  return getFileTypeLabel(file) === 'Imagen'
    ? imageOutline
    : documentTextOutline;
};

export const ProtocolsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<ProtocolCategory>('Todos');
  const [isLoading, setIsLoading] = useState(false);

  const normalizeProtocol = (protocol: Protocol): Protocol => {
    const files = Array.isArray(protocol.archivos)
      ? protocol.archivos.filter((file) => file?.url || file?.path)
      : [];

    const mainFileUrl =
      protocol.archivoUrl ||
      protocol.archivo_url ||
      files[0]?.url ||
      files[0]?.path ||
      '';

    const mainFileName =
      protocol.archivoNombre ||
      protocol.archivo_nombre ||
      files[0]?.name ||
      'Documento';

    return {
      ...protocol,
      id: String(protocol.id),
      titulo: protocol.titulo || 'Protocolo institucional',
      descripcion: protocol.descripcion || protocol.resumen || '',
      categoria: normalizeCategory(protocol.categoria),
      archivoUrl: buildFileUrl(mainFileUrl),
      archivoNombre: mainFileName,
      archivos: files.map((file, index) => ({
        ...file,
        id: String(file.id || `${index + 1}-${file.url || file.path}`),
        name: file.name || `archivo-${index + 1}`,
        url: buildFileUrl(file.url || file.path || ''),
        path: file.path || file.url || '',
        order: index + 1
      }))
    };
  };

  const loadProtocols = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/api/protocolos`);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error('Error backend /api/protocolos:', data);

        throw new Error(
          data?.message ||
            data?.error ||
            'No se pudieron cargar los protocolos'
        );
      }

      const normalizedProtocols = Array.isArray(data)
        ? data.map((protocol) => normalizeProtocol(protocol))
        : [];

      setProtocols(normalizedProtocols);
    } catch (error) {
      console.error('Error al cargar protocolos:', error);
      setProtocols([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProtocols();

    const handler = () => loadProtocols();
    window.addEventListener('protocolos-updated', handler);

    return () => {
      window.removeEventListener('protocolos-updated', handler);
    };
  }, []);

  const filteredProtocols = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return protocols.filter((protocol) => {
      const category = normalizeCategory(protocol.categoria);

      const matchesCategory =
        selectedCategory === 'Todos' || category === selectedCategory;

      const matchesSearch =
        !search ||
        protocol.titulo.toLowerCase().includes(search) ||
        String(protocol.descripcion || '').toLowerCase().includes(search) ||
        String(protocol.categoria || '').toLowerCase().includes(search) ||
        String(protocol.archivoNombre || '').toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [protocols, searchTerm, selectedCategory]);

  const totalFiles = protocols.reduce(
    (total, protocol) => total + (protocol.archivos?.length || 0),
    0
  );

  const totalCybersecurity = protocols.filter(
    (protocol) => normalizeCategory(protocol.categoria) === 'Ciberseguridad'
  ).length;

  const totalTelework = protocols.filter(
    (protocol) => normalizeCategory(protocol.categoria) === 'Teletrabajo'
  ).length;

  const totalCitizenCare = protocols.filter(
    (protocol) => normalizeCategory(protocol.categoria) === 'Atencion Ciudadana'
  ).length;

  return (
    <IonPage>
      <Navbar />

      <IonContent className="protocols-content-page">
        <div className="protocols-shell">
          <section className="protocols-page-heading">
            <div>
              <span className="protocols-kicker">
                Documentos institucionales
              </span>

              <h1>Protocolos municipales</h1>

              <p>
                Revisa documentos oficiales, guías y protocolos publicados para
                orientar buenas prácticas digitales y procedimientos municipales.
              </p>
            </div>
          </section>

          {isAdmin && (
            <section className="protocols-admin-section">
              <ProtocolsPanel />
            </section>
          )}

          <section className="protocols-section protocols-summary-section">
            <div className="protocols-summary-grid">
              <article className="protocol-summary-card">
                <div className="protocol-summary-icon">
                  <IonIcon icon={documentTextOutline} />
                </div>

                <div>
                  <span>Total protocolos</span>
                  <strong>{protocols.length}</strong>
                </div>
              </article>

              <article className="protocol-summary-card">
                <div className="protocol-summary-icon">
                  <IonIcon icon={folderOpenOutline} />
                </div>

                <div>
                  <span>Archivos disponibles</span>
                  <strong>{totalFiles}</strong>
                </div>
              </article>

              <article className="protocol-summary-card">
                <div className="protocol-summary-icon">
                  <IonIcon icon={shieldCheckmarkOutline} />
                </div>

                <div>
                  <span>Ciberseguridad</span>
                  <strong>{totalCybersecurity}</strong>
                </div>
              </article>
            </div>
          </section>

          <section className="protocols-section">
            <div className="protocols-section-header">
              <div>
                <span className="section-eyebrow">Biblioteca</span>
                <h2>Protocolos disponibles</h2>
                <p>
                  Busca por título, descripción, categoría o nombre del archivo.
                </p>
              </div>

              <IonSearchbar
                value={searchTerm}
                placeholder="Buscar protocolo..."
                onIonChange={(e) => setSearchTerm(e.detail.value || '')}
                mode="ios"
                className="protocols-searchbar"
              />
            </div>

            <div className="protocols-category-filters">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={
                    selectedCategory === category
                      ? 'protocol-filter-chip protocol-filter-chip-active'
                      : 'protocol-filter-chip'
                  }
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'Atencion Ciudadana'
                    ? 'Atención Ciudadana'
                    : category}
                </button>
              ))}
            </div>

            <div className="protocols-category-overview">
              <div>
                <span>Ciberseguridad</span>
                <strong>{totalCybersecurity}</strong>
              </div>

              <div>
                <span>Teletrabajo</span>
                <strong>{totalTelework}</strong>
              </div>

              <div>
                <span>Atención Ciudadana</span>
                <strong>{totalCitizenCare}</strong>
              </div>
            </div>

            {isLoading ? (
              <div className="protocol-empty-state">
                Cargando protocolos...
              </div>
            ) : filteredProtocols.length === 0 ? (
              <div className="protocol-empty-state">
                No hay protocolos disponibles para esta búsqueda.
              </div>
            ) : (
              <div className="protocols-card-grid">
                {filteredProtocols.map((protocol) => (
                  <article key={protocol.id} className="protocol-public-card">
                    <div className="protocol-public-card-top">
                      <div className="protocol-document-icon">
                        <IonIcon icon={documentTextOutline} />
                      </div>

                      <span
                        className={`protocol-category-badge ${getCategoryClass(
                          protocol.categoria
                        )}`}
                      >
                        {getCategoryLabel(protocol.categoria)}
                      </span>
                    </div>

                    <div className="protocol-public-card-body">
                      <h3>{protocol.titulo}</h3>

                      <p>
                        {protocol.descripcion ||
                          'Documento institucional disponible para consulta.'}
                      </p>
                    </div>

                    <div className="protocol-public-meta">
                      <span>
                        <IonIcon icon={timeOutline} />
                        {protocol.fecha || 'Sin fecha'}
                      </span>

                      <span>
                        <IonIcon icon={folderOpenOutline} />
                        {protocol.archivos?.length || 0} archivo(s)
                      </span>
                    </div>

                    <div className="protocol-files-box">
                      <div className="protocol-files-header">
                        <strong>Archivos disponibles</strong>
                        <span>
                          {getProtocolAvailableFiles(protocol).length} archivo(s)
                        </span>
                      </div>

                      {getProtocolAvailableFiles(protocol).length === 0 ? (
                        <div className="protocol-file-empty">
                          Sin archivos disponibles
                        </div>
                      ) : (
                        <div className="protocol-files-list">
                          {getProtocolAvailableFiles(protocol).map((file) => (
                            <a
                              key={file.id}
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="protocol-file-link"
                            >
                              <div className="protocol-file-icon">
                                <IonIcon icon={getFileIcon(file)} />
                              </div>

                              <div className="protocol-file-data">
                                <strong>{file.name}</strong>
                                <span>{getFileTypeLabel(file)}</span>
                              </div>

                              <IonIcon icon={openOutline} className="protocol-file-open-icon" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default ProtocolsPage;
