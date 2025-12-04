import React, { useState, useEffect, useCallback } from 'react';
import { Project, ChatMessage, SimulationTurn, GeneratedCode } from '../types';
import { User } from 'firebase/auth';
import { View, Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import TaskDecomposerView from '../views/TaskDecomposerView';
import TasksView from '../views/TasksView';
import EditorView from '../views/EditorView';
import ProjectScaffolderView from '../views/ProjectScaffolderView';
import EnhancedToolView from '../views/EnhancedToolView';
import SimpleToolView from '../views/SimpleToolView';
import CommitSummarizerView from '../views/CommitSummarizerView';
import RunReviewView from '../views/RunReviewView';
import ArchitectureView from '../views/ArchitectureView';
import ChatView from '../views/ChatView';
import TeamDashboardView from '../views/TeamDashboardView';
import ProjectHeatmapView from '../views/ProjectHeatmapView';
import MemoryAgentView from '../views/MemoryAgentView';
import AgentSimulationView from '../views/AgentSimulationView';
import * as geminiService from '../services/geminiService';

const ProjectDashboard = ({ project, onGoBack, onUpdateProject, user, onLogout }: { project: Project, onGoBack: () => void, onUpdateProject: (p: Project) => void | Promise<void>, user: User, onLogout: () => void }) => {
    const [activeView, setActiveView] = useState<View>('decomposer');
    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // View state store to persist state across view switches
    // This ensures that when users switch between tools, their progress is maintained
    const [viewStates, setViewStates] = useState<{
        reviewer?: { input: string; output: string; isLoading: boolean; error: string; selectedFile?: string | null; inputMode?: 'file' | 'manual' };
        tester?: { input: string; output: string; isLoading: boolean; error: string; selectedFile?: string | null; inputMode?: 'file' | 'manual' };
        docs?: { input: string; output: string; isLoading: boolean; error: string; selectedFile?: string | null; inputMode?: 'file' | 'manual' };
        complexity?: { input: string; output: string; isLoading: boolean; error: string; selectedFile?: string | null; inputMode?: 'file' | 'manual' };
        summarizer?: { input: string; output: string; isLoading: boolean; error: string };
        run_review?: { code: string; language: string; output: string; isLoading: boolean; error: string };
        memory?: { messages: ChatMessage[]; input: string; isLoading: boolean };
        simulation?: { goal: string; simulationTurns: SimulationTurn[]; finalFileSet: GeneratedCode[]; isLoading: boolean; error: string; isComplete: boolean };
        architecture?: { mermaidCode: string; isLoading: boolean; error: string; key: number };
    }>({});

    const updateProjectState = useCallback((updates: Partial<Project>) => {
        onUpdateProject({ ...project, ...updates });
    }, [project, onUpdateProject]);

    // Helper function to update view state - merges updates with existing state
    const updateViewState = useCallback((view: string, updates: any) => {
        setViewStates(prev => {
            const currentState = prev[view as keyof typeof prev] || {};
            return {
                ...prev,
                [view]: { ...currentState, ...updates }
            };
        });
    }, []);

    useEffect(() => {
        const checkViewport = () => {
            const mobile = window.matchMedia('(max-width: 1023px)').matches;
            setIsMobile(mobile);
        };

        checkViewport();
        window.addEventListener('resize', checkViewport);
        return () => window.removeEventListener('resize', checkViewport);
    }, []);

    useEffect(() => {
        setIsSidebarOpen(!isMobile);
    }, [isMobile]);

    const handleToggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    const sidebarClassNames = `fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${isSidebarOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:translate-x-0 lg:flex-shrink-0`;

    const renderView = () => {
        switch (activeView) {
            case 'decomposer':
                return <TaskDecomposerView project={project} onTasksGenerated={(newTasks) => { updateProjectState({ tasks: [...project.tasks, ...newTasks] }); setActiveView('tasks'); }} onSwitchView={setActiveView} />;
            case 'tasks':
                return <TasksView project={project} onUpdateProject={updateProjectState} />;
            case 'editor':
                return <EditorView project={project} onUpdateProject={updateProjectState} />;
            case 'scaffolder':
                return <ProjectScaffolderView project={project} onUpdateProject={updateProjectState} onSwitchView={setActiveView} />;
            case 'reviewer':
                return <EnhancedToolView
                    key="reviewer"
                    title="Code Reviewer"
                    description="Review your code for bugs, improvements, and best practices"
                    serviceFn={geminiService.reviewCode}
                    project={project}
                    state={viewStates.reviewer}
                    onStateChange={(updates) => updateViewState('reviewer', updates)}
                />;
            case 'tester':
                return <EnhancedToolView
                    key="tester"
                    title="Test Generator"
                    description="Generate comprehensive unit tests for your code"
                    serviceFn={geminiService.generateUnitTests}
                    outputType="code"
                    project={project}
                    state={viewStates.tester}
                    onStateChange={(updates) => updateViewState('tester', updates)}
                />;
            case 'docs':
                return <EnhancedToolView
                    key="docs"
                    title="Documentation Generator"
                    description="Generate clear and concise documentation for your code"
                    serviceFn={geminiService.generateDocumentation}
                    project={project}
                    state={viewStates.docs}
                    onStateChange={(updates) => updateViewState('docs', updates)}
                />;
            case 'complexity':
                return <EnhancedToolView
                    key="complexity"
                    title="Complexity Analyzer"
                    description="Analyze the time and space complexity of your algorithms"
                    serviceFn={geminiService.analyzeComplexity}
                    project={project}
                    state={viewStates.complexity}
                    onStateChange={(updates) => updateViewState('complexity', updates)}
                />;
            case 'summarizer':
                return <CommitSummarizerView
                    project={project}
                    state={viewStates.summarizer}
                    onStateChange={(updates) => updateViewState('summarizer', updates)}
                />;
            case 'run_review':
                return <RunReviewView
                    state={viewStates.run_review}
                    onStateChange={(updates) => updateViewState('run_review', updates)}
                />;
            case 'chat':
                return <ChatView project={project} updateProjectState={updateProjectState} />;
            case 'architecture':
                return <ArchitectureView
                    project={project}
                    state={viewStates.architecture}
                    onStateChange={(updates) => updateViewState('architecture', updates)}
                />;
            case 'snippets':
                return <SimpleToolView
                    key="snippets"
                    title="Code Snippet Generator"
                    description="Generate reusable code snippets for common tasks"
                    placeholder="Describe the code snippet you need..."
                    serviceFn={geminiService.generateCodeSnippet}
                    outputType="code"
                />;
            case 'memory':
                return <MemoryAgentView
                    state={viewStates.memory}
                    onStateChange={(updates) => updateViewState('memory', updates)}
                />;
            case 'simulation':
                return <AgentSimulationView
                    project={project}
                    onUpdateProject={updateProjectState}
                    onSwitchView={setActiveView}
                    state={viewStates.simulation}
                    onStateChange={(updates) => updateViewState('simulation', updates)}
                />;
            case 'heatmap':
                return <ProjectHeatmapView project={project} />;
            case 'team_dashboard':
                return <TeamDashboardView project={project} />;
            default:
                return <div className="text-center p-8 bg-gray-800 rounded-lg"><h2 className="text-2xl font-bold">Coming Soon</h2><p className="text-gray-400 mt-2">This feature is under development.</p></div>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            <div className={sidebarClassNames}>
                <Sidebar
                    activeView={activeView}
                    setActiveView={(view) => {
                        setActiveView(view);
                        if (isMobile) setIsSidebarOpen(false);
                    }}
                    onGoBack={onGoBack}
                    userEmail={user.email}
                    onLogout={onLogout}
                    isMobile={isMobile}
                    onClose={() => setIsSidebarOpen(false)}
                />
            </div>

            {isSidebarOpen && isMobile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header projectName={project.name} title={activeView.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} onToggleSidebar={handleToggleSidebar} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};

export default ProjectDashboard;
