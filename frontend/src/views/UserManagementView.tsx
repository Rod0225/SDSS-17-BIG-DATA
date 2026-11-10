import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Search, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Role } from '../types';

export const UserManagementView: React.FC = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [, setLoading] = useState(true);

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<Role>('VIEWER');
  const [formActive, setFormActive] = useState<boolean>(true);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      const res = await api.getUsers(searchTerm || undefined, roleFilter || undefined);
      setUsers(res);
    } catch (err: any) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchTerm, roleFilter]);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('VIEWER');
    setFormActive(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setFormName(u.full_name);
    setFormEmail(u.email);
    setFormPassword('');
    setFormRole(u.role);
    setFormActive(u.is_active);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          full_name: formName,
          role: formRole,
          is_active: formActive,
          password: formPassword || undefined
        });
      } else {
        await api.createUser({
          full_name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole
        });
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err: any) {
      setModalError(err.message);
    }
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`¿Estás seguro de eliminar permanentemente la cuenta de ${u.full_name} (${u.email})?`)) return;
    try {
      await api.deleteUser(u.id);
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            Administración de Usuarios y Control de Acceso (RBAC)
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Gestión integral de usuarios, asignación de privilegios (Admin, Analista, Visualizador) y seguridad de sesiones.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-teal-200 transition-all hover:scale-105 self-start"
          >
            <UserPlus className="w-4 h-4" />
            Registrar Nuevo Usuario
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo electrónico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-sky-600 shadow-sm"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-sky-600 shadow-sm"
        >
          <option value="">Todos los Roles</option>
          <option value="ADMIN">ADMIN (Administrador)</option>
          <option value="ANALYST">ANALYST (Analista)</option>
          <option value="VIEWER">VIEWER (Visualizador)</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Usuario</th>
                <th className="p-3.5">Correo</th>
                <th className="p-3.5">Rol</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5">Fecha Registro</th>
                {isAdmin && <th className="p-3.5 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 text-slate-500 font-medium">#{u.id}</td>
                  <td className="p-3.5 font-bold text-slate-900 font-sans">{u.full_name}</td>
                  <td className="p-3.5 text-slate-700 font-medium">{u.email}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      u.role === 'ADMIN' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      u.role === 'ANALYST' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                      'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${
                      u.is_active ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                      {u.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500 font-medium">{new Date(u.created_at).toLocaleDateString()}</td>
                  {isAdmin && (
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors"
                        title="Modificar Usuario"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Eliminar Usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-300 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingUser ? 'Modificar Usuario' : 'Registrar Nuevo Usuario'}
            </h3>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-mono font-bold text-slate-700 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser}
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 disabled:opacity-50 disabled:bg-slate-100 shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-slate-700 block mb-1">
                  {editingUser ? 'Nueva Contraseña (dejar en blanco para conservar)' : 'Contraseña'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-slate-700 block mb-1">Rol de Acceso</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as Role)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 font-bold focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 shadow-sm"
                >
                  <option value="VIEWER">VIEWER (Consultas y visualización 3D)</option>
                  <option value="ANALYST">ANALYST (Preprocesamiento, modelos y predicciones)</option>
                  <option value="ADMIN">ADMIN (Acceso total y administración de usuarios)</option>
                </select>
              </div>

              {editingUser && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="userActiveCheck"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="rounded accent-sky-600"
                  />
                  <label htmlFor="userActiveCheck" className="text-xs font-mono font-bold text-slate-800 cursor-pointer">
                    Cuenta Activa
                  </label>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-200 transition-colors"
                >
                  {editingUser ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
