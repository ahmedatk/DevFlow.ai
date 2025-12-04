import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import { LogoIcon } from '../components/icons';
import ReactMarkdown from 'react-markdown';

const RunReviewView = ({ state, onStateChange }: { state?: { code: string; language: string; output: string; isLoading: boolean; error: string }, onStateChange?: (updates: Partial<{ code: string; language: string; output: string; isLoading: boolean; error: string }>) => void }) => {
    const [code, setCode] = useState(state?.code || '');
    const [language, setLanguage] = useState(state?.language || 'javascript');
    const [output, setOutput] = useState(state?.output || '');
    const [isLoading, setIsLoading] = useState(state?.isLoading || false);
    const [error, setError] = useState(state?.error || '');

    // Component will remount when switching views, so state prop will be used in useState initialization above

    // Update persisted state when local state changes
    const updateState = (updates: Partial<{ code: string; language: string; output: string; isLoading: boolean; error: string }>) => {
        if (onStateChange) {
            onStateChange(updates);
        }
    };

    const handleCodeChange = (value: string) => {
        setCode(value);
        updateState({ code: value });
    };

    const handleLanguageChange = (value: string) => {
        setLanguage(value);
        updateState({ language: value });
    };

    const handleSubmit = async () => {
        if (!code.trim()) return;
        setIsLoading(true);
        setError('');
        setOutput('');
        updateState({ isLoading: true, error: '', output: '' });
        try {
            const result = await geminiService.runAndReviewCode(code, language);
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
            <h2 className="text-2xl font-bold">Run & Review Code</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                <div className="flex flex-col gap-4">
                    <select value={language} onChange={e => handleLanguageChange(e.target.value)} className="bg-gray-800 border border-gray-700 p-2 rounded-lg">
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="typescript">TypeScript</option>
                        <option value="go">Go</option>
                    </select>
                    <textarea
                        className="w-full h-full p-3 bg-gray-800 border border-gray-700 rounded-lg flex-grow"
                        value={code}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        placeholder={`Paste ${language} code here...`}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Processing...' : 'Run & Review'} <LogoIcon className="w-5 h-5 button-logo-icon" />
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
                    {output && <div className="prose prose-invert max-w-none"><ReactMarkdown>{output}</ReactMarkdown></div>}
                </div>
            </div>
        </div>
    );
};

export default RunReviewView;
