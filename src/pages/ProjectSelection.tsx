import React, { useState } from 'react';
import { Project } from '../types';
import { LogoIcon } from '../components/icons';

// --- Project Selection View ---
const ProjectSelection = ({ projects, onSelectProject, onCreateProject, onDeleteProject, onLogout }: { projects: Project[], onSelectProject: (id: string) => void, onCreateProject: (name: string, desc: string) => void, onDeleteProject: (id: string) => void, onLogout: () => void }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    // Deletion state
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [deleteStep, setDeleteStep] = useState(0); // 0: None, 1: Confirm, 2: Really Sure, 3: Type Name
    const [deleteConfirmationName, setDeleteConfirmationName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && description) {
            onCreateProject(name, description);
            setName('');
            setDescription('');
            setIsCreating(false);
        }
    };

    const initiateDelete = (e: React.MouseEvent, project: Project) => {
        e.stopPropagation();
        setProjectToDelete(project);
        setDeleteStep(1);
    };

    const cancelDelete = () => {
        setProjectToDelete(null);
        setDeleteStep(0);
        setDeleteConfirmationName('');
    };

    const confirmDeleteStep1 = () => setDeleteStep(2);
    const confirmDeleteStep2 = () => setDeleteStep(3);

    const finalizeDelete = () => {
        if (projectToDelete && deleteConfirmationName === projectToDelete.name) {
            onDeleteProject(projectToDelete.id);
            cancelDelete();
        }
    };

    return (
        <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8 relative">
            <div className="absolute top-4 right-4">
                <button onClick={onLogout} className="flex items-center gap-2 bg-gray-700 text-sm py-2 px-3 rounded-lg hover:bg-gray-600">Logout</button>
            </div>
            <h1 className="text-4xl font-bold mb-8">Your Projects</h1>
            <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-6 relative">
                <h2 className="text-2xl font-semibold mb-4">Select a Project</h2>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {projects.length > 0 ? projects.map(p => (
                        <div key={p.id} onClick={() => onSelectProject(p.id)} className="group relative p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">{p.name}</h3>
                                <p className="text-sm text-gray-400 group-hover:text-blue-200">{p.description}</p>
                            </div>
                            <button
                                onClick={(e) => initiateDelete(e, p)}
                                className="p-2 bg-gray-600 rounded-full hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Project"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    )) : <p className="text-gray-500 text-center py-4">No projects yet. Create one to get started!</p>}
                </div>
                <hr className="my-6 border-gray-600" />
                {isCreating ? (
                    <form onSubmit={handleSubmit}>
                        <h2 className="text-2xl font-semibold mb-4">Create New Project</h2>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Project Name" className="w-full p-2 mb-3 bg-gray-700 rounded" required />
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Project Description" className="w-full p-2 mb-3 bg-gray-700 rounded h-24" required />
                        <div className="flex gap-2">
                            <button type="submit" className="flex-1 bg-blue-600 p-2 rounded hover:bg-blue-500">Create Project</button>
                            <button type="button" onClick={() => setIsCreating(false)} className="flex-1 bg-gray-600 p-2 rounded hover:bg-gray-500">Cancel</button>
                        </div>
                    </form>
                ) : (
                    <button onClick={() => setIsCreating(true)} className="w-full flex items-center justify-center gap-2 bg-blue-600 p-2 rounded hover:bg-blue-500">
                        <LogoIcon className="w-5 h-5 button-logo-icon" /> Create New Project
                    </button>
                )}

                {/* Delete Confirmation Modal */}
                {projectToDelete && (
                    <div className="absolute inset-0 bg-gray-900/95 rounded-lg flex items-center justify-center p-6 z-10">
                        <div className="w-full max-w-md text-center">
                            {deleteStep === 1 && (
                                <>
                                    <h3 className="text-xl font-bold mb-4 text-red-500">Delete Project?</h3>
                                    <p className="mb-6">Are you sure you want to delete <strong>{projectToDelete.name}</strong>?</p>
                                    <div className="flex gap-3">
                                        <button onClick={confirmDeleteStep1} className="flex-1 bg-red-600 py-2 rounded hover:bg-red-700">Yes, Delete</button>
                                        <button onClick={cancelDelete} className="flex-1 bg-gray-600 py-2 rounded hover:bg-gray-500">Cancel</button>
                                    </div>
                                </>
                            )}
                            {deleteStep === 2 && (
                                <>
                                    <h3 className="text-xl font-bold mb-4 text-red-500">Warning!</h3>
                                    <p className="mb-6">This action is <strong>irreversible</strong>. All files, tasks, and chats will be lost forever.</p>
                                    <div className="flex gap-3">
                                        <button onClick={confirmDeleteStep2} className="flex-1 bg-red-600 py-2 rounded hover:bg-red-700">I Understand</button>
                                        <button onClick={cancelDelete} className="flex-1 bg-gray-600 py-2 rounded hover:bg-gray-500">Cancel</button>
                                    </div>
                                </>
                            )}
                            {deleteStep === 3 && (
                                <>
                                    <h3 className="text-xl font-bold mb-4 text-red-500">Final Verification</h3>
                                    <p className="mb-4">Type <strong>{projectToDelete.name}</strong> to confirm deletion.</p>
                                    <input
                                        type="text"
                                        value={deleteConfirmationName}
                                        onChange={e => setDeleteConfirmationName(e.target.value)}
                                        className="w-full p-2 mb-4 bg-gray-800 border border-red-500 rounded text-center"
                                        placeholder="Project Name"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={finalizeDelete}
                                            disabled={deleteConfirmationName !== projectToDelete.name}
                                            className="flex-1 bg-red-600 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Delete Forever
                                        </button>
                                        <button onClick={cancelDelete} className="flex-1 bg-gray-600 py-2 rounded hover:bg-gray-500">Cancel</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectSelection;
