import React, { useState, useEffect } from 'react';
import {
    Wifi, Utensils, ShieldCheck, Mountain, Camera, Bus, Apple, Map, Plane,
    Ticket, Hotel, Star, MountainSnow, Pencil, X, Plus, Activity, ArrowLeft, ArrowRight,
} from 'lucide-react';
import { apiGetCharacteristics, apiPostCharacteristic, apiUpdateCharacteristic, apiDeleteCharacteristic, fireAlert } from '../service/PackageTravelService';
import '../style/AdminCharacteristic.css';

export const IconLibrary = {
    'wifi': Wifi,
    'utensils': Utensils,
    'shield-check': ShieldCheck,
    'mountain': Mountain,
    'camera': Camera,
    'bus': Bus,
    'first-aid': Activity,
    'apple': Apple,
    'map': Map,
    'plane': Plane,
    'ticket': Ticket,
    'hotel': Hotel,
    'star': Star,
    'mountain-snow': MountainSnow
};

const initialCharacteristicState = {
    id: null,
    title: '',
    icon: 'star'
};

const ITEMS_PER_PAGE = 4;

export const AdminCharacteristic = ({ onBackToMenu }) => {

    const [characteristics, setCharacteristics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState(initialCharacteristicState);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAuto, setIsAuto] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean(sessionStorage.getItem('jwtToken')));


    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (isAuto && formData.title?.length > 2) {
            const autoIcon = getAutoIcon(formData.title);
            if (autoIcon !== formData.icon) {
                setFormData(prev => ({ ...prev, icon: autoIcon }));
            }
        }
    }, [formData.title, isAuto]);

    const getAutoIcon = (text) => {
        const t = text.toLowerCase();
        if (t.includes('wifi') || t.includes('internet')) return 'wifi';
        if (t.includes('comida') || t.includes('restaurante') || t.includes('cena')) return 'utensils';
        if (t.includes('seguro') || t.includes('protección')) return 'shield-check';
        if (t.includes('nieve') || t.includes('esquí') || t.includes('snow')) return 'mountain-snow';
        if (t.includes('montaña') || t.includes('trekking') || t.includes('cerro')) return 'mountain';
        if (t.includes('foto') || t.includes('cámara') || t.includes('recuerdo')) return 'camera';
        if (t.includes('bus') || t.includes('autobús') || t.includes('transporte')) return 'bus';
        if (t.includes('médico') || t.includes('auxilio') || t.includes('salud')) return 'first-aid';
        if (t.includes('fruta') || t.includes('comida') || t.includes('saludable')) return 'apple';
        if (t.includes('mapa') || t.includes('guía') || t.includes('ubicación')) return 'map';
        if (t.includes('vuelo') || t.includes('avión') || t.includes('aéreo')) return 'plane';
        if (t.includes('ticket') || t.includes('entrada') || t.includes('boleto')) return 'ticket';
        if (t.includes('hotel') || t.includes('alojamiento') || t.includes('posada')) return 'hotel';
        return 'star';
    };


    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await apiGetCharacteristics();
            setCharacteristics(data);
        } catch (error) {
            setCharacteristics([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const formatTitle = (text) => {
        if (!text) return '';
        const lower = text.trim().toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!formData.title || !formData.icon) {
            fireAlert('Campos Incompletos', 'Por favor, rellena todos los campos de las características (Título, Icono).', 'warning');
            return;
        }
        setLoading(true);

        try {
            const formattedTitle = formatTitle(formData.title);
            const payload = { ...formData, title: formattedTitle };

            if (isEditing) {
                await apiUpdateCharacteristic({ ...payload, id: Number(payload.id) });
                fireAlert('Éxito', `Característica "${payload.title}" actualizada correctamente.`, 'success');
            } else {
                await apiPostCharacteristic(payload);
                fireAlert('Éxito', `Característica "${payload.title}" creada correctamente.`, 'success');
            }

            fetchData();
            handleCloseModal();

        } catch (error) {
            fireAlert('Error de Operación', 'Hubo un error al guardar la característica.', 'error');
        } finally {
            setLoading(false);
        }
    };


    const handleEdit = (characteristic) => {
        setFormData(characteristic);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleOpenModal = (characteristic = null) => {
        if (characteristic) {
            setFormData(characteristic);
            setIsEditing(true);
            setIsAuto(false);
        } else {
            setFormData(initialCharacteristicState);
            setIsEditing(false);
            setIsAuto(true);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData(initialCharacteristicState);
        setIsEditing(false);
    };

    const handleDelete = async (char) => {
        const result = await fireAlert('Confirmar Eliminación', `¿Estás seguro de eliminar la característica "${char.title}"? Esta acción es irreversible.`, 'warning', true);

        setLoading(true);
        try {
            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
                fireAlert('Acceso Denegado', 'Para eliminar una característica necesitas iniciar sesión como administrador.', 'error');
                setLoading(false);
                return;
            }

            if (result.isConfirmed) {
                await apiDeleteCharacteristic(char.id);
                setCharacteristics(prev => prev.filter(c => c.id !== char.id));
                await fetchData();

                fireAlert('Eliminado', 'La característica ha sido eliminada.', 'success');
            }
        } catch (error) {
            if (error && error.response && error.response.status === 401) {
                fireAlert('Acceso Denegado', 'Operación no autorizada. Inicia sesión con una cuenta con permisos de administrador.', 'error');
            } else {
                fireAlert('Error', 'No se pudo eliminar la característica. Revisa la consola para más detalles.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };


    const totalPages = Math.ceil(characteristics.length / ITEMS_PER_PAGE);
    const lastItemIndex = currentPage * ITEMS_PER_PAGE;
    const firstItemIndex = lastItemIndex - ITEMS_PER_PAGE;
    const currentCharacteristics = characteristics.slice(firstItemIndex, lastItemIndex);

    const goToNextPage = () => {
        setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev));
    };

    const goToPrevPage = () => {
        setCurrentPage(prev => (prev > 1 ? prev - 1 : prev));
    };

    return (
        <div className="container-admin-characteristic p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
            <div className="button-header-row-characteristic flex flex-col md:flex-row justify-between items-center border-b-4 border-blue-600 pb-4 gap-4">
                <button
                    type="button"
                    className="btn btn-back-to-list"
                    onClick={onBackToMenu}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                    <ArrowLeft size={18} />
                    Volver al Menú
                </button>

                <button
                    onClick={() => handleOpenModal()}
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={18} />
                    Nueva Característica
                </button>

            </div>
            <h1 className="text-3xl font-extrabold text-blue-900 mx-auto">
                Administración de Características
            </h1>

            {isModalOpen && (
                <div className="modal fade show d-block" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog-characteristic">
                        <div className="modal-content-characteristic">
                            <div className="modal-header-characteristic">
                                <h5 className="modal-title-characteristic fs-5" id="exampleModalLabel">
                                    {isEditing ? 'Editar Característica' : 'Nueva Característica'}
                                </h5>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="modal-body-characteristic">
                                    <label className="label-title-characteristic d-block text-xs font-bold text-slate-400 uppercase mb-2">Título</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Ej: WiFi Gratis"
                                        className="input-title-characteristic w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                    <div className="flex justify-between mb-3">
                                        <label className="label-icon-characteristic d-block text-xs font-bold text-slate-400 uppercase">Icono</label>
                                        <button
                                            type="button"
                                            onClick={() => setIsAuto(!isAuto)}
                                            className={`button-icon-characteristic ${isAuto ? 'is-auto' : 'is-manual'}`}
                                        >
                                            {isAuto ? "ASIGNACIÓN AUTOMÁTICA" : "MANUAL"}
                                        </button>
                                    </div>

                                    <div className="icon-box flex gap-4 p-2 mb-4 border border-slate-100">
                                        <div className="p-3 bg-white text-blue-600 ">
                                            {(() => {
                                                const SelectedIconComp = IconLibrary[formData.icon] || Star;
                                                return <SelectedIconComp size={35} />
                                            })()}
                                        </div>
                                        <span className="title-icon-box font-bold text-slate-700 capitalize text-sm">{formData.icon}</span>
                                    </div>

                                    <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto pr-1">
                                        {Object.keys(IconLibrary).map(key => {
                                            const Icon = IconLibrary[key];
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => { setFormData({ ...formData, icon: key }); setIsAuto(false); }}
                                                    className={`button-icon p-3 rounded-lg border flex items-center justify-center transition ${formData.icon === key ? 'bg-blue-600 text-green' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'}`}
                                                >
                                                    <Icon size={18} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="modal-footer justify-between bg-gray-100 rounded-b-xl">
                                    <button
                                        type="button"
                                        className="btn btn-secondary bg-gray-500 text-white hover:bg-gray-600 rounded-lg p-2 transition"
                                        data-bs-dismiss="modal"
                                        onClick={handleCloseModal}
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary bg-green-600 text-white hover:bg-green-700 rounded-lg p-2 transition disabled:opacity-50"
                                        onClick={async () => {
                                            await handleSubmit();
                                            onclose();
                                        }}
                                        disabled={loading}

                                    >
                                        {loading ? 'Guardando...' : 'Guardar característica'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 bg-slate-50 border-b flex justify-between items-center">

                </div>

                <div className="admin-characteristic overflow-x-auto">
                    <table>
                        <thead>
                            <tr >
                                <th style={{ width: '380px' }}>Icono</th>
                                <th>Título</th>
                                <th style={{ width: '400px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCharacteristics.map(char => {
                                const Icon = IconLibrary[char.icon] || Star;
                                return (
                                    <tr key={char.id}>
                                        <td>
                                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                                <Icon size={20} />
                                            </div>
                                        </td>
                                        <td> {char.title}</td>
                                        <td>
                                            <div className="button-flex-characteristic">
                                                <button
                                                    type="button"
                                                    className="btn btn-warning me-2"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#exampleModal"
                                                    onClick={() => handleEdit(char)}

                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                                >
                                                    <Pencil size={16} />
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(char)}
                                                    disabled={!isAuthenticated}
                                                    title={!isAuthenticated ? 'Requiere iniciar sesión como administrador' : 'Eliminar característica'}
                                                    className=" btn btn-danger"
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                                >
                                                    <X size={16} />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {characteristics.length > ITEMS_PER_PAGE && (
                        <div className="d-flex flex-column align-items-center mt-3">

                            <nav aria-label="Navegación de páginas">
                                <ul className="pagination justify-content-center">

                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <a
                                            className="page-link"
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); goToPrevPage(); }}
                                        >
                                            <ArrowLeft size={16} style={{ marginRight: '5px' }} /> Anterior
                                        </a>
                                    </li>

                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNum = index + 1;
                                        return (
                                            <li
                                                key={pageNum}
                                                className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                                            >
                                                <a
                                                    className="page-link"
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); setCurrentPage(pageNum); }}
                                                >
                                                    {pageNum}
                                                </a>
                                            </li>
                                        );
                                    })}

                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <a
                                            className="page-link"
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); goToNextPage(); }}
                                        >
                                            Siguiente <ArrowRight size={16} style={{ marginLeft: '5px' }} />
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}