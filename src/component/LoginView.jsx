import React, { useState } from 'react';
import { apiLogin, fireAlert } from '../service/PackageTravelService';
import { useNavigate } from 'react-router-dom';
import '../style/AuthStyles.css';


export const LoginView = ({ onAuthSuccess }) => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const isFormValid = credentials.email.length > 0 && credentials.password.length > 0;

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;
        setLoading(true);

        try {
            const userData = await apiLogin(credentials);
            onAuthSuccess(userData);
            navigate('/home');

        } catch (error) {
            let errorTitle = "Error de Sesión";
            let errorMessage = "Ocurrió un error inesperado al intentar iniciar sesión. Inténtalo de nuevo.";

            if (error.response) {
                const status = error.response.status;
                if (status === 401 || status === 403) {
                    errorMessage = "El correo o la contraseña son incorrectos. Por favor, verifica tus datos.";
                    errorTitle = "Credenciales Inválidas";
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            fireAlert(errorTitle, errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container flex items-center justify-center min-h-[70vh] p-4">
            <div className="auth-card max-w-2xl p-8 rounded-xl shadow-2xl bg-white ">
                <h3 className="auth-title text-3xl font-extrabold text-center text-gray-900 mb-6">
                    Iniciar Sesión
                </h3>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className='form-field-group'>
                            <label htmlFor="email" className="text d-block">
                                Correo Electrónico
                            </label>
                            <input
                                type="email" name="email" id="email" required value={credentials.email} onChange={handleChange}
                                className="w-100 px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" placeholder="tu.correo@ejemplo.com"
                                autoComplete="email"
                            />
                    </div>
                    <div className='form-field-group'>
                        <label htmlFor="password" className="text d-block">
                            Contraseña
                        </label>
                        <input
                            type="password" name="password" id="password" required value={credentials.password} onChange={handleChange}
                            className="w-100 px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 " placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </div>
                    <div className='md:col-span-2 mt-4'>
                        <button type="submit" disabled={loading || !isFormValid}
                            className={`auth-button py-2 px-4 rounded-lg font-semibold text-white transition duration-300  ${loading || !isFormValid ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-lg'}`}
                        >
                            {loading ? 'Cargando...' : 'Iniciar Sesión'}
                        </button>
                    </div>
                </form>
                <div className="mt-6 text-center">
                    <button onClick={() => navigate('/register')} className="button-second text-sm text-green-600 hover:text-green-700 hover:underline">
                        ¿No tienes cuenta? Regístrate aquí
                    </button>
                </div>
            </div>
        </div>
    );
};