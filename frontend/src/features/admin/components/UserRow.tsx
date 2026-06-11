import React, { useMemo, useState } from "react";
import { IonIcon, IonSearchbar } from "@ionic/react";
import {
  closeOutline,
  createOutline,
  peopleOutline,
  trashOutline,
} from "ionicons/icons";
import type {
  UsuarioRow,
  UsuarioUpdatePayload,
} from "@/features/admin/hooks/useAdminDashboard";
import { chileRegions } from "@/assets/data/chileRegions";
import { notify } from "@/shared/notifications";
import "./UserRow.css";

interface UserRowProps {
  usuarios: UsuarioRow[];
  isLoading?: boolean;
  isSaving?: boolean;
  error?: string;
  success?: string;
  onUpdateUser?: (
    id: string,
    payload: UsuarioUpdatePayload,
  ) => Promise<UsuarioRow>;
  onDeleteUser?: (id: string) => Promise<void>;
}

const normalizeLocationText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const findRegionName = (regionName: string) => {
  const normalizedRegion = normalizeLocationText(regionName);

  return (
    chileRegions.find(
      (region) => normalizeLocationText(region.name) === normalizedRegion,
    )?.name || regionName
  );
};

const getComunasByRegion = (regionName: string) => {
  const normalizedRegion = normalizeLocationText(regionName);

  return (
    chileRegions.find(
      (region) => normalizeLocationText(region.name) === normalizedRegion,
    )?.comunas || []
  );
};

const buildEditForm = (user: UsuarioRow): UsuarioUpdatePayload => ({
  nombre: user.nombre,
  email: user.email,
  region: findRegionName(user.region),
  comuna: user.comuna,
  estatus: user.estatus,
  tipo_usuario: user.tipo_usuario,
});

