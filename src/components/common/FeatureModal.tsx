import React, { useEffect, useRef } from 'react';
import { LogoIcon } from '../icons';

interface FeatureModalProps {
    feature: {
        icon: React.ReactElement;
        name: string;
        desc: string;
        details: string;
        benefits: string[];
    } | null;
    onClose: () => void;
}

export const FeatureModal = ({ feature, onClose }: FeatureModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (feature) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [feature, onClose]);

    if (!feature) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div
                ref={modalRef}
                className="relative w-full max-w-2xl bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl transform transition-all scale-100 opacity-100 overflow-hidden flex flex-col max-h-[90vh]"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="relative p-6 sm:p-8 border-b border-gray-800/50 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30 text-blue-400">
                            {React.cloneElement(feature.icon as React.ReactElement<{ className?: string }>, { className: 'w-8 h-8' })}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">{feature.name}</h3>
                            <p className="text-blue-300 font-medium mt-1">Feature Deep Dive</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
                    <div className="prose prose-invert max-w-none">
                        <div className="mb-8">
                            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                Overview
                            </h4>
                            <p className="text-gray-300 leading-relaxed text-lg">
                                {feature.details}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                                Key Benefits
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {feature.benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700/30 hover:border-blue-500/30 transition-colors">
                                        <div className="mt-1 text-green-400 flex-shrink-0">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-300">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800/50 bg-gray-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};
