import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    apiGetCategories, apiPostCategory, apiUpdateCategory, apiDeleteCategory, fireAlert
} from '../service/PackageTravelService';
import { Trash2, Edit, Save, X, PlusCircle, Plus, RotateCcw, ArrowLeft } from 'lucide-react';
import '../style/AdminCategory.css';

const initialCategoryState = {
    id: null,
    title: '',
    description: '',
    imageUrl: '',
};

const CategoryForm = ({ formData, onChange, onSubmit, onCancel, loading, isEditing }) => (
    <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
                <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={onChange}
                    placeholder="Aventura, Relax, Cultura"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    required
                    disabled={loading}
                />
            </div>

            <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">URL de Imagen Representativa</label>
                <input
                    type="url"
                    name="imageUrl"
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={onChange}
                    placeholder="URL de la imagen (ej: https://example.com/imagen.jpg)"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    required
                    disabled={loading}
                />
            </div>
        </div>

        <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
                name="description"
                id="description"
                rows="3"
                value={formData.description}
                onChange={onChange}
                placeholder="Descripción concisa de la categoría."
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                required
                disabled={loading}
            ></textarea>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          
        </div>
    </form>
);

export const AdminCategory = ({ onBackToMenu }) => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState(initialCategoryState);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await apiGetCategories();
            setCategories(data);
        } catch (error) {
            fireAlert('Error de Conexión', 'No se pudieron cargar las categorías desde el servidor.', 'error');
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.imageUrl) {
            fireAlert('Campos Incompletos', 'Por favor, rellena todos los campos de la categoría (Título, Descripción, URL de Imagen).', 'warning');
            return;
        }

        setLoading(true);

        try {

            const payload = { ...formData, title: formData.title ? formData.title.toUpperCase() : formData.title };

            let result;
            if (isEditing) {
                result = await apiUpdateCategory({ ...payload, id: Number(payload.id) });
                fireAlert('Éxito', `Categoría \"${payload.title}\" actualizada correctamente. (ID: ${payload.id})`, 'success');
            } else {
                result = await apiPostCategory(payload);
                fireAlert('Éxito', `Categoría \"${payload.title}\" creada correctamente.`, 'success');
            }

            setTimeout(() => {
                fetchCategories();
                handleCancelEdit();
            }, 100);

        } catch (error) {
            fireAlert('Error de Operación', 'Hubo un error al guardar la categoría.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleNewCategory = () => {
        setFormData(initialCategoryState);
        setIsEditing(false);
    };

    const handleEdit = (category) => {
        setFormData(category);
        setIsEditing(true);
    };

    const handleDelete = async (id, title) => {
        const result = await fireAlert('Confirmar Eliminación', `¿Estás seguro de eliminar la categoría "${title}"? Esta acción es irreversible.`, 'warning', true);

        if (result.isConfirmed) {
            setLoading(true);
            try {
                await apiDeleteCategory(id);
                fireAlert('Eliminada', `La categoría "${title}" ha sido eliminada.`, 'success');
                fetchCategories();
            } catch (error) {
                fireAlert('Error de Eliminación', 'Hubo un error al intentar eliminar la categoría.', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCancelEdit = () => {
        setFormData(initialCategoryState);
        setIsEditing(false);
    };


    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">

            <div className="flex justify-between items-center mb-6 border-b-4 border-blue-500 pb-2">

                <button
                    type="button"
                    className="btn btn-back-to-list mb-3"
                    onClick={onBackToMenu}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                    <ArrowLeft size={18} />
                    Volver al Listado
                </button>


                <button
                    onClick={handleNewCategory}
                    disabled={loading}
                    className="btn btn-primary"
                    data-bs-toggle="modal" 
                    data-bs-target="#exampleModal"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={18} />
                    Nueva Categoría
                </button>

    <h1 className="text-3xl font-extrabold text-blue-900 mx-auto">
                Administrar Categorías
            </h1>


                <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h1 class="modal-title fs-5" id="exampleModalLabel">
                                    {isEditing ? 'Editar Categoría Existente' : 'Crear Nueva Categoría'}
                                    </h1>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>

                            </div>
                            <div class="modal-body">
                                <CategoryForm
                                    formData={formData}
                                    onChange={handleInputChange}
                                    loading={loading}
                                    isEditing={isEditing}
                                />
                            </div>

                              <div className="modal-footer justify-between bg-gray-100 rounded-b-xl">
                            
                           <button 
                                type="button" 
                                className="btn btn-secondary bg-gray-500 text-white hover:bg-gray-600 rounded-lg p-2 transition" 
                                data-bs-dismiss="modal"
                                onClick={handleCancelEdit} 
                            >
                                Cerrar
                            </button>
                            
                            <button 
                                type="button" 
                                className="btn btn-primary bg-green-600 text-white hover:bg-green-700 rounded-lg p-2 transition disabled:opacity-50"
                                onClick={handleFormSubmit}
                                disabled={loading}
                                data-bs-dismiss="modal" 
                            >
                                {loading ? 'Guardando...' : 'Guardar categoría'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        

            <div className="flex justify-between items-center mb-4 pt-4">
                <h2 className="text-2xl font-bold text-gray-800">Listado de Categorías ({categories.length})</h2>
                <button
                    onClick={fetchCategories}
                    disabled={loading}
                    className="flex items-center px-3 py-1 text-sm font-medium rounded-lg text-blue-600 border border-blue-600 hover:bg-blue-50 transition duration-150 disabled:opacity-50"
                    title="Recargar categorías"
                >
                    <RotateCcw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Recargar
                </button>
            </div>

            {loading && categories.length === 0 && (
                <div className="text-center p-10 bg-white rounded-xl shadow-lg">
                    <p className="text-xl text-blue-500 font-semibold">Cargando categorías...</p>
                </div>
            )}

            {!loading && categories.length === 0 && (
                <div className="text-center p-10 bg-white rounded-xl shadow-lg">
                    <p className="text-xl text-gray-600">No hay categorías registradas. ¡Crea una usando el botón "Nueva Categoría"!</p>
                </div>
            )}

            {categories.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-blue-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Título</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider hidden md:table-cell">Descripción</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider hidden lg:table-cell">Imagen (Preview)</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-yellow-50 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">{cat.title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell max-w-xs truncate">{cat.description}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">
                                            {cat.imageUrl && (
                                                <img
                                                    src={cat.imageUrl}
                                                    alt={cat.title}
                                                    className="w-16 h-10 object-cover rounded shadow-sm"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://placehold.co/100x60/3b82f6/ffffff?text=Error"
                                                    }}
                                                />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => handleEdit(cat)}
                                                    className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-100 transition"
                                                    title="Editar"
                                                    disabled={loading}
                                                    data-bs-toggle="modal" 
                                                    data-bs-target="#exampleModal"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id, cat.title)}
                                                    className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition"
                                                    title="Eliminar"
                                                    disabled={loading}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );  
};