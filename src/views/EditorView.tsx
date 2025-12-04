import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Project, GeneratedCode } from '../types';
import { FileIcon, TrashIcon, FolderOpenIcon, FolderIcon, LogoIcon, DeployIcon } from '../components/icons';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import JSZip from 'jszip';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css'; // Import a theme

interface FileTreeNode {
    isFile: boolean;
    path: string;
    children?: { [key: string]: FileTreeNode };
}

// Fix: Correctly build file tree by adding `path` property to directory nodes.
// This ensures the tree nodes conform to the `FileTreeNode` interface and resolves downstream type errors.
const buildFileTree = (files: GeneratedCode[]): { [key: string]: FileTreeNode } => {
    const tree: { [key: string]: any } = {};
    const sortedFiles = [...files].sort((a, b) => a.fileName.localeCompare(b.fileName));

    sortedFiles.forEach(file => {
        const parts = file.fileName.split('/');
        let currentLevel = tree;
        const currentPathParts: string[] = [];
        parts.forEach((part, index) => {
            currentPathParts.push(part);
            if (index === parts.length - 1) { // It's a file
                currentLevel[part] = { isFile: true, path: file.fileName };
            } else { // It's a directory
                if (!currentLevel[part]) {
                    currentLevel[part] = { isFile: false, path: currentPathParts.join('/'), children: {} };
                }
                currentLevel = currentLevel[part].children;
            }
        });
    });
    return tree;
};

const FileTreeItem = ({
    name, node, onFileSelect, selectedFile, level, onDeleteFile, dirtyFiles
}: {
    name: string; node: FileTreeNode; onFileSelect: (path: string) => void;
    selectedFile: string | null; level: number; onDeleteFile: (path: string) => void; dirtyFiles: Set<string>;
}) => {
    const [isOpen, setIsOpen] = useState(true);

    if (node.isFile) {
        const isFileDirty = dirtyFiles.has(node.path);
        return (
            <div
                className={`w-full flex items-center justify-between group rounded-md ${selectedFile === node.path ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                style={{ paddingLeft: `${level * 1.25}rem` }}
            >
                <button
                    onClick={() => onFileSelect(node.path)}
                    className={`flex-grow text-left flex items-center gap-2 p-1.5 rounded-md text-sm ${selectedFile === node.path ? 'text-white' : ''}`}
                >
                    <FileIcon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{name}{isFileDirty ? '*' : ''}</span>
                </button>
                <button
                    onClick={() => onDeleteFile(node.path)}
                    className="p-1 mr-1 rounded-full text-gray-500 hover:bg-gray-800 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Delete ${name}`}
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{ paddingLeft: `${level * 1.25}rem` }}
                className="w-full text-left flex items-center gap-2 p-1.5 rounded-md text-sm hover:bg-gray-700"
            >
                {isOpen ? <FolderOpenIcon className="w-4 h-4 shrink-0" /> : <FolderIcon className="w-4 h-4 shrink-0" />}
                <span className="truncate font-semibold">{name}</span>
            </button>
            {isOpen && (
                <div className="space-y-0.5">
                    {Object.entries(node.children!).sort(([aName, aNode], [bName, bNode]) => {
                        if (aNode.isFile && !bNode.isFile) return 1;
                        if (!aNode.isFile && bNode.isFile) return -1;
                        return aName.localeCompare(bName);
                    }).map(([childName, childNode]) => (
                        <FileTreeItem key={childName} name={childName} node={childNode} onFileSelect={onFileSelect} selectedFile={selectedFile} level={level + 1} onDeleteFile={onDeleteFile} dirtyFiles={dirtyFiles} />
                    ))}
                </div>
            )}
        </div>
    );
};


