import React, { useState } from 'react';
import { User, Mail, Settings, Camera, ArrowLeft, Users, Plus, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import { User as UserType } from '../types';
import { authService } from '../services/authService';

interface AccountProps {
  user: UserType;
  onUserUpdate: (updatedUser: UserType) => void;
}

export default function Account({ user, onUserUpdate }: AccountProps) {
  const [currentView, setCurrentView] = useState<'main' | 'profile' | 'users'>('main');
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    avatar: user.avatar || ''
  });
  const [users, setUsers] = useState<UserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showUserDetails, setShowUserDetails] = useState<{[key: string]: boolean}>({});
  const [userPasswords, setUserPasswords] = useState<{[key: string]: string}>({});
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user'
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState<string>('');

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      const updatedUser = await authService.updateProfile(user.id, {
        name: profileData.name,
        email: profileData.email,
        avatar: profileData.avatar
      });
      
      if (updatedUser) {
        onUserUpdate(updatedUser);
        setEditingProfile(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          avatar: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const loadUsers = async () => {
    if (user.role !== 'admin') return;
    
    setLoadingUsers(true);
    try {
      const allUsers = await authService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUser = async () => {
    setCreatingUser(true);
    setCreateUserError('');
    try {
      const newUser = await authService.createUser(
        newUserData.name,
        newUserData.email,
        newUserData.password,
        newUserData.role
      );
      
      setUsers(prev => [newUser, ...prev]);
      setNewUserData({ name: '', email: '', password: '', role: 'user' });
      setShowCreateUser(false);
    } catch (error) {
      setCreateUserError(error instanceof Error ? error.message : 'Error al crear el usuario');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user.id) return; // Can't delete yourself
    
    const success = await authService.deleteUser(userId);
    if (success) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleEditUser = async (userId: string, updates: Partial<UserType>) => {
    const success = await authService.updateUser(userId, updates);
    if (success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
      setEditingUser(null);
    }
  };

  const toggleUserDetails = (userId: string) => {
    setShowUserDetails(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
    
    // Load user password when showing details
    if (!showUserDetails[userId] && !userPasswords[userId]) {
      // In a real app, you wouldn't store/show actual passwords
      // This is just for demo purposes
      setUserPasswords(prev => ({
        ...prev,
        [userId]: '••••••••' // Placeholder - real passwords shouldn't be retrievable
      }));
    }
  };

  React.useEffect(() => {
    if (currentView === 'users') {
      loadUsers();
    }
  }, [currentView]);

  if (currentView === 'profile') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView('main')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Actualizar Perfil</h1>
            <p className="text-gray-600 mt-1">Modifica tu información personal</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Foto de Perfil</h3>
                <p className="text-sm text-gray-600">Haz clic en el ícono de cámara para cambiar tu foto</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleProfileSave}
                disabled={savingProfile}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                onClick={() => setCurrentView('main')}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'users' && user.role === 'admin') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView('main')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Administrar Usuarios</h1>
            <p className="text-gray-600 mt-1">Gestiona las cuentas de usuario del sistema</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="text-sm text-gray-600">
              Total de usuarios: <span className="font-semibold">{users.length}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateUser(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear Usuario
            </button>
          </div>
        </div>

        {/* Create User Form */}
        {showCreateUser && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Crear Nuevo Usuario</h3>
            {createUserError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{createUserError}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Correo</label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, role: e.target.value as 'admin' | 'user' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateUser}
                disabled={creatingUser || !newUserData.name || !newUserData.email || !newUserData.password}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {creatingUser ? 'Creando...' : 'Crear Usuario'}
              </button>
              <button
                onClick={() => setShowCreateUser(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => {
                  setShowCreateUser(false);
                  setCreateUserError('');
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Usuarios del Sistema</h3>
          </div>
          {loadingUsers ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando usuarios...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {users.map((u) => (
                <div key={u.id} className="p-6 hover:bg-gray-50 transition-colors">
                  {editingUser?.id === u.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                          <input
                            type="text"
                            value={editingUser.name}
                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={editingUser.email}
                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                          <select
                            value={editingUser.role}
                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'admin' | 'user' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="user">Usuario</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEditUser(editingUser.id, {
                            name: editingUser.name,
                            email: editingUser.email,
                            role: editingUser.role
                          })}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                          {u.avatar ? (
                            <img src={u.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{u.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {u.role === 'admin' ? 'Administrador' : 'Usuario'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{u.email}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">ID:</span>
                            <span className="text-xs font-mono text-gray-400">
                              {showUserDetails[u.id] ? u.id : '••••••••-••••-••••-••••-••••••••••••'}
                            </span>
                          </div>
                          {showUserDetails[u.id] && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Email:</span>
                                <span className="text-xs font-mono text-gray-600">{u.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Contraseña:</span>
                                <span className="text-xs font-mono text-gray-600">••••••••</span>
                                <span className="text-xs text-amber-600">(No disponible por seguridad)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Creado:</span>
                                <span className="text-xs text-gray-600">Usuario del sistema</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleUserDetails(u.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title={showUserDetails[u.id] ? 'Ocultar detalles' : 'Ver detalles'}
                        >
                          {showUserDetails[u.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar usuario"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {u.id !== user.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cuenta</h1>
        <p className="text-gray-600 mt-1">Gestiona la configuración de tu cuenta</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Correo Electrónico</div>
                <div className="font-medium text-gray-900">{user.email}</div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Settings className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Rol</div>
                <div className="font-medium text-gray-900">
                  {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={`grid grid-cols-1 ${user.role === 'admin' ? 'sm:grid-cols-3' : 'sm:grid-cols-1'} gap-4`}>
        <button 
          onClick={() => setCurrentView('profile')}
          className="p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left"
        >
          <h3 className="font-semibold text-gray-900 mb-1">Actualizar Perfil</h3>
          <p className="text-sm text-gray-600">Cambiar tu información personal y foto</p>
        </button>
        {user.role === 'admin' && (
          <button 
            onClick={() => setCurrentView('users')}
            className="p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Administrar Usuarios</h3>
            </div>
            <p className="text-sm text-gray-600">Crear y gestionar cuentas de usuario</p>
          </button>
        )}
      </div>
    </div>
  );
}