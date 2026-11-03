import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Search, Edit2, Trash2, Shield, Check, X, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Role } from '../types';

export const UserManagementView: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-400" />
            Administración de Usuarios y Control de Acceso (RBAC)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestión integral de usuarios, asignación de privilegios (Admin, Analista, Visualizador) y seguridad de sesiones.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-teal-950 transition-all hover:scale-105 self-start"
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
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-space-900 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-space-900 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
        >
          <option value="">Todos los Roles</option>
          <option value="ADMIN">ADMIN (Administrador)</option>
          <option value="ANALYST">ANALYST (Analista)</option>
          <option value="VIEWER">VIEWER (Visualizador)</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-space-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-space-950 text-slate-400 border-b border-slate-800">
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
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 text-slate-500">#{u.id}</td>
                  <td className="p-3.5 font-bold text-white font-sans">{u.full_name}</td>
                  <td className="p-3.5 text-slate-300">{u.email}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      u.role === 'ADMIN' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      u.role === 'ANALYST' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] ${
                      u.is_active ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                      {u.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  {isAdmin && (
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors"
                        title="Modificar Usuario"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-space-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              {editingUser ? 'Modificar Usuario' : 'Registrar Nuevo Usuario'}
            </h3>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser}
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  {editingUser ? 'Nueva Contraseña (dejar en blanco para conservar)' : 'Contraseña'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Rol de Acceso</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as Role)}
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
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
                    className="rounded accent-cyan-400"
                  />
                  <label htmlFor="userActiveCheck" className="text-xs font-mono text-slate-300 cursor-pointer">
                    Cuenta Activa
                  </label>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors"
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

