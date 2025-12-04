import React, { useState } from 'react';
import { Project } from '../types';
import * as geminiService from '../services/geminiService';
import { LogoIcon, CommitIcon } from '../components/icons';
import ReactMarkdown from 'react-markdown';

// Commit Summarizer View with automatic git diff detection
const CommitSummarizerView = ({ project, state, onStateChange }: {
    project: Project,
    state?: { input: string; output: string; isLoading: boolean; error: string },
    onStateChange?: (updates: Partial<{ input: string; output: string; isLoading: boolean; error: string }>) => void
}) => {
    const [input, setInput] = useState(state?.input || '');
    const [output, setOutput] = useState(state?.output || '');
    const [isLoading, setIsLoading] = useState(state?.isLoading || false);
    const [error, setError] = useState(state?.error || '');
    const [isDetectingChanges, setIsDetectingChanges] = useState(false);

    const updateState = (updates: Partial<{ input: string; output: string; isLoading: boolean; error: string }>) => {
        if (onStateChange) {
            onStateChange(updates);
        }
    };

    // Try to detect changes from project files
    const detectChanges = async () => {
        setIsDetectingChanges(true);
        setError('');

        try {
            const projectFiles = project.generatedCode || [];

            if (projectFiles.length === 0) {
                setError('No project files found. Please ensure your project has files to compare.');
                setIsDetectingChanges(false);
                return;
            }

            // Create a simple diff format from all files
            let diffContent = '';

            // Group files by directory for better organization
            const filesByDir = new Map<string, typeof projectFiles>();
            projectFiles.forEach(file => {
                const dir = file.fileName.includes('/')
                    ? file.fileName.substring(0, file.fileName.lastIndexOf('/'))
                    : '/';
                if (!filesByDir.has(dir)) {
                    filesByDir.set(dir, []);
                }
                filesByDir.get(dir)!.push(file);
            });

            // Generate diff-like content
            for (const [dir, files] of filesByDir.entries()) {
                diffContent += `\n## Changes in ${dir || 'root'}\n\n`;
                files.forEach(file => {
                    diffContent += `diff --git a/${file.fileName} b/${file.fileName}\n`;
                    diffContent += `new file mode 100644\n`;
                    diffContent += `index 0000000..${file.fileName.length}\n`;
                    diffContent += `--- /dev/null\n`;
                    diffContent += `+++ b/${file.fileName}\n`;
                    diffContent += `@@ -0,0 +1,${file.content.split('\n').length} @@\n`;
                    file.content.split('\n').forEach((line) => {
                        diffContent += `+${line}\n`;
                    });
                    diffContent += '\n';
                });
            }

            if (diffContent.trim()) {
                setInput(diffContent);
                updateState({ input: diffContent });
            } else {
                setError('Could not detect changes. Please enter git diff manually.');
            }
        } catch (e) {
            setError('Failed to detect changes automatically. Please enter git diff manually.');
            console.error('Change detection error:', e);
        } finally {
            setIsDetectingChanges(false);
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
            const result = await geminiService.summarizeCommit(input);
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
                <h2 className="text-2xl font-bold">Commit Summarizer</h2>
                <p className="text-gray-400 mt-1">Generate clear and concise commit messages from your code changes</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-0">
                <div className="flex flex-col gap-4">
                    {/* Auto-detect button */}
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-300 mb-1">Auto-detect Changes</h3>
                                <p className="text-xs text-gray-400">Automatically generate diff from project files</p>
                            </div>
                            <button
                                onClick={detectChanges}
                                disabled={isDetectingChanges}
                                className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                                {isDetectingChanges ? (
                                    <>
                                        <LogoIcon className="w-4 h-4 button-logo-icon animate-spin" />
                                        Detecting...
                                    </>
                                ) : (
                                    <>
                                        <LogoIcon className="w-4 h-4 button-logo-icon" />
                                        Detect Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="flex-grow flex flex-col min-h-0">
                        <label className="text-sm font-medium text-gray-300 mb-2">Git Diff or Changes</label>
                        <textarea
                            className="w-full h-full p-3 bg-gray-800 border border-gray-700 rounded-lg flex-grow font-mono text-sm resize-none"
                            value={input}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder="Git diff will appear here after clicking 'Detect Changes', or paste your git diff manually..."
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !input.trim()}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Generating Summary...' : 'Generate Commit Message'} <LogoIcon className="w-5 h-5 button-logo-icon" />
                    </button>
                </div>

                {/* Output Area */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 overflow-y-auto flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Commit Message</h3>
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
                                    <p className="text-gray-400 animate-pulse">Generating commit message...</p>
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
                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                                <div className="prose prose-invert max-w-none text-gray-200">
                                    <ReactMarkdown>{output}</ReactMarkdown>
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(output);
                                        alert('Commit message copied to clipboard!');
                                    }}
                                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors text-sm"
                                >
                                    Copy to Clipboard
                                </button>
                            </div>
                        )}
                        {!isLoading && !error && !output && (
                            <div className="flex items-center justify-center h-full text-gray-500 text-center">
                                <div>
                                    <CommitIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Click "Detect Changes" or paste a git diff to generate a commit message</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommitSummarizerView;