export const UserRow: React.FC<UserRowProps> = ({
  usuarios,
  isLoading = false,
  isSaving = false,
  error = "",
  success = "",
  onUpdateUser,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<UsuarioRow | null>(null);
  const [editForm, setEditForm] = useState<UsuarioUpdatePayload | null>(null);
  const [modalError, setModalError] = useState("");

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return usuarios;

    return usuarios.filter((user) => {
      return (
        user.nombre.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.region.toLowerCase().includes(search) ||
        user.comuna.toLowerCase().includes(search) ||
        user.estado.toLowerCase().includes(search) ||
        user.tipoUsuario.toLowerCase().includes(search) ||
        user.riesgo.toLowerCase().includes(search)
      );
    });
  }, [usuarios, searchTerm]);

  const openEditModal = (user: UsuarioRow) => {
    setEditingUser(user);
    setEditForm(buildEditForm(user));
    setModalError("");
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditForm(null);
    setModalError("");
  };

  const handleEditChange = (
    field: keyof UsuarioUpdatePayload,
    value: string,
  ) => {
    setEditForm((currentForm) => {
      if (!currentForm) return currentForm;

      if (field === "region") {
        return {
          ...currentForm,
          region: value,
          comuna: "",
        };
      }

      return {
        ...currentForm,
        [field]: value,
      } as UsuarioUpdatePayload;
    });
  };

  const comunasDisponibles = useMemo(() => {
    if (!editForm?.region) return [];

    const comunas = getComunasByRegion(editForm.region);

    if (editForm.comuna && !comunas.includes(editForm.comuna)) {
      return [editForm.comuna, ...comunas];
    }

    return comunas;
  }, [editForm?.region, editForm?.comuna]);

  const handleSubmitEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingUser || !editForm || !onUpdateUser) return;

    const normalizedForm: UsuarioUpdatePayload = {
      nombre: editForm.nombre.trim(),
      email: editForm.email.trim().toLowerCase(),
      region: editForm.region.trim(),
      comuna: editForm.comuna.trim(),
      estatus: editForm.estatus,
      tipo_usuario: editForm.tipo_usuario,
    };

    if (
      !normalizedForm.nombre ||
      !normalizedForm.email ||
      !normalizedForm.region ||
      !normalizedForm.comuna
    ) {
      setModalError("Nombre, correo, región y comuna son obligatorios.");
      return;
    }

    try {
      setModalError("");
      await onUpdateUser(editingUser.id, normalizedForm);
      notify.success('Usuario actualizado correctamente.');
      notify.add({
        type: 'success',
        title: 'Usuario actualizado',
        message: `${normalizedForm.nombre} fue editado correctamente.`
      });
      closeEditModal();
    } catch (updateError: any) {
      setModalError(updateError.message || "No se pudo editar el usuario.");
      notify.error(updateError.message || "No se pudo editar el usuario.");
    }
  };

  const handleDeleteUser = async (user: UsuarioRow) => {
    if (!onDeleteUser) return;

    const shouldDelete = await notify.confirm({
      header: 'Eliminar usuario',
      message: `¿Seguro que deseas eliminar la cuenta de ${user.nombre}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      destructive: true,
    });

    if (!shouldDelete) return;

    try {
      await onDeleteUser(user.id);
      notify.success('Usuario eliminado correctamente.');
      notify.add({
        type: 'success',
        title: 'Usuario eliminado',
        message: `${user.nombre} fue eliminado del sistema.`
      });
    } catch {
      // El mensaje se muestra desde el hook mediante usersError.
    }
  };

  return (
    <section className="admin-table-container">
      <div className="admin-users-header">
        <div className="admin-users-title">
          <span className="admin-users-kicker">
            <IonIcon icon={peopleOutline} />
            Gestión de usuarios
          </span>

          <h2>Usuarios registrados</h2>

          <p>
            Lista de funcionarios y vecinos registrados en la plataforma. El
            riesgo se calcula según los cuestionarios respondidos por cada
            usuario.
          </p>
        </div>

        <div className="admin-users-search">
          <IonSearchbar
            value={searchTerm}
            placeholder="Buscar usuario..."
            className="admin-searchbar"
            mode="ios"
            onIonInput={(event) => setSearchTerm(event.detail.value || "")}
          />
        </div>
      </div>

      {success && <div className="admin-inline-message success">{success}</div>}
      {error && <div className="admin-inline-message error">{error}</div>}

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Ubicación</th>
              <th>Progreso</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Riesgo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7}>
                  <div className="admin-table-state">Cargando usuarios...</div>
                </td>
              </tr>
            )}

            {!isLoading && filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="admin-table-state">
                    No hay usuarios para mostrar.
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">{user.iniciales}</div>

                      <div className="user-data">
                        <span className="user-name">{user.nombre}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="user-location">
                      <strong>{user.comuna || "Sin comuna"}</strong>
                      <span>{user.region || "Sin región"}</span>
                    </div>
                  </td>

                  <td>
                    <span className="user-progress-pill">
                      {user.cuestionariosRespondidos}/{user.totalCuestionarios}
                    </span>
                  </td>

                  <td>
                    <span className={`badge-tipo ${user.tipo_usuario}`}>
                      {user.tipoUsuario}
                    </span>
                  </td>

                  <td>
                    <span className={`badge-estado ${user.estatus}`}>
                      {user.estado}
                    </span>
                  </td>

                  <td>
                    <span
                      className="badge-riesgo"
                      style={{ backgroundColor: user.colorRiesgo }}
                    >
                      {user.riesgo}
                    </span>
                  </td>

                  <td className="actions-cell">
                    <button
                      type="button"
                      aria-label="Editar usuario"
                      disabled={isSaving}
                      onClick={() => openEditModal(user)}
                    >
                      <IonIcon icon={createOutline} className="icon-edit" />
                    </button>

                    <button
                      type="button"
                      aria-label="Eliminar usuario"
                      disabled={isSaving}
                      onClick={() => handleDeleteUser(user)}
                    >
                      <IonIcon icon={trashOutline} className="icon-delete" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {editingUser && editForm && (
        <div className="admin-user-modal-backdrop" role="presentation">
          <div
            className="admin-user-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-user-modal-title"
          >
            <div className="admin-user-modal-header">
              <div>
                <span>Editar cuenta</span>
                <h3 id="admin-user-modal-title">{editingUser.nombre}</h3>
              </div>

              <button
                type="button"
                className="admin-user-modal-close"
                aria-label="Cerrar formulario"
                onClick={closeEditModal}
                disabled={isSaving}
              >
                <IonIcon icon={closeOutline} />
              </button>
            </div>

            <form className="admin-user-form" onSubmit={handleSubmitEdit}>
              <label>
                Nombre completo
                <input
                  type="text"
                  value={editForm.nombre}
                  onChange={(event) =>
                    handleEditChange("nombre", event.target.value)
                  }
                  disabled={isSaving}
                />
              </label>

              <label>
                Correo
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(event) =>
                    handleEditChange("email", event.target.value)
                  }
                  disabled={isSaving}
                />
              </label>

              <div className="admin-user-form-grid">
                <label>
                  Región
                  <select
                    value={editForm.region}
                    onChange={(event) =>
                      handleEditChange("region", event.target.value)
                    }
                    disabled={isSaving}
                  >
                    <option value="">Selecciona una región</option>
                    {editForm.region &&
                      !chileRegions.some(
                        (region) => region.name === editForm.region,
                      ) && (
                        <option value={editForm.region}>
                          {editForm.region}
                        </option>
                      )}
                    {chileRegions.map((region) => (
                      <option key={region.id} value={region.name}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Comuna
                  <select
                    value={editForm.comuna}
                    onChange={(event) =>
                      handleEditChange("comuna", event.target.value)
                    }
                    disabled={isSaving || !editForm.region}
                  >
                    <option value="">
                      {editForm.region
                        ? "Selecciona una comuna"
                        : "Selecciona primero una región"}
                    </option>
                    {comunasDisponibles.map((comuna) => (
                      <option key={comuna} value={comuna}>
                        {comuna}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="admin-user-form-grid">
                <label>
                  Estatus
                  <select
                    value={editForm.estatus}
                    onChange={(event) =>
                      handleEditChange("estatus", event.target.value)
                    }
                    disabled={isSaving}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </label>

                <label>
                  Tipo de usuario
                  <select
                    value={editForm.tipo_usuario}
                    onChange={(event) =>
                      handleEditChange("tipo_usuario", event.target.value)
                    }
                    disabled={isSaving}
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </label>
              </div>

              <div className="admin-user-risk-summary">
                <strong>Riesgo actual: {editingUser.riesgo}</strong>
                <span>
                  {editingUser.cuestionariosRespondidos} de{" "}
                  {editingUser.totalCuestionarios} cuestionarios respondidos.
                </span>
              </div>

              {modalError && (
                <div className="admin-inline-message error">{modalError}</div>
              )}

              <div className="admin-user-form-actions">
                <button
                  type="button"
                  className="admin-user-cancel-button"
                  onClick={closeEditModal}
                  disabled={isSaving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="admin-user-save-button"
                  disabled={isSaving}
                >
                  {isSaving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default UserRow;
