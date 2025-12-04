import React, { useState } from 'react';
import { LogoIcon } from '../components/icons';
import ReactMarkdown from 'react-markdown';

const SimpleToolView = ({ title, description, placeholder, serviceFn, outputType = 'markdown', state, onStateChange }: { title: string, description?: string, placeholder: string, serviceFn: (input: string) => Promise<string>, outputType?: 'markdown' | 'code', state?: { input: string; output: string; isLoading: boolean; error: string }, onStateChange?: (updates: Partial<{ input: string; output: string; isLoading: boolean; error: string }>) => void }) => {
    // Use persisted state if available, otherwise initialize with defaults
    const [input, setInput] = useState(state?.input || '');
    const [output, setOutput] = useState(state?.output || '');
    const [isLoading, setIsLoading] = useState(state?.isLoading || false);
    const [error, setError] = useState(state?.error || '');

    // Component will remount when switching views, so state prop will be used in useState initialization above

    // Update persisted state when local state changes
    const updateState = (updates: Partial<{ input: string; output: string; isLoading: boolean; error: string }>) => {
        if (onStateChange) {
            onStateChange(updates);
        }
    };

    const handleInputChange = (value: string) => {
        setInput(value);
        updateState({ input: value });
    };

    const handleSubmit = async () => {
        if (!input.trim()) return;
        setIsLoading(true);
        setError('');
        setOutput('');
        updateState({ isLoading: true, error: '', output: '' });
        try {
            const result = await serviceFn(input);
            setOutput(result);
            updateState({ output: result, isLoading: false });
        } catch (e) {
            const errorMessage = (e as Error).message;
            setError(errorMessage);
            updateState({ error: errorMessage, isLoading: false });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full gap-4">
            <div>
                <h2 className="text-2xl font-bold">{title}</h2>
                {description && <p className="text-gray-400">{description}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                <div className="flex flex-col gap-4">
                    <textarea
                        className="w-full h-full p-3 bg-gray-800 border border-gray-700 rounded-lg flex-grow"
                        value={input}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder={placeholder}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Processing...' : 'Generate'} <LogoIcon className="w-5 h-5 button-logo-icon" />
                    </button>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 overflow-y-auto">
                    {isLoading && (
                        <div className="flex items-center justify-center h-full min-h-[200px]">
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
                                <p className="text-gray-400 animate-pulse">Loading...</p>
                            </div>
                        </div>
                    )}
                    {error && <p className="text-red-400">{error}</p>}
                    {output && (
                        outputType === 'code' ?
                            <pre className="text-sm whitespace-pre-wrap"><code>{output}</code></pre> :
                            <div className="prose prose-invert max-w-none"><ReactMarkdown>{output}</ReactMarkdown></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SimpleToolView;
