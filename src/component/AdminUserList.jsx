import React, { useState, useEffect } from 'react';
import { apiGetAdminUsers, apiUpdateUserRole, apiHandleErrorAlert,fireAlert } from '../service/PackageTravelService';
import { Search, User, Mail, Shield, ArrowLeft } from 'lucide-react';
import '../style/AdminUserList.css';

const SUPERUSER_EMAIL = 'admin@tierranativa.com';

export const AdminUserList = ({ onLogout, onBackToMenu }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const currentUserData = JSON.parse(sessionStorage.getItem('user'));
    const currentUserEmail = currentUserData?.email;
    const currentUserRole = currentUserData?.role;

    const isSuperuser = currentUserEmail === SUPERUSER_EMAIL;
    const canModifyRoles = isSuperuser;

    const loadUsers = async () => {

        if (!sessionStorage.getItem('jwtToken') || isLoggingOut) {
            console.warn("loadUsers detenido: Sesión ausente o cerrando.");
            setLoading(false);
            setUsers([]);
            return;
        }
        setLoading(true);
        try {
            const data = await apiGetAdminUsers();
            setUsers(data);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            if (error.response && error.response.status === 403) {
                if (typeof onLogout === 'function') {
                    setIsLoggingOut(true);
                    onLogout();
                }
            } else {
                apiHandleErrorAlert(error, "No se pudo cargar la lista de usuarios.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleRoleChange = async (userToModify, newRole) => {
        if (!canModifyRoles) {
            Swal.fire('Acción Restringida', `Solo el Superusuario (${SUPERUSER_EMAIL}) tiene permitido modificar los roles de usuario.`, 'warning');
            return;
        }
        const isSelfRevocationAttempt = (userToModify.email === currentUserEmail) && (newRole === 'USER');

        if (isSelfRevocationAttempt) {
            Swal.fire('Permiso Restringido', 'El Superusuario no puede auto-revocarse su propio permiso de administrador.', 'warning');
            return;
        }

        const action = newRole === 'ADMIN' ? 'Otorgar' : 'Revocar';
        const confirmTitle = `¿Seguro que quieres ${action} permisos?`;

        if (typeof Swal !== 'undefined') {

            const result = await fireAlert('Confirmar cambio de rol', `¿Estás seguro de cambiar el rol de ${userToModify.firstName} a ${newRole}?`, 'warning', true);

            if (!result.isConfirmed) {
                return;
            }
        } else {
            if (!window.confirm(confirmTitle)) return;
        }
        try {
            await apiUpdateUserRole(userToModify.email, newRole);
            loadUsers();
        } catch (error) {
            apiHandleErrorAlert(error, "No se pudo cambiar el rol. Error de red o permisos insuficientes.");
            console.error("Error al cambiar rol:", error);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.firstName + ' ' + user.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleClass = (role, email) => {
        if (role === 'ADMIN' || email === SUPERUSER_EMAIL) {
            return 'bg-amber-100 text-amber-800 border-amber-400';
        }
        return 'bg-green-100 text-green-800 border-green-400';
    };


    if (isLoggingOut) {
        return <div className="text-center p-8 text-xl font-semibold text-indigo-600">Cerrando sesión de administrador...</div>;
    }
    if (loading) {
        return <div className="text-center p-8 text-lg font-semibold text-gray-700">Cargando usuarios...</div>;
    }

    return (

        <div className="container-p-4 sm:p-8 bg-white rounded-lg shadow-xl min-h-screen">

            <svg xmlns="http://www.w3.org/2000/svg" className="d-none">
                <symbol id="exclamation-triangle-fill" viewBox="0 0 16 16">
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                </symbol>
            </svg>
            <button
                type="button"
                className="btn btn-back-to-list mb-3"
                onClick={onBackToMenu}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
                <ArrowLeft size={18} />
                Volver al Menú Principal
            </button>

            <h1 className="text-3xl p-4 border-b pb-2">
                Gestión de Usuarios Registrados
            </h1>
            <div className="fs-5 text text-start mx-auto p-1 rounded-lg max-w-lg">
                <span className='fw-bold d-block'>Mi permiso</span>
                <span class="badge text-bg-warning ">{canModifyRoles ? 'Acceso Total (SUPERUSUARIO)' : 'Solo Lectura (ADMIN)'}</span>
            </div>
            <div class="alert alert-warning d-flex align-items-center mt-2 mx-auto p-3 rounded-lg text-sm bg-yellow-100 border-l-4 border-yellow-500"
                role="alert">

                <svg
                    className="bi flex-shrink-0 mr-2"
                    role="img"
                    aria-label="Warning:"
                >
                    <use xlinkHref="#exclamation-triangle-fill" />
                </svg>
                <p className="mb-0 text-sm font-medium text-yellow-800">
                    Solo el Superusuario (`{SUPERUSER_EMAIL}`) puede modificar roles.
                </p>
            </div>
            <div className="mb-6">
                <div className="relative">
                    <input
                        name='search'
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-user w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                    />
                    <Search className="input-search-icon left-3 inset-y-0 my-auto w-4 h-5 text-gray-400" />
                </div>
            </div>

            <div className="table-full bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                <div className="overflow-x-auto ">
                    <table className="action ">
                        <thead className="icons-svg">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                    <User size={20} className="inline-block" /> Nombre Completo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Mail size={20} className="inline-block " /> Correo Electrónico
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Shield size={20} className="inline-block " /> Rol Actual
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 ">
                            {filteredUsers.map((user) => (
                                <tr key={user.id || user.email} className="hover:bg-indigo-50 transition duration-150">
                                    <td className="px-6 py-4 text-sm font-medium">
                                        {user.firstName} {user.lastName}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold  ${getRoleClass(user.role)}`}>
                                            {user.role}
                                            {user.email === SUPERUSER_EMAIL && ' (SuperUsuario)'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">

                                        {canModifyRoles ? (
                                            user.role === 'USER' ? (
                                                <button
                                                    onClick={() => handleRoleChange(user, 'ADMIN')}
                                                    className="submit py-1 px-3 rounded"
                                                    title="Otorgar permisos de Administrador"
                                                >
                                                    Hacer Admin
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleRoleChange(user, 'USER')}
                                                    className="remove py-1 px-3 rounded"
                                                    title="Revocar permisos de Administrador"
                                                >
                                                    Revocar Admin
                                                </button>
                                            )
                                        ) : (
                                            <span className="italic"><i>Permiso de lectura</i></span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No se encontraron usuarios que coincidan con "{searchTerm}".
                    </div>
                )}
            </div>
        </div>
    );
};