import React, { useState } from 'react';
import { Project, Task } from '../types';
import * as geminiService from '../services/geminiService';
import { View } from '../components/layout/Sidebar';
import {
    ScaffoldIcon, EditorIcon, CodeReviewIcon, TestGeneratorIcon, DocsIcon,
    ComplexityIcon, CommitIcon, ArchitectureIcon, RunReviewIcon, MemoryIcon,
    SimulationIcon, HeatmapIcon, TeamDashboardIcon, LogoIcon
} from '../components/icons';

const TaskDecomposerView = ({ project, onTasksGenerated, onSwitchView }: { project: Project, onTasksGenerated: (tasks: Task[]) => void, onSwitchView: (view: View) => void }) => {
    const [idea, setIdea] = useState(project.description);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDecompose = async () => {
        if (!idea.trim()) return;
        setIsLoading(true);
        setError('');
        try {
            const tasks = await geminiService.generateTasks(idea);
            onTasksGenerated(tasks);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    // Define tools with descriptions, organized by category
    const tools = [
        {
            id: 'scaffolder',
            name: 'Project Scaffolder',
            description: 'Generate a complete project structure with boilerplate code based on your description. Perfect for starting new projects quickly.',
            icon: <ScaffoldIcon className="w-6 h-6" />,
            category: 'tools',
            recommended: true
        },
        {
            id: 'editor',
            name: 'Code Editor',
            description: 'Edit and manage your project files with syntax highlighting, live preview, and deployment capabilities.',
            icon: <EditorIcon className="w-6 h-6" />,
            category: 'tools'
        },
        {
            id: 'reviewer',
            name: 'Code Reviewer',
            description: 'Get AI-powered code reviews with suggestions for improvements, bug detection, and best practices.',
            icon: <CodeReviewIcon className="w-6 h-6" />,
            category: 'tools'
        },
        {
            id: 'tester',
            name: 'Test Generator',
            description: 'Automatically generate comprehensive unit tests for your code to ensure quality and reliability.',
            icon: <TestGeneratorIcon className="w-6 h-6" />,
            category: 'tools'
        },
        {
            id: 'docs',
            name: 'Documentation Generator',
            description: 'Create detailed documentation from your code, including API docs, README files, and inline comments.',
            icon: <DocsIcon className="w-6 h-6" />,
            category: 'tools'
        },
        {
            id: 'complexity',
            name: 'Complexity Analysis',
            description: 'Analyze code complexity, identify potential refactoring opportunities, and optimize performance bottlenecks.',
            icon: <ComplexityIcon className="w-6 h-6" />,
            category: 'tools'
        },
        {
            id: 'summarizer',
            name: 'Commit Summarizer',
            description: 'Generate clear and concise commit messages from git diffs, making version control more organized.',
            icon: <CommitIcon className="w-6 h-6" />,
            category: 'tools'
        },
        {
            id: 'architecture',
            name: 'Architecture Diagram',
            description: 'Visualize your project architecture with automatically generated Mermaid diagrams showing system structure.',
            icon: <ArchitectureIcon className="w-6 h-6" />,
            category: 'tools'
        },
        {
            id: 'run_review',
            name: 'Run & Review',
            description: 'Execute code snippets in multiple languages and get instant feedback on output and potential issues.',
            icon: <RunReviewIcon className="w-6 h-6" />,
            category: 'tools'
        },
        {
            id: 'memory',
            name: 'Memory Agent',
            description: 'AI agent with persistent memory that learns from your project context and provides intelligent assistance.',
            icon: <MemoryIcon className="w-6 h-6" />,
            category: 'advanced'
        },
        {
            id: 'simulation',
            name: 'Agent Simulation',
            description: 'Simulate multi-agent development workflows with Project Manager, Developer, and QA agents working together.',
            icon: <SimulationIcon className="w-6 h-6" />,
            category: 'advanced'
        },
        {
            id: 'heatmap',
            name: 'Project Heatmap',
            description: 'Visualize project activity, file changes, and development patterns with interactive heatmaps.',
            icon: <HeatmapIcon className="w-6 h-6" />,
            category: 'advanced'
        },
        {
            id: 'team_dashboard',
            name: 'Team Dashboard',
            description: 'Track team progress, task distribution, and collaboration metrics across your development team.',
            icon: <TeamDashboardIcon className="w-6 h-6" />,
            category: 'advanced'
        }
    ];

    const toolsList = tools.filter(t => t.category === 'tools');
    const advancedList = tools.filter(t => t.category === 'advanced');
    const recommendedTool = tools.find(t => t.recommended);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Decompose Project into Tasks</h2>
                <p className="text-gray-400 mb-6">Based on your project description, DevFlow.AI can generate a list of development tasks to get you started.</p>
                <textarea
                    className="w-full h-32 p-3 bg-gray-800 border border-gray-700 rounded-lg mb-4"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Enter your project idea or description here..."
                />
                <button
                    onClick={handleDecompose}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Generating...' : 'Generate Tasks'}
                    <LogoIcon className="w-5 h-5 button-logo-icon" />
                </button>
                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>

            {/* Recommended Tool */}
            {recommendedTool && (
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <LogoIcon className="w-5 h-5 text-yellow-400 button-logo-icon" />
                        <h3 className="text-lg font-semibold text-yellow-400">Recommended Next Step</h3>
                    </div>
                    <div
                        onClick={() => onSwitchView(recommendedTool.id as View)}
                        className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-2 border-blue-500 rounded-lg p-6 cursor-pointer hover:from-blue-600/30 hover:to-purple-600/30 transition-all hover:scale-[1.02]"
                    >
                        <div className="flex items-start gap-4">
                            <div className="text-blue-400 mt-1">
                                {recommendedTool.icon}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className="text-xl font-bold text-white">{recommendedTool.name}</h4>
                                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded">Recommended</span>
                                </div>
                                <p className="text-gray-300">{recommendedTool.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tools Section */}
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-blue-400">Tools</span>
                    <span className="text-gray-500 text-sm font-normal">({toolsList.length} available)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {toolsList.map((tool) => (
                        <div
                            key={tool.id}
                            onClick={() => onSwitchView(tool.id as View)}
                            className="bg-gray-800 border border-gray-700 rounded-lg p-5 cursor-pointer hover:border-blue-500 hover:bg-gray-750 transition-all hover:scale-[1.02] group"
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div className="text-blue-400 group-hover:text-blue-300 transition-colors">
                                    {tool.icon}
                                </div>
                                <h4 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">{tool.name}</h4>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">{tool.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Advanced Tools Section */}
            <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-purple-400">Advanced</span>
                    <span className="text-gray-500 text-sm font-normal">({advancedList.length} available)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {advancedList.map((tool) => (
                        <div
                            key={tool.id}
                            onClick={() => onSwitchView(tool.id as View)}
                            className="bg-gray-800 border border-gray-700 rounded-lg p-5 cursor-pointer hover:border-purple-500 hover:bg-gray-750 transition-all hover:scale-[1.02] group"
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div className="text-purple-400 group-hover:text-purple-300 transition-colors">
                                    {tool.icon}
                                </div>
                                <h4 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">{tool.name}</h4>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">{tool.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TaskDecomposerView;