const EditorView = ({ project, onUpdateProject }: { project: Project, onUpdateProject: (updates: Partial<Project>) => void }) => {
    const [editableFiles, setEditableFiles] = useState(() => (project.generatedCode || []).map(f => ({ ...f })));
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());
    const [isOutOfSync, setIsOutOfSync] = useState(false);
    const baseProjectCodeRef = useRef(project.generatedCode || []);

    const [isDownloading, setIsDownloading] = useState(false);
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
    const [deployment, setDeployment] = useState<{ mainUrl: string; assetUrls: string[] } | null>(null);
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployError, setDeployError] = useState('');
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    // Handle navigation messages from iframe
    useEffect(() => {
        if (!deployment) return;

        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'NAVIGATE') {
                const targetUrl = event.data.url;
                if (targetUrl && targetUrl.startsWith('blob:') && iframeRef.current) {
                    console.log('Navigating iframe to:', targetUrl);
                    iframeRef.current.src = targetUrl;
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [deployment]);

    const hasUnsavedChanges = useMemo(() => {
        if (dirtyFiles.size > 0) return true;

        const baseFiles = baseProjectCodeRef.current;
        if (editableFiles.length !== baseFiles.length) return true;

        const baseFileNames = new Set(baseFiles.map(f => f.fileName));
        for (const file of editableFiles) {
            if (!baseFileNames.has(file.fileName)) return true;
        }

        return false;
    }, [editableFiles, dirtyFiles]);

    useEffect(() => {
        // This effect detects and handles external changes to the project files.
        const externalCode = project.generatedCode || [];
        if (externalCode !== baseProjectCodeRef.current) {
            if (hasUnsavedChanges) {
                setIsOutOfSync(true);
            } else {
                setEditableFiles(externalCode.map(f => ({ ...f })));
                baseProjectCodeRef.current = externalCode;
                setDirtyFiles(new Set());
                setIsOutOfSync(false);

                const fileExists = (name: string | null) => name ? externalCode.some(f => f.fileName === name) : false;
                if (!fileExists(selectedFileName)) {
                    const sortedFiles = [...externalCode].sort((a, b) => a.fileName.localeCompare(b.fileName));
                    const readme = sortedFiles.find(f => f.fileName.toLowerCase() === 'readme.md');
                    setSelectedFileName(readme ? readme.fileName : (sortedFiles.length > 0 ? sortedFiles[0].fileName : null));
                }
            }
        }
    }, [project.generatedCode, hasUnsavedChanges, selectedFileName]);

    useEffect(() => {
        // Select initial file on mount
        if (!selectedFileName) {
            const sortedFiles = [...editableFiles].sort((a, b) => a.fileName.localeCompare(b.fileName));
            const readme = sortedFiles.find(f => f.fileName.toLowerCase() === 'readme.md');
            setSelectedFileName(readme ? readme.fileName : (sortedFiles.length > 0 ? sortedFiles[0].fileName : null));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cleanup deployment URLs on unmount - No longer needed for VFS
    useEffect(() => {
        return () => {
            // No cleanup needed for VFS
        };
    }, [deployment]);

    // Track the last deployed files to detect changes
    const lastDeployedFilesRef = useRef<string>('');
    const isAutoDeployingRef = useRef(false);
    const previousTabRef = useRef<'editor' | 'preview'>('editor');
    const currentFilesHashRef = useRef<string>('');

    // Update the current files hash whenever editableFiles changes
    useEffect(() => {
        currentFilesHashRef.current = JSON.stringify(editableFiles.map(f => ({ fileName: f.fileName, content: f.content })));
    }, [editableFiles]);

    const fileTree = useMemo(() => buildFileTree(editableFiles), [editableFiles]);

    const handleCodeChange = (newCode: string) => {
        if (!selectedFileName) return;
        setEditableFiles(currentFiles =>
            currentFiles.map(file =>
                file.fileName === selectedFileName ? { ...file, content: newCode } : file
            )
        );
        setDirtyFiles(currentDirty => new Set(currentDirty).add(selectedFileName));
    };

    const handleSaveChanges = () => {
        onUpdateProject({ generatedCode: editableFiles });
        setDirtyFiles(new Set());
        baseProjectCodeRef.current = editableFiles;
        setIsOutOfSync(false);
    };

    const handleForceSync = () => {
        if (window.confirm("You have unsaved changes that will be lost. Are you sure you want to discard them and load the latest project files?")) {
            const externalCode = project.generatedCode || [];
            setEditableFiles(externalCode.map(f => ({ ...f })));
            baseProjectCodeRef.current = externalCode;
            setDirtyFiles(new Set());
            setIsOutOfSync(false);
        }
    };

    const handleCreateFile = () => {
        const fileName = prompt("Enter new file name (including path, e.g., src/New.tsx):");
        if (fileName && fileName.trim()) {
            const trimmedName = fileName.trim();
            if (editableFiles.some(f => f.fileName === trimmedName)) {
                alert("A file with that name already exists.");
                return;
            }
            const newFile: GeneratedCode = { fileName: trimmedName, content: '' };
            setEditableFiles(current => [...current, newFile]);
            setSelectedFileName(trimmedName);
        }
    };

    const handleDeleteFile = (path: string) => {
        if (window.confirm(`Are you sure you want to delete ${path}? This change will be permanent once you save.`)) {
            const newFiles = editableFiles.filter(f => f.fileName !== path);
            setEditableFiles(newFiles);

            if (selectedFileName === path) {
                const sortedFiles = [...newFiles].sort((a, b) => a.fileName.localeCompare(b.fileName));
                setSelectedFileName(sortedFiles.length > 0 ? sortedFiles[0].fileName : null);
            }

            setDirtyFiles(currentDirty => {
                const newDirty = new Set(currentDirty);
                newDirty.delete(path);
                return newDirty;
            });
        }
    };

    const getLanguage = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'js': case 'jsx': return 'jsx';
            case 'ts': case 'tsx': return 'tsx';
            case 'css': return 'css';
            case 'json': return 'json';
            case 'html': return 'markup';
            case 'md': return 'markdown';
            case 'sh': return 'bash';
            default: return 'clike';
        }
    };

    const highlightCode = (code: string) => {
        const lang = getLanguage(selectedFileName || '');
        if (Prism.languages[lang]) {
            return Prism.highlight(code, Prism.languages[lang], lang);
        }
        return Prism.util.encode(code);
    };

    const handleDownloadProject = async () => {
        if (editableFiles.length === 0) return;
        setIsDownloading(true);
        const zip = new JSZip();
        editableFiles.forEach(file => { zip.file(file.fileName, file.content); });
        const blob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${project.name.replace(/[\s\W]+/g, '_') || 'devflow_project'}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        setIsDownloading(false);
    };

    // Deployment function - always uses latest editableFiles to ensure preview shows current code
    // Deployment function - Uses Service Worker VFS
    const handleDeployProject = useCallback(async () => {
        setIsDeploying(true);
        setDeployError('');

        try {
            if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
                // Try to register if not active
                if ('serviceWorker' in navigator) {
                    await navigator.serviceWorker.register('/service-worker.js');
                    await navigator.serviceWorker.ready;
                    if (!navigator.serviceWorker.controller) {
                        window.location.reload(); // Force reload to activate SW
                        return;
                    }
                } else {
                    throw new Error("Service Worker not supported in this browser.");
                }
            }

            // Prepare files
            const filesToSend = editableFiles.map(f => ({ ...f }));

            // Process HTML files to inject Babel and Error Handler
            const htmlFiles = filesToSend.filter(f => f.fileName.toLowerCase().endsWith('.html'));
            const needsBabel = filesToSend.some(f => /\.(jsx|tsx)$/.test(f.fileName));

            for (const htmlFile of htmlFiles) {
                const doc = new DOMParser().parseFromString(htmlFile.content, 'text/html');

                // Inject Error Handler
                const errorHandlerScript = doc.createElement('script');
                errorHandlerScript.textContent = `
                    window.addEventListener('error', e => console.error('Preview Error:', e.message));
                `;
                doc.head.appendChild(errorHandlerScript);

                // Inject Babel if needed
                if (needsBabel) {
                    const babelScript = doc.createElement('script');
                    babelScript.src = "https://unpkg.com/@babel/standalone/babel.min.js";
                    doc.head.appendChild(babelScript);

                    // Transform scripts to text/babel
                    doc.querySelectorAll('script[src]').forEach(s => {
                        const src = s.getAttribute('src');
                        if (src && /\.(jsx|tsx)$/.test(src)) {
                            s.setAttribute('type', 'text/babel');
                            s.setAttribute('data-type', 'module');
                        }
                    });
                }

                htmlFile.content = new XMLSerializer().serializeToString(doc);
            }

            // Send to SW
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                if (event.data.type === 'FILES_UPDATED') {
                    setDeployment({
                        mainUrl: '/_preview/index.html',
                        assetUrls: []
                    });

                    if (activeTab !== 'preview') {
                        setActiveTab('preview');
                    }
                    setIsDeploying(false);
                }
            };

            navigator.serviceWorker.controller.postMessage({
                type: 'UPDATE_FILES',
                files: filesToSend
            }, [messageChannel.port2]);

        } catch (e: any) {
            setDeployError(e.message);
            setIsDeploying(false);
        }
    }, [editableFiles, activeTab]);

    // Auto-redeploy when switching to preview tab if there are code changes
    // This ensures the preview always shows the latest code changes
    useEffect(() => {
        // Only trigger when actually switching TO preview (not when already on preview)
        const isSwitchingToPreview = activeTab === 'preview' && previousTabRef.current !== 'preview';
        previousTabRef.current = activeTab;

        if (isSwitchingToPreview && !isAutoDeployingRef.current && !isDeploying) {
            // Get the current files hash from ref (always up to date)
            const currentFilesHash = currentFilesHashRef.current;

            // If there's no deployment or files have changed, deploy automatically
            if (!deployment || currentFilesHash !== lastDeployedFilesRef.current) {
                if (editableFiles.length > 0) {
                    isAutoDeployingRef.current = true;
                    // Call handleDeployProject and reset flag when done
                    handleDeployProject().then(() => {
                        isAutoDeployingRef.current = false;
                    }).catch(() => {
                        isAutoDeployingRef.current = false;
                    });
                }
            }
        }
    }, [activeTab, deployment, isDeploying, handleDeployProject]); // Include handleDeployProject in dependencies

    if (project.generatedCode.length === 0 && editableFiles.length === 0) {
        return <div className="text-center p-8 bg-gray-800 rounded-lg"><h2 className="text-2xl font-bold">Editor is Empty</h2><p className="text-gray-400 mt-2">Use 'Project Scaffolder' or 'Tasks' to generate files.</p></div>;
    }

    // Get the content of the selected file for editing
    const selectedFileContent = editableFiles.find(f => f.fileName === selectedFileName)?.content ?? '';

    return (
        <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
            <div className="flex justify-between items-center shrink-0 mb-4">
                <h2 className="text-2xl font-bold">Project Editor</h2>
                <div className="flex items-center gap-2">
                    <button onClick={handleSaveChanges} disabled={!hasUnsavedChanges} className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"><LogoIcon className="w-5 h-5 button-logo-icon" /> Save Changes</button>
                    <button onClick={handleDownloadProject} disabled={isDownloading} className="flex items-center justify-center gap-2 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"><LogoIcon className="w-5 h-5 button-logo-icon" />{isDownloading ? 'Zipping...' : 'Download'}</button>
                    <button onClick={handleDeployProject} disabled={isDeploying} className="flex items-center justify-center gap-2 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"><LogoIcon className="w-5 h-5 button-logo-icon" />{isDeploying ? 'Deploying...' : 'Deploy'}</button>
                    {deployment && (
                        <button
                            onClick={() => window.open(deployment.mainUrl, '_blank', 'noopener,noreferrer')}
                            className="flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-500 transition-colors"
                            title="Open preview in new tab"
                        >
                            <LogoIcon className="w-5 h-5 button-logo-icon" /> Open in New Tab
                        </button>
                    )}
                </div>
            </div>
            {isOutOfSync && (
                <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-300 text-sm p-2 rounded-md flex justify-between items-center shrink-0 mb-4">
                    <span>Project files were updated externally. Discard your changes to see the latest version.</span>
                    <button onClick={handleForceSync} className="bg-yellow-500 text-black font-bold py-1 px-3 rounded-md text-xs hover:bg-yellow-400">
                        Discard & Refresh
                    </button>
                </div>
            )}
            <div className="border-b border-gray-700 shrink-0 mb-4">
                <nav className="flex space-x-2">
                    <button onClick={() => setActiveTab('editor')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'editor' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}>Editor</button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`py-2 px-4 text-sm font-medium ${activeTab === 'preview' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white border-b-2 border-transparent'} ${editableFiles.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={editableFiles.length === 0}
                    >
                        Preview {hasUnsavedChanges && deployment && ' (needs update)'}
                    </button>
                </nav>
            </div>
            {deployError && <p className="text-red-400 text-sm shrink-0 -mt-2 mb-4">{deployError}</p>}

            {activeTab === 'editor' ? (
                <div className="flex-1 grid grid-cols-12 gap-4" style={{ minHeight: 0, height: '100%', maxHeight: '100%' }}>
                    <div className="col-span-3 bg-gray-800 rounded-lg p-2 border border-gray-700 flex flex-col" style={{ minHeight: 0, height: '100%' }}>
                        <button onClick={handleCreateFile} className="w-full flex items-center justify-center gap-2 bg-gray-700 text-sm py-2 px-3 rounded-md hover:bg-gray-600 mb-2 shrink-0"><LogoIcon className="w-4 h-4 button-logo-icon" /> New File</button>
                        <div className="overflow-y-auto flex-1 space-y-0.5 pr-1" style={{ minHeight: 0 }}>
                            {Object.entries(fileTree).sort(([aName, aNode], [bName, bNode]) => {
                                if (aNode.isFile && !bNode.isFile) return 1;
                                if (!aNode.isFile && bNode.isFile) return -1;
                                return aName.localeCompare(bName);
                            }).map(([name, node]) => (
                                <FileTreeItem key={name} name={name} node={node} onFileSelect={setSelectedFileName} selectedFile={selectedFileName} level={0} onDeleteFile={handleDeleteFile} dirtyFiles={dirtyFiles} />
                            ))}
                        </div>
                    </div>
                    {/* Code editor container - properly configured for scrolling */}
                    <div className="col-span-9 bg-gray-900 rounded-lg border border-gray-700" style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {selectedFileName ? (
                            <div className="editor-scroll-container" style={{ flex: 1, minHeight: 0, height: '100%', width: '100%', overflow: 'auto', position: 'relative' }}>
                                <Editor
                                    value={selectedFileContent}
                                    onValueChange={handleCodeChange}
                                    highlight={highlightCode}
                                    padding={16}
                                    style={{
                                        fontFamily: '"Fira Code", "Fira Mono", monospace',
                                        fontSize: 14,
                                        width: '100%',
                                        minHeight: '100%',
                                        background: '#1E1E1E',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center flex-1">Select a file to view or edit.</div>
                        )}
                    </div>
                </div>
            ) : isDeploying ? (
                <div className="flex-grow flex items-center justify-center bg-gray-800 rounded-lg border border-gray-700">
                    <div className="text-center text-gray-500">
                        <DeployIcon className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                        <p>Deploying latest changes...</p>
                    </div>
                </div>
            ) : deployment ? (
                <div className="flex-grow bg-gray-800 rounded-lg border border-gray-700 p-1 relative">
                    <iframe
                        ref={iframeRef}
                        key={deployment.mainUrl}
                        src={deployment.mainUrl}
                        className="w-full h-full border-0 bg-white rounded-md"
                        title="Deployment Preview"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads allow-orientation-lock allow-pointer-lock allow-presentation allow-top-navigation-by-user-activation"
                        allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; vr; xr-spatial-tracking; fullscreen"
                        loading="eager"
                        referrerPolicy="no-referrer-when-downgrade"
                        onLoad={(e) => {
                            // Monitor iframe load for heavy applications
                        }}
                    />
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center bg-gray-800 rounded-lg border border-gray-700">
                    <div className="text-center text-gray-500">
                        <DeployIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Click "Deploy" to view your application.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditorView;
