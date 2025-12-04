import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import * as geminiService from '../services/geminiService';
import { LogoIcon } from '../components/icons';

const ArchitectureView = ({ project, state, onStateChange }: { project: Project, state?: { mermaidCode: string; isLoading: boolean; error: string; key: number }, onStateChange?: (updates: Partial<{ mermaidCode: string; isLoading: boolean; error: string; key: number }>) => void }) => {
    const [mermaidCode, setMermaidCode] = useState(state?.mermaidCode || '');
    const [isLoading, setIsLoading] = useState(state?.isLoading || false);
    const [error, setError] = useState(state?.error || '');
    const [key, setKey] = useState(state?.key || 0);

    // Component will remount when switching views, so state prop will be used in useState initialization above

    // Update persisted state when local state changes
    const updateState = (updates: Partial<{ mermaidCode: string; isLoading: boolean; error: string; key: number }>) => {
        if (onStateChange) {
            onStateChange(updates);
        }
    };

    const handleGenerate = async () => {
        if (project.generatedCode.length === 0) {
            setError("No code has been generated for this project yet. Please generate some code in the 'Tasks' view first.");
            return;
        }

        setIsLoading(true);
        setError('');
        setMermaidCode('');
        updateState({ isLoading: true, error: '', mermaidCode: '' });

        const allCode = project.generatedCode
            .map(file => `// File: ${file.fileName}\n\n${file.content}`)
            .join('\n\n---\n\n');

        const description = `Project Name: "${project.name}"\nProject Description: "${project.description}"\n\nHere is all the generated code for the project. Analyze it and create a system architecture diagram.\n\n${allCode}`;

        try {
            const result = await geminiService.generateArchitectureDiagram(description);
            const newKey = key + 1;
            setMermaidCode(result);
            setKey(newKey);
            updateState({ mermaidCode: result, key: newKey, isLoading: false });
        } catch (e) {
            const errorMessage = (e as Error).message;
            setError(errorMessage);
            updateState({ error: errorMessage, isLoading: false });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (mermaidCode && (window as any).mermaid) {
            try {
                (window as any).mermaid.run();
            } catch (e) {
                console.error("Mermaid rendering error:", e);
                setError("Failed to render the diagram. The generated syntax might be invalid.");
            }
        }
    }, [mermaidCode, key]);

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold">Architecture Diagram Generator</h2>
                    <p className="text-gray-400 mt-1">Automatically generate a diagram from all the AI-generated code in your project.</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Generating...' : 'Generate Diagram'} <LogoIcon className="w-5 h-5 button-logo-icon" />
                </button>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 overflow-auto flex-grow flex items-center justify-center">
                {isLoading && (
                    <div className="text-center">
                        <div className="relative mx-auto mb-4 w-16 h-16">
                            <LogoIcon />
                            <div className="absolute inset-0 animate-ping">
                                <LogoIcon />
                            </div>
                            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
                                <div className="w-full h-full border-2 border-blue-500 border-t-transparent rounded-full opacity-30"></div>
                            </div>
                        </div>
                        <p className="text-gray-400 animate-pulse">Loading Diagram...</p>
                    </div>
                )}
                {error && <p className="text-red-400 max-w-md text-center">{error}</p>}
                {mermaidCode && (
                    <div key={key} className="mermaid w-full h-full text-gray-200">
                        {mermaidCode}
                    </div>
                )}
                {!isLoading && !mermaidCode && !error && (
                    <div className="text-center text-gray-500">
                        <p>Click the button to generate your project's architecture diagram.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArchitectureView;
