import React, { useState, useEffect } from 'react';
import { apiGetCategories, apiPostCategory, apiUpdateCategory, apiDeleteCategory, fireAlert, } from '../service/PackageTravelService';
import { Pencil, X, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import '../style/AdminCategory.css';

const initialCategoryState = {
    id: null,
    title: '',
    description: '',
    imageUrl: '',
};

const ITEMS_PER_PAGE = 4;

const CategoryForm = ({ formData, onChange, onSubmit, loading }) => (
    <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
                <label htmlFor="title" className="label-title-category d-block text-sm font-medium text-gray-700">Título</label>
                <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={onChange}
                    placeholder="Aventura, Relax, Cultura"
                    className="input-title-category mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    required
                    disabled={loading}
                />
            </div>

            <div>
                <label htmlFor="imageUrl" className="label-image-category d-block text-sm font-medium text-gray-700">URL de Imagen Representativa</label>
                <input
                    type="url"
                    name="imageUrl"
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={onChange}
                    placeholder="URL de la imagen (ej: https://example.com/imagen.jpg)"
                    className="input-image-category mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    required
                    disabled={loading}
                />
            </div>
        </div>

        <div>
            <label htmlFor="description" className="label-description-category d-block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
                name="description"
                id="description"
                rows="3"
                value={formData.description}
                onChange={onChange}
                placeholder="Descripción concisa de la categoría."
                className="input-description-category mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
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
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        if (e && e.preventDefault) e.preventDefault();

        if (!formData.title || !formData.description || !formData.imageUrl) {
            fireAlert('Campos Incompletos', 'Por favor, rellena todos los campos.', 'warning');
            return;
        }

        setLoading(true);
        try {
            const payload = { ...formData, title: formData.title.toUpperCase() };

            if (isEditing) {
                await apiUpdateCategory({ ...payload, id: Number(payload.id) });
                fireAlert('Éxito', `Categoría "${payload.title}" actualizada.`, 'success');
            } else {
                await apiPostCategory(payload);
                fireAlert('Éxito', `Categoría "${payload.title}" creada.`, 'success');

                window.location.reload();
                return;
            }
            fetchCategories();
            handleCloseModal();
        } catch (error) {
            fireAlert('Error', 'Hubo un error al guardar.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setFormData(category);
            setIsEditing(true);
        } else {
            setFormData(initialCategoryState);
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData(initialCategoryState);
        setIsEditing(false);
    };

    const handleEdit = (category) => {
        setFormData(category);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id, title) => {
        const result = await fireAlert('Confirmar Eliminación', `¿Estás seguro de eliminar la categoría "${title}"? Esta acción es irreversible.`, 'warning', true);

        if (result.isConfirmed) {
            setLoading(true);
            try {
                await apiDeleteCategory(id);
                fireAlert('Eliminada', `La categoría "${title}" ha sido eliminada.`, 'success');
                fetchCategories();
                window.location.reload();
                return;
            } catch (error) {
                fireAlert('Error de Eliminación', 'Hubo un error al intentar eliminar la categoría.', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
    const lastItemIndex = currentPage * ITEMS_PER_PAGE;
    const firstItemIndex = lastItemIndex - ITEMS_PER_PAGE;
    const currentCategories = categories.slice(firstItemIndex, lastItemIndex);

    const goToNextPage = () => {
        setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev));
    };

    const goToPrevPage = () => {
        setCurrentPage(prev => (prev > 1 ? prev - 1 : prev));
    };


    return (
        <div className="container-admin-category p-4 md:p-8 bg-gray-50 min-h-screen">

            <div className="button-header-row-category items-center mb-6 border-b-4 border-blue-500 pb-2">

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
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={18} />
                    Nueva Categoría
                </button>
            </div>
            <h1 className="text-3xl font-extrabold text-blue-900 mx-auto">
                Administración de Categorías
            </h1>

            {isModalOpen && (
                <div class="modal fade show d-block" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog-category">
                        <div class="modal-content-category">
                            <div class="modal-header-category">
                                <h5 class="modal-title-category fs-5" id="exampleModalLabel">
                                    {isEditing ? 'Editar Categoría Existente' : 'Crear Nueva Categoría'}
                                </h5>

                            </div>
                            <div class="modal-body-category">
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
                                    onClick={handleCloseModal}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-primary bg-green-600 text-white hover:bg-green-700 rounded-lg p-2 transition disabled:opacity-50"
                                    onClick={async () => {
                                        await handleFormSubmit();
                                    }}
                                    disabled={loading}

                                >
                                    {loading ? 'Guardando...' : 'Guardar categoría'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                <div className="admin-category bg-white rounded-xl overflow-hidden">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Título</th>
                                <th>Descripción</th>
                                <th>Imagen (Preview)</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCategories.map((cat) => (
                                <tr key={cat.id}>
                                    <td>{cat.id}</td>
                                    <td >{cat.title}</td>
                                    <td>{cat.description}</td>
                                    <td>
                                        {cat.imageUrl && (
                                            <img
                                                src={cat.imageUrl}
                                                alt={cat.title}
                                                className="image-category object-cover rounded shadow-sm"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "https://placehold.co/100x60/3b82f6/ffffff?text=Error"
                                                }}
                                            />
                                        )}
                                    </td>
                                    <td>
                                        <div className="button-flex">
                                            <button
                                                onClick={() => handleEdit(cat)}
                                                className="btn btn-warning me-2"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <Pencil size={16} />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id, cat.title)}
                                                className="btn btn-danger"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}

                                            >
                                                <X size={16} />
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                            ))}
                        </tbody>
                    </table>
                    {categories.length > ITEMS_PER_PAGE && (
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

            )}
        </div>

    );
};