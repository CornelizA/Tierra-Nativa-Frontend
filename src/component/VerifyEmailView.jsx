import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { apiResendVerificationEmail, apiVerifyEmail, fireAlert } from '../service/PackageTravelService';
import { Mail, ArrowLeft } from 'lucide-react';
import '../style/AuthStyles.css';

export const VerifyEmailView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState(location.state?.email || '');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState('waiting');

    const hasCalledVerify = useRef(false);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token && !hasCalledVerify.current) {
            hasCalledVerify.current = true;
            verifyEmailToken(token);
        }
    }, [searchParams]);

    const verifyEmailToken = async (token) => {
        setLoading(true);
        try {
            await apiVerifyEmail(token);
            setVerificationStatus('success');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            setVerificationStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            fireAlert('Error', 'Por favor, introduce tu correo electrónico.');
            return;
        }
        setResendLoading(true);
        try {
            await apiResendVerificationEmail(email);
            setVerificationStatus('resent');
            setTimeout(() => setVerificationStatus('waiting'), 3000);
        } catch (error) {

            const errorMessage = error.response?.data?.message ||
             'No se pudo reenviar el correo. Por favor, verifica que la dirección sea correcta o intenta más tarde.';
            fireAlert('Error de Envío', errorMessage, 'error');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="auth-container flex items-center justify-center min-h-[70vh] p-4">
            <div className="auth-card max-w-2xl p-8 rounded-xl shadow-2xl bg-white">
                <button
                    onClick={() => navigate('/login')}
                    className="btn btn-back-to-list"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >

                    <ArrowLeft size={20} />
                    Volver al Login
                </button>

                <h3 className="auth-title-verify">
                    Verifica tu Correo
                </h3>
                <div className="auth-text-verify">
                    <Mail size={40} className=" text-green-600 " />
                    <p className="text-gray-600">
                        Hemos enviado un enlace de verificación a <strong>{email || 'tu correo'}</strong>
                    </p>
                </div>

                {verificationStatus === 'success' && (
                    <div className="text-success">
                        ✓ ¡Correo verificado con éxito! Redirigiendo al login...
                    </div>
                )}

                {verificationStatus === 'error' && (
                    <div className="text-error">
                        ✗ El enlace de verificación es inválido o ha expirado. Reenvía el correo.
                    </div>
                )}

                {verificationStatus === 'resent' && (
                    <div className="text-resent">
                        ✓ Correo reenviado. Revisa tu bandeja de entrada.
                    </div>
                )}

                {verificationStatus === 'waiting' && (
                    <>
                        <div className="container-verify ">
                            <h4 className="list-verify">¿Qué hacer ahora?</h4>
                            <ol className="list-decimal-verify list-inside text-sm text-blue-800 space-y-1">
                                <li>Abre tu correo electrónico</li>
                                <li>Busca el mensaje de "Tierra Nativa"</li>
                                <li>Haz clic en el enlace de verificación</li>
                                <li>Serás redirigido al login automáticamente</li>
                            </ol>
                        </div>

                        <div className="border-t pt-6">
                            <p className="resend-verification">
                                ¿No recibiste el correo? Puedes reenviarlo aquí:
                            </p>
                            <form onSubmit={handleResendEmail} className="space-y-4">
                                <div className="form-field-group">
                                    <label htmlFor="email" className="label-verify text d-block">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-100 px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                        placeholder="tu.correo@ejemplo.com"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={resendLoading}
                                    className={`auth-button-verify flex py-2 px-4 rounded-lg font-semibold text-white transition duration-300 ${resendLoading
                                        ? 'bg-green-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 shadow-lg'
                                        }`}
                                >
                                    {resendLoading ? 'Reenviando...' : 'Reenviar Correo de Verificación'}
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
