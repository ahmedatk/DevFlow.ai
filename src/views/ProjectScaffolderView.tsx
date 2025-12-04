import React, { useState } from 'react';
import { Project } from '../types';
import * as geminiService from '../services/geminiService';
import { View } from '../components/layout/Sidebar';
import { LogoIcon } from '../components/icons';

const ProjectScaffolderView = ({ project, onUpdateProject, onSwitchView }: { project: Project, onUpdateProject: (updates: Partial<Project>) => void, onSwitchView: (view: View) => void }) => {
    const [description, setDescription] = useState(project.description);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleScaffold = async () => {
        if (!description.trim()) return;
        setIsLoading(true);
        setError('');
        try {
            const generatedFiles = await geminiService.generateProjectScaffold(description);
            onUpdateProject({ generatedCode: generatedFiles });
            onSwitchView('editor'); // Switch to editor to see the result
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">AI Project Scaffolder</h2>
            <p className="text-gray-400 mb-6">Describe the application you want to build, and DevFlow.AI will generate the complete file structure and boilerplate code for you.</p>
            <textarea
                className="w-full h-40 p-3 bg-gray-800 border border-gray-700 rounded-lg mb-4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., 'A simple React to-do list app with a Node.js backend and a single API endpoint to get tasks.'"
            />
            <button
                onClick={handleScaffold}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? 'Generating Project...' : 'Generate Full Project'}
                <LogoIcon className="w-5 h-5 button-logo-icon" />
            </button>
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        </div>
    );
};

export default ProjectScaffolderView;
