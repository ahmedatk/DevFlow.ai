import React, { useState, useEffect, useRef } from 'react';
import { Project } from '../types';
import { FileIcon, LogoIcon, CodeIcon } from '../components/icons';
import ReactMarkdown from 'react-markdown';

// Enhanced tool view with file selection from project
const EnhancedToolView = ({ title, description, serviceFn, outputType = 'markdown', project, state, onStateChange }: {
    title: string,
    description: string,
    serviceFn: (input: string) => Promise<string>,
    outputType?: 'markdown' | 'code',
    project: Project,
    state?: { input: string; output: string; isLoading: boolean; error: string; selectedFile?: string | null; inputMode?: 'file' | 'manual' },
    onStateChange?: (updates: Partial<{ input: string; output: string; isLoading: boolean; error: string; selectedFile?: string | null; inputMode?: 'file' | 'manual' }>) => void
}) => {
    // Initialize state from persisted state, ensuring each tool has its own isolated state
    // Track the previous state object to detect tool switches
    const prevStateRef = useRef(state);

    const [input, setInput] = useState(() => state?.input || '');
    const [output, setOutput] = useState(() => state?.output || '');
    const [isLoading, setIsLoading] = useState(() => state?.isLoading || false);
    const [error, setError] = useState(() => state?.error || '');
    const [selectedFile, setSelectedFile] = useState<string | null>(() => state?.selectedFile || null);
    const [inputMode, setInputMode] = useState<'file' | 'manual'>(() => state?.inputMode || 'file');

    // Sync state when switching tools - detect when state object reference changes
    useEffect(() => {
        // Check if we've switched to a different tool (state object reference changed)
        const isToolSwitch = prevStateRef.current !== state;

        if (isToolSwitch && state) {
            // Tool switch detected - load the new tool's state
            setInput(state.input || '');
            setOutput(state.output || '');
            setIsLoading(state.isLoading || false);
            setError(state.error || '');
            setSelectedFile(state.selectedFile || null);
            setInputMode(state.inputMode || 'file');
            prevStateRef.current = state;
        } else if (state && !isToolSwitch) {
            // Same tool - only sync output/loading/error from API responses
            // Don't overwrite user's input/selection
            if (state.output !== undefined) {
                setOutput(state.output);
            }
            if (state.isLoading !== undefined) {
                setIsLoading(state.isLoading);
            }
            if (state.error !== undefined) {
                setError(state.error);
            }
        }
    }, [state]);

    const updateState = (updates: Partial<{ input: string; output: string; isLoading: boolean; error: string; selectedFile?: string | null; inputMode?: 'file' | 'manual' }>) => {
        if (onStateChange) {
            onStateChange(updates);
        }
    };

    const projectFiles = project.generatedCode || [];

    const handleFileSelect = (fileName: string) => {
        const file = projectFiles.find(f => f.fileName === fileName);
        if (file) {
            setSelectedFile(fileName);
            const fileContent = `// File: ${fileName}\n\n${file.content}`;
            setInput(fileContent);
            updateState({ input: fileContent, selectedFile: fileName, inputMode: 'file' });
        }
    };

    const handleInputChange = (value: string) => {
        setInput(value);
        // If user manually edits, switch to manual mode and clear selected file
        if (value.trim() && selectedFile) {
            setSelectedFile(null);
            setInputMode('manual');
            updateState({ input: value, selectedFile: null, inputMode: 'manual' });
        } else {
            updateState({ input: value });
        }
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
                <p className="text-gray-400 mt-1">{description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-0">
                <div className="flex flex-col gap-4">
                    {/* File Selection Section */}
                    {projectFiles.length > 0 && (
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-300">Select from Project Files</h3>
                                <button
                                    onClick={() => {
                                        const newMode = inputMode === 'file' ? 'manual' : 'file';
                                        setInputMode(newMode);
                                        if (newMode === 'manual') {
                                            setSelectedFile(null);
                                            setInput('');
                                            updateState({ input: '', selectedFile: null, inputMode: 'manual' });
                                        } else {
                                            updateState({ inputMode: 'file' });
                                        }
                                    }}
                                    className="text-xs text-blue-400 hover:text-blue-300"
                                >
                                    {inputMode === 'file' ? 'Switch to Manual Input' : 'Switch to File Selection'}
                                </button>
                            </div>
                            {inputMode === 'file' ? (
                                <div className="max-h-48 overflow-y-auto space-y-1">
                                    {projectFiles.map((file) => (
                                        <button
                                            key={file.fileName}
                                            onClick={() => handleFileSelect(file.fileName)}
                                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${selectedFile === file.fileName
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            <FileIcon className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{file.fileName}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400">Manual input mode - type or paste your code below</p>
                            )}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="flex-grow flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-300">
                                {inputMode === 'file' && selectedFile ? `Code from: ${selectedFile}` : 'Code Input'}
                            </label>
                            {selectedFile && (
                                <button
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setInput('');
                                        updateState({ input: '', selectedFile: null });
                                    }}
                                    className="text-xs text-gray-400 hover:text-gray-300"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <textarea
                            className="w-full h-full p-3 bg-gray-800 border border-gray-700 rounded-lg flex-grow font-mono text-sm resize-none"
                            value={input}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder={inputMode === 'file' ? 'Select a file from above...' : 'Enter or paste your code here...'}
                            readOnly={inputMode === 'file' && selectedFile !== null}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !input.trim()}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Processing...' : 'Analyze Code'} <LogoIcon className="w-5 h-5 button-logo-icon" />
                    </button>
                </div>

                {/* Output Area */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 overflow-y-auto flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Result</h3>
                    <div className="flex-grow">
                        {isLoading && (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="relative mx-auto mb-4 w-16 h-16">
                                        <div className="logo-loading">
                                            <LogoIcon />
                                        </div>
                                        <div className="absolute inset-0 animate-ping opacity-20">
                                            <LogoIcon />
                                        </div>
                                        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
                                            <div className="w-full h-full border-2 border-blue-500 border-t-transparent rounded-full opacity-30"></div>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 animate-pulse">Analyzing code...</p>
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                                <p className="text-red-400 font-semibold mb-1">Error</p>
                                <p className="text-red-300 text-sm">{error}</p>
                            </div>
                        )}
                        {output && !isLoading && (
                            outputType === 'code' ? (
                                <pre className="text-sm whitespace-pre-wrap bg-gray-900 p-4 rounded border border-gray-700"><code className="text-gray-200">{output}</code></pre>
                            ) : (
                                <div className="prose prose-invert max-w-none text-gray-200">
                                    <ReactMarkdown>{output}</ReactMarkdown>
                                </div>
                            )
                        )}
                        {!isLoading && !error && !output && (
                            <div className="flex items-center justify-center h-full text-gray-500 text-center">
                                <div>
                                    <CodeIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Select a file or enter code to get started</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedToolView;
