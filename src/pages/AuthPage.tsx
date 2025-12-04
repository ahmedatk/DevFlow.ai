import React, { useState } from 'react';
import { LogoIcon, GoogleIcon } from '../components/icons';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";

// --- Auth Page Component ---
const AuthPage = ({ onShowLanding }: { onShowLanding: () => void }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            // onAuthStateChanged in App.tsx will handle the redirect
        } catch (err: any) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
            // onAuthStateChanged will handle the redirect
        } catch (err: any) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* Animated Stars and Constellations Background */}
            <div className="fixed inset-0 stars-constellation-bg" aria-hidden="true">
                <div className="stars-layer"></div>
                <div className="constellations-layer"></div>
                <div className="blue-tint-overlay"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <LogoIcon className="w-10 h-10" />
                    <span className="text-2xl font-bold">DevFlow.AI</span>
                </div>
                <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-8 border border-gray-700/50 shadow-2xl">
                    <h2 className="text-3xl font-bold text-center mb-6">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold p-3 rounded-lg hover:bg-gray-200 disabled:bg-gray-400 transition-colors"
                    >
                        <GoogleIcon />
                        {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
                    </button>

                    <div className="flex items-center my-6">
                        <hr className="flex-grow border-gray-600" />
                        <span className="mx-4 text-gray-500 text-sm font-medium">OR</span>
                        <hr className="flex-grow border-gray-600" />
                    </div>

                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Email Address"
                            required
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 font-semibold p-3 rounded-lg hover:bg-blue-500 disabled:bg-blue-800">
                            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-400 mt-6">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-blue-500 hover:underline ml-1">
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </div>
                <button onClick={onShowLanding} className="text-sm text-gray-500 hover:text-gray-300 mt-6">&larr; Back to Home</button>
            </div>
        </div>
    );
};

export default AuthPage;
