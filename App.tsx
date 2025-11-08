

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Sidebar, View } from './components/Sidebar';
import { Header } from './components/Header';
import { CodePreview } from './components/CodePreview';
import { Task, GeneratedFile, ChatMessage, Project, GeneratedCode, SimulationTurn } from './types';
import * as geminiService from './services/geminiService';
import { 
    SparkleIcon, FileIcon, PlusIcon, TrashIcon, TasksIcon, ChatIcon, 
    ManagerIcon, QAIcon, CodeIcon, LogoIcon, ArchitectureIcon, ComplexityIcon,
    CommitIcon, DashboardIcon, DocsIcon, HeatmapIcon, MemoryIcon, RunReviewIcon,
    ScaffoldIcon, SimulationIcon, SnippetIcon, TeamDashboardIcon, GoogleIcon, EditorIcon, FolderIcon, FolderOpenIcon, DeployIcon, CheckIcon, SaveIcon,
    CodeReviewIcon, TestGeneratorIcon
} from './components/icons';
import ReactMarkdown from 'react-markdown';
import { auth, googleProvider, db } from './firebase';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup } from "firebase/auth";
import { collection, query, orderBy, onSnapshot, addDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import JSZip from 'jszip';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';


// --- Top-Level App Component with Auth Routing ---
const App = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState<'landing' | 'auth'>('landing');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe(); // Cleanup subscription on unmount
    }, []);

    if (loading) {
        return (
            <div className="h-screen bg-gray-900 flex items-center justify-center text-white">
                <LogoIcon /> <span className="ml-2 text-xl">Loading DevFlow.AI...</span>
            </div>
        );
    }

    if (user) {
        return <MainApp user={user} />;
    }

    // Not logged in
    switch (page) {
        case 'auth':
            return <AuthPage onShowLanding={() => setPage('landing')} />;
        case 'landing':
        default:
            return <LandingPage onShowAuth={() => setPage('auth')} />;
    }
};
export default App;

// --- Landing Page Component ---
const LandingPage = ({ onShowAuth }: { onShowAuth: () => void }) => {
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax-layer-1, .parallax-layer-2, .parallax-layer-3');
            const starsLayer = document.querySelector('.stars-layer');
            const blueTint = document.querySelector('.blue-tint-overlay');
            const header = document.querySelector('header');
            
            // Parallax for content layers - more subtle
            parallaxElements.forEach((element, index) => {
                const speed = 0.1 + (index * 0.05); // Reduced speeds
                const yPos = -(scrolled * speed);
                (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
            });
            
            // Header fade on scroll
            if (header) {
                const opacity = Math.max(0.8, 1 - scrolled / 400);
                (header as HTMLElement).style.opacity = opacity.toString();
            }
            
            // Background parallax - very subtle
            if (starsLayer) {
                const starsYPos = -(scrolled * 0.03);
                (starsLayer as HTMLElement).style.transform = `translateY(${starsYPos}px)`;
            }
            
            if (blueTint) {
                const tintYPos = -(scrolled * 0.01);
                (blueTint as HTMLElement).style.transform = `translateY(${tintYPos}px)`;
            }
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        { icon: <ScaffoldIcon />, name: 'AI Project Scaffolder', desc: 'Generate a full codebase from a description.' },
        { icon: <EditorIcon />, name: 'Hierarchical Editor', desc: 'View and manage your code in a file tree.' },
        { icon: <TasksIcon />, name: 'Kanban Board', desc: 'Visualize and manage your workflow.' },
        { icon: <DocsIcon />, name: 'AI Documentation', desc: 'Instantly create docs from your code.' },
        { icon: <ChatIcon />, name: 'Context-Aware Chat', desc: 'An AI that knows your project status.' },
        { icon: <ArchitectureIcon />, name: 'Architecture Diagrams', desc: 'Visualize your code automatically.' },
        { icon: <ComplexityIcon />, name: 'Complexity Analysis', desc: 'Understand the efficiency of your code.' },
        { icon: <CommitIcon />, name: 'Commit Summarizer', desc: 'Generate commit messages from diffs.' },
        { icon: <MemoryIcon />, name: 'Memory Agent', desc: 'Chat with an AI that remembers everything.' },
        { icon: <SimulationIcon />, name: 'Agent Simulation', desc: 'Simulate a dev team to solve problems.' },
        { icon: <HeatmapIcon />, name: 'Project Heatmap', desc: 'Visualize task complexity at a glance.' },
        { icon: <TeamDashboardIcon />, name: 'Team Dashboard', desc: 'Get a high-level overview of progress.' },
    ];

    return (
        <div className="relative bg-black text-white min-h-screen overflow-x-hidden">
            {/* Animated Stars and Constellations Background */}
            <div className="fixed inset-0 stars-constellation-bg" aria-hidden="true">
                <div className="stars-layer"></div>
                <div className="constellations-layer"></div>
                <div className="blue-tint-overlay"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                <header className="container mx-auto px-6 py-4 flex justify-between items-center transition-opacity duration-300">
                    <div className="flex items-center gap-2">
                        <LogoIcon className="w-8 h-8" />
                        <span className="text-xl font-bold">DevFlow.AI</span>
                    </div>
                    <button onClick={onShowAuth} className="bg-gray-700/80 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600/50">
                        Login / Sign Up
                    </button>
                </header>

                <main className="container mx-auto px-6">
                    {/* Hero Section */}
                    <div className="py-20 text-center parallax-layer-1">
                        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                            Your AI-Powered Developer Command Center
                        </h1>
                        <p className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Plan, build, debug, and document your projects with a unified AI-native workflow, without ever leaving your IDE.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button onClick={onShowAuth} className="bg-blue-600 text-white font-semibold py-4 px-10 rounded-lg text-lg hover:bg-blue-500 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50">
                                Get Started for Free
                            </button>
                            <button onClick={onShowAuth} className="border-2 border-gray-600 text-white font-semibold py-4 px-10 rounded-lg text-lg hover:border-gray-500 hover:bg-gray-800/50 transition-all backdrop-blur-sm">
                                Watch Demo
                            </button>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="py-16 parallax-layer-2">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">All The Tools You Need. Unified.</h2>
                            <p className="text-gray-400 text-lg">Everything you need to build, deploy, and scale your projects in one place</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, index) => (
                                <div 
                                    key={index} 
                                    className="bg-gray-800/60 backdrop-blur-md p-6 rounded-xl text-left border border-gray-700/50 hover:border-blue-500/50 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20 group"
                                >
                                    <div className="text-blue-500 mb-4 group-hover:scale-110 transition-transform">{React.cloneElement(feature.icon, { className: 'w-8 h-8' })}</div>
                                    <h3 className="text-xl font-semibold mb-2">{feature.name}</h3>
                                    <p className="text-gray-400">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="py-20 text-center parallax-layer-3">
                        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md p-12 rounded-2xl border border-blue-500/30 max-w-4xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Development Workflow?</h2>
                            <p className="text-gray-300 text-lg mb-8">Join thousands of developers who are already building faster with AI</p>
                            <button onClick={onShowAuth} className="bg-blue-600 text-white font-semibold py-4 px-10 rounded-lg text-lg hover:bg-blue-500 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50">
                                Start Building Now
                            </button>
                        </div>
                    </div>
                </main>

                <footer className="relative z-10 text-center py-8 border-t border-gray-800/50">
                    <p className="text-gray-500">&copy; {new Date().getFullYear()} DevFlow.AI. The future of development.</p>
                </footer>
            </div>
        </div>
    );
};

// --- Auth Page Component ---
const AuthPage = ({ onShowLanding }: { onShowLanding: () => void }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            // onAuthStateChanged in App.tsx will handle the redirect
        } catch (err: any) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
            // onAuthStateChanged will handle the redirect
        } catch (err: any) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* Animated Stars and Constellations Background */}
            <div className="fixed inset-0 stars-constellation-bg" aria-hidden="true">
                <div className="stars-layer"></div>
                <div className="constellations-layer"></div>
                <div className="blue-tint-overlay"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                 <div className="flex items-center justify-center gap-2 mb-8">
                    <LogoIcon className="w-10 h-10" />
                    <span className="text-2xl font-bold">DevFlow.AI</span>
                </div>
                <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-8 border border-gray-700/50 shadow-2xl">
                    <h2 className="text-3xl font-bold text-center mb-6">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold p-3 rounded-lg hover:bg-gray-200 disabled:bg-gray-400 transition-colors"
                    >
                        <GoogleIcon />
                        {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
                    </button>

                    <div className="flex items-center my-6">
                        <hr className="flex-grow border-gray-600" />
                        <span className="mx-4 text-gray-500 text-sm font-medium">OR</span>
                        <hr className="flex-grow border-gray-600" />
                    </div>

                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Email Address"
                            required
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 font-semibold p-3 rounded-lg hover:bg-blue-500 disabled:bg-blue-800">
                            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-400 mt-6">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-blue-500 hover:underline ml-1">
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </div>
                 <button onClick={onShowLanding} className="text-sm text-gray-500 hover:text-gray-300 mt-6">&larr; Back to Home</button>
            </div>
        </div>
    );
};


// --- Main Application (Authenticated) ---
const MainApp = ({ user }: { user: User }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
        return localStorage.getItem(`devflow-selected-project-id-${user.uid}`);
    });

    // Effect to fetch projects from Firestore in real-time
    useEffect(() => {
        if (!user) {
            setProjects([]);
            return;
        }

        const projectsCollectionRef = collection(db, 'users', user.uid, 'projects');
        const q = query(projectsCollectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const projectsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Project));
            setProjects(projectsData);
        }, (error) => {
            console.error("Error fetching projects:", error);
        });

        return () => unsubscribe(); // Cleanup listener
    }, [user]);

    // Effect to save selected project ID to localStorage
    useEffect(() => {
        if (selectedProjectId) {
            localStorage.setItem(`devflow-selected-project-id-${user.uid}`, selectedProjectId);
        } else {
            localStorage.removeItem(`devflow-selected-project-id-${user.uid}`);
        }
    }, [selectedProjectId, user.uid]);

    const handleCreateProject = async (name: string, description: string) => {
        if (!user) return;
        const projectsCollectionRef = collection(db, 'users', user.uid, 'projects');
        
        const newProjectData = {
            name,
            description,
            tasks: [],
            messages: [],
            generatedCode: [],
            createdAt: serverTimestamp(),
        };

        try {
            const docRef = await addDoc(projectsCollectionRef, newProjectData);
            setSelectedProjectId(docRef.id);
        } catch (error) {
            console.error("Error creating project:", error);
        }
    };
    
    const handleLogout = () => {
        signOut(auth).catch(error => console.error("Logout failed", error));
    };

    const handleSelectProject = (projectId: string) => {
        setSelectedProjectId(projectId);
    };

    const handleUpdateProject = async (updatedProject: Project) => {
        if (!user) return;
        const projectDocRef = doc(db, 'users', user.uid, 'projects', updatedProject.id);
        const { id, ...projectData } = updatedProject;
        try {
            await setDoc(projectDocRef, projectData, { merge: true });
        } catch (error) {
            console.error("Error updating project:", error);
        }
    };

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    if (!selectedProject) {
        return <ProjectSelection projects={projects} onSelectProject={handleSelectProject} onCreateProject={handleCreateProject} onLogout={handleLogout} />;
    }

    return <ProjectDashboard key={selectedProject.id} project={selectedProject} onGoBack={() => setSelectedProjectId(null)} onUpdateProject={handleUpdateProject} user={user} onLogout={handleLogout} />;
};


// --- Project Selection View ---
const ProjectSelection = ({ projects, onSelectProject, onCreateProject, onLogout }: { projects: Project[], onSelectProject: (id: string) => void, onCreateProject: (name: string, desc: string) => void, onLogout: () => void }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && description) {
            onCreateProject(name, description);
            setName('');
            setDescription('');
            setIsCreating(false);
        }
    };

    return (
        <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
            <div className="absolute top-4 right-4">
                 <button onClick={onLogout} className="flex items-center gap-2 bg-gray-700 text-sm py-2 px-3 rounded-lg hover:bg-gray-600">Logout</button>
            </div>
            <h1 className="text-4xl font-bold mb-8">Your Projects</h1>
            <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Select a Project</h2>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {projects.length > 0 ? projects.map(p => (
                        <div key={p.id} onClick={() => onSelectProject(p.id)} className="p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors">
                            <h3 className="font-bold">{p.name}</h3>
                            <p className="text-sm text-gray-400">{p.description}</p>
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
            </div>
        </div>
    );
};


// --- Project Dashboard ---
// Fix: Changed onUpdateProject prop type to allow for an async function (Promise<void>)
// to resolve a TypeScript error where an async function was passed to a prop expecting a sync function.
const ProjectDashboard = ({ project, onGoBack, onUpdateProject, user, onLogout }: { project: Project, onGoBack: () => void, onUpdateProject: (p: Project) => void | Promise<void>, user: User, onLogout: () => void }) => {
    const [activeView, setActiveView] = useState<View>('decomposer');
    
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
                    description="Generate detailed documentation from your code"
                    serviceFn={geminiService.generateDocumentation}
                    project={project}
                    state={viewStates.docs}
                    onStateChange={(updates) => updateViewState('docs', updates)}
                />;
            case 'complexity':
                return <EnhancedToolView 
                    key="complexity"
                    title="Complexity Analysis" 
                    description="Analyze code complexity and identify optimization opportunities"
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
            case 'architecture':
                return <ArchitectureView 
                    project={project}
                    state={viewStates.architecture}
                    onStateChange={(updates) => updateViewState('architecture', updates)}
                />;
            case 'chat':
                return <ChatView project={project} updateProjectState={updateProjectState} />;
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
                return <div className="text-center p-8 bg-gray-800 rounded-lg"><h2 className="text-2xl font-bold">{activeView.replace(/_/g, ' ')}</h2><p className="text-gray-400 mt-2">This feature is coming soon!</p></div>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans">
            <Sidebar activeView={activeView} setActiveView={setActiveView} onGoBack={onGoBack} userEmail={user.email} onLogout={onLogout} />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header title={activeView.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} projectName={project.name} />
                <div className="flex-1 p-6 overflow-y-auto">
                    {renderView()}
                </div>
            </main>
        </div>
    );
};

// --- View Components ---

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

const TasksView = ({ project, onUpdateProject }: { project: Project, onUpdateProject: (updates: Partial<Project>) => void }) => {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [generatedFile, setGeneratedFile] = useState<GeneratedFile | null>(null);
    const [isLoadingCode, setIsLoadingCode] = useState(false);
    const [codeError, setCodeError] = useState('');
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [dragOverStatus, setDragOverStatus] = useState<Task['status'] | null>(null);
    const [showAddTaskForm, setShowAddTaskForm] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');

    useEffect(() => {
        if (selectedTask) {
            setSelectedFile(null);
            setGeneratedFile(null);
        }
    }, [selectedTask]);

    const handleFileSelect = async (fileName: string) => {
        if (!selectedTask) return;
        setSelectedFile(fileName);
        setIsLoadingCode(true);
        setCodeError('');
        try {
            const content = await geminiService.generateBoilerplate(selectedTask.description, fileName);
            const newGeneratedFile = { taskId: selectedTask.id, fileName, content };
            setGeneratedFile(newGeneratedFile);
            
            const existingFileIndex = project.generatedCode.findIndex(f => f.fileName === fileName);
            let updatedCode: GeneratedCode[];
            if (existingFileIndex > -1) {
                updatedCode = [...project.generatedCode];
                updatedCode[existingFileIndex] = { fileName, content };
            } else {
                updatedCode = [...project.generatedCode, { fileName, content }];
            }
            onUpdateProject({ generatedCode: updatedCode });

        } catch (e) {
            setCodeError((e as Error).message);
        } finally {
            setIsLoadingCode(false);
        }
    };

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetStatus: Task['status']) => {
        e.preventDefault();
        if (!draggedTaskId) return;

        const taskToMove = project.tasks.find(t => t.id === draggedTaskId);
        if (taskToMove && taskToMove.status !== targetStatus) {
            const updatedTasks = project.tasks.map(task =>
                task.id === draggedTaskId ? { ...task, status: targetStatus } : task
            );
            onUpdateProject({ tasks: updatedTasks });
        }
        setDraggedTaskId(null);
        setDragOverStatus(null);
    };

    const handleDragOver = (e: React.DragEvent, status: Task['status']) => {
        e.preventDefault();
        setDragOverStatus(status);
    };
    
    const handleDeleteTask = (taskIdToDelete: string) => {
        const updatedTasks = project.tasks.filter(task => task.id !== taskIdToDelete);
        onUpdateProject({ tasks: updatedTasks });
    };

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;
        
        const newTask: Task = {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: newTaskTitle.trim(),
            description: newTaskDescription.trim() || 'No description provided.',
            files: [],
            status: 'pending'
        };
        
        const updatedTasks = [...(project.tasks || []), newTask];
        onUpdateProject({ tasks: updatedTasks });
        
        // Reset form
        setNewTaskTitle('');
        setNewTaskDescription('');
        setShowAddTaskForm(false);
    };

    const columns: { status: Task['status']; title: string }[] = [
        { status: 'pending', title: 'Pending' },
        { status: 'in-progress', title: 'In Progress' },
        { status: 'done', title: 'Done' }
    ];

    if (!project.tasks || project.tasks.length === 0) {
        return (
            <div className="h-full flex flex-col gap-6">
                <div className="text-center p-8 bg-gray-800 rounded-lg">
                    <h2 className="text-2xl font-bold">No Tasks Yet</h2>
                    <p className="text-gray-400 mt-2 mb-4">Go to the 'Task Decomposer' to generate tasks, or add one manually below.</p>
                    {!showAddTaskForm ? (
                        <button 
                            onClick={() => setShowAddTaskForm(true)}
                            className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-500 transition-colors mx-auto"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Add Task Manually
                        </button>
                    ) : (
                        <div className="bg-gray-700 rounded-lg p-6 max-w-md mx-auto text-left">
                            <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Task Title *</label>
                                    <input
                                        type="text"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        placeholder="Enter task title..."
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                    <textarea
                                        value={newTaskDescription}
                                        onChange={(e) => setNewTaskDescription(e.target.value)}
                                        placeholder="Enter task description (optional)..."
                                        rows={3}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddTask}
                                        disabled={!newTaskTitle.trim()}
                                        className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Add Task
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAddTaskForm(false);
                                            setNewTaskTitle('');
                                            setNewTaskDescription('');
                                        }}
                                        className="flex-1 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    
    if (selectedTask) {
        return (
            <div className="h-full flex flex-col gap-6">
                <div>
                     <button onClick={() => setSelectedTask(null)} className="mb-4 bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600">&larr; Back to Board</button>
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                         <h2 className="text-xl font-bold">{selectedTask.title}</h2>
                         <p className="text-gray-400 mt-2">{selectedTask.description}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow min-h-0">
                     <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <h3 className="font-semibold mb-3">Files for this task</h3>
                        <div className="flex flex-wrap gap-2">
                            {selectedTask.files.map(file => (
                                <button key={file} onClick={() => handleFileSelect(file)}
                                        className={`flex items-center gap-2 text-sm px-3 py-1 rounded-md transition-colors ${selectedFile === file ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                    <FileIcon className="w-4 h-4" />
                                    {file}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-full">
                       <CodePreview file={generatedFile} isLoading={isLoadingCode} />
                       {codeError && <p className="text-red-400 mt-2">{codeError}</p>}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header with Add Task Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Tasks</h2>
                {!showAddTaskForm ? (
                    <button 
                        onClick={() => setShowAddTaskForm(true)}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add Task
                    </button>
                ) : (
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex-1 max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Add New Task</h3>
                            <button
                                onClick={() => {
                                    setShowAddTaskForm(false);
                                    setNewTaskTitle('');
                                    setNewTaskDescription('');
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Task Title *</label>
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="Enter task title..."
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                                <textarea
                                    value={newTaskDescription}
                                    onChange={(e) => setNewTaskDescription(e.target.value)}
                                    placeholder="Enter task description (optional)..."
                                    rows={2}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                                />
                            </div>
                            <button
                                onClick={handleAddTask}
                                disabled={!newTaskTitle.trim()}
                                className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                            >
                                Add Task
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow min-h-0">
                {columns.map(({ status, title }) => (
                    <div key={status}
                         onDrop={(e) => handleDrop(e, status)}
                         onDragOver={(e) => handleDragOver(e, status)}
                         onDragLeave={() => setDragOverStatus(null)}
                         className={`bg-gray-800 rounded-lg p-4 flex flex-col border border-gray-700 transition-colors ${dragOverStatus === status ? 'bg-gray-700' : ''}`}>
                        <h2 className="text-lg font-bold mb-4 px-2">{title} <span className="text-sm font-normal text-gray-400">{project.tasks.filter(t => t.status === status).length}</span></h2>
                        <div className="space-y-3 overflow-y-auto flex-grow pr-1">
                        {project.tasks.filter(t => t.status === status).map(task => (
                            <div key={task.id}
                                 draggable
                                 onDragStart={(e) => handleDragStart(e, task.id)}
                                 className={`p-3 rounded-lg bg-gray-700 hover:bg-gray-600 border border-transparent group relative transition-all ${draggedTaskId === task.id ? 'opacity-50' : 'opacity-100'}`}>
                                
                                <div onClick={() => setSelectedTask(task)} className="cursor-pointer">
                                    <h3 className="font-semibold pr-6">{task.title}</h3>
                                    <p className="text-sm text-gray-400 line-clamp-2 mt-1">{task.description}</p>
                                </div>

                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTask(task.id);
                                    }}
                                    className="absolute top-2 right-2 p-1 rounded-full text-gray-500 hover:bg-gray-800 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Delete task"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

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
                                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                                                selectedFile === file.fileName
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

const SimpleToolView = ({ title, placeholder, serviceFn, outputType = 'markdown', state, onStateChange }: { title: string, placeholder: string, serviceFn: (input: string) => Promise<string>, outputType?: 'markdown' | 'code', state?: { input: string; output: string; isLoading: boolean; error: string }, onStateChange?: (updates: Partial<{ input: string; output: string; isLoading: boolean; error: string }>) => void }) => {
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
            <h2 className="text-2xl font-bold">{title}</h2>
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

const ChatView = ({ project, updateProjectState }: { project: Project, updateProjectState: (updates: Partial<Project>) => void }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { id: `msg-${Date.now()}`, sender: 'user', text: input };
        const updatedMessages = [...project.messages, userMessage];
        updateProjectState({ messages: updatedMessages });
        setInput('');
        setIsLoading(true);

        try {
            const aiResponseText = await geminiService.continueConversation(updatedMessages, project);
            const aiMessage: ChatMessage = { id: `msg-${Date.now() + 1}`, sender: 'ai', text: aiResponseText };
            updateProjectState({ messages: [...updatedMessages, aiMessage] });
        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = { id: `msg-${Date.now() + 1}`, sender: 'ai', text: 'Sorry, I encountered an error.' };
            updateProjectState({ messages: [...updatedMessages, errorMessage] });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-4">Team Chat</h2>
            <div className="flex-grow bg-gray-800 rounded-t-lg p-4 border border-b-0 border-gray-700 overflow-y-auto">
                <div className="space-y-4">
                    {project.messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xl p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-gray-700'} prose prose-invert max-w-none`}>
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="flex justify-start"><div className="max-w-xl p-3 rounded-lg bg-gray-700">Thinking...</div></div>}
                </div>
            </div>
            <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 rounded-b-lg border border-t-0 border-gray-700">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask DevFlow.AI anything..."
                    className="w-full p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                />
            </form>
        </div>
    );
};

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

// --- New/Updated View Components ---

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

// --- Editor View with File Tree ---

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
    
    // Cleanup deployment URLs on unmount
    useEffect(() => {
        return () => {
            if (deployment) {
                URL.revokeObjectURL(deployment.mainUrl);
                deployment.assetUrls.forEach(url => URL.revokeObjectURL(url));
            }
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
    const handleDeployProject = useCallback(async () => {
        setIsDeploying(true); 
        setDeployError('');
        // Clean up previous deployment URLs to prevent memory leaks
        if (deployment) { 
            URL.revokeObjectURL(deployment.mainUrl); 
            deployment.assetUrls.forEach(url => URL.revokeObjectURL(url)); 
        }
        // Small delay to allow UI to update
        await new Promise(res => setTimeout(res, 100));
        try {
            // Use the latest editableFiles to ensure deployment reflects all current changes
            let htmlFile = editableFiles.find(f => f.fileName.toLowerCase() === 'index.html') || editableFiles.find(f => f.fileName.toLowerCase().endsWith('.html'));
            if (!htmlFile) throw new Error("Deployment failed: No HTML file found.");
            
            const blobMap = new Map<string, string>(); 
            const importMap = { imports: {} as Record<string,string> }; 
            const assetUrls: string[] = [];
            const getMimeType = (f:string) => { 
                const e=f.split('.').pop()?.toLowerCase(); 
                switch(e){
                    case 'html':return 'text/html';
                    case 'css':return 'text/css';
                    case 'js':case 'jsx':case 'ts':case 'tsx':return 'text/javascript';
                    case 'json':return 'application/json';
                    case 'png':return'image/png';
                    case 'jpg':case 'jpeg':return'image/jpeg';
                    case 'svg':return'image/svg+xml';
                    default:return'application/octet-stream'
                }
            };
            const needsBabel = editableFiles.some(f => /\.(jsx|tsx)$/.test(f.fileName));

            // Create blob URLs for all files (using latest editableFiles content)
            // This ensures all project files are available for the deployment
            for (const file of editableFiles) {
                if (file.fileName === htmlFile.fileName) continue;
                const blob = new Blob([file.content], { type: getMimeType(file.fileName) });
                const blobUrl = URL.createObjectURL(blob); 
                assetUrls.push(blobUrl);
                
                // Store multiple path variations for flexible resolution
                blobMap.set(file.fileName, blobUrl);
                blobMap.set(`/${file.fileName}`, blobUrl); // With leading slash
                blobMap.set(`./${file.fileName}`, blobUrl); // With ./ prefix
                
                // Add to import map for ES modules
                importMap.imports[`./${file.fileName}`] = blobUrl;
                importMap.imports[`/${file.fileName}`] = blobUrl;
                
                // Add extensionless version for imports without extensions
                const noExt = `./${file.fileName}`.replace(/\.[^/.]+$/, "");
                if (noExt !== `./${file.fileName}`) {
                    importMap.imports[noExt] = blobUrl;
                    importMap.imports[noExt.replace('./', '/')] = blobUrl;
                }
                
                // Add just the filename for simpler imports
                const justFileName = file.fileName.split('/').pop() || file.fileName;
                if (justFileName !== file.fileName) {
                    blobMap.set(justFileName, blobUrl);
                    importMap.imports[`./${justFileName}`] = blobUrl;
                }
            }
            
            // Parse and update HTML file with blob URLs
            const doc = new DOMParser().parseFromString(htmlFile.content, 'text/html');
            
            // Helper function to resolve file paths - handles various path formats
            const resolvePath = (path: string, baseDir: string = ''): string | null => {
                if (!path || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
                    return null; // Skip external URLs
                }
                
                // Remove leading slash and query/hash
                let cleanPath = path.split('?')[0].split('#')[0];
                if (cleanPath.startsWith('/')) {
                    cleanPath = cleanPath.substring(1);
                }
                
                // Try exact match first
                if (blobMap.has(cleanPath)) {
                    return cleanPath;
                }
                
                // Try with base directory
                if (baseDir && blobMap.has(`${baseDir}/${cleanPath}`)) {
                    return `${baseDir}/${cleanPath}`;
                }
                
                // Try finding by filename only (for cases where path structure differs)
                const fileName = cleanPath.split('/').pop() || cleanPath;
                for (const [key] of blobMap.entries()) {
                    if (key.endsWith(fileName) || key === fileName) {
                        return key;
                    }
                }
                
                return null;
            };
            
            // Update all script sources, link hrefs, and image sources with comprehensive path resolution
            doc.querySelectorAll('script[src], link[href], img[src], source[src], video[src], audio[src]').forEach(el => {
                const attr = el.hasAttribute('src') ? 'src' : 'href'; 
                const originalPath = el.getAttribute(attr);
                if (originalPath) {
                    const resolvedPath = resolvePath(originalPath);
                    if (resolvedPath && blobMap.has(resolvedPath)) {
                        const blobUrl = blobMap.get(resolvedPath)!;
                        el.setAttribute(attr, blobUrl);
                        
                        // Add preload hints for critical resources (improves performance for heavy apps)
                        if (el.tagName === 'LINK' && el.getAttribute('rel') === 'stylesheet') {
                            const preload = doc.createElement('link');
                            preload.rel = 'preload';
                            preload.as = 'style';
                            preload.href = blobUrl;
                            doc.head.insertBefore(preload, el);
                        } else if (el.tagName === 'SCRIPT' && el.getAttribute('type') === 'module') {
                            const preload = doc.createElement('link');
                            preload.rel = 'modulepreload';
                            preload.href = blobUrl;
                            doc.head.insertBefore(preload, el);
                        }
                    }
                }
            });
            
            // Handle inline scripts that might reference modules
            doc.querySelectorAll('script:not([src])').forEach(script => {
                const scriptContent = script.textContent || '';
                // Check if inline script has import statements that need path resolution
                if (scriptContent.includes('import ') || scriptContent.includes('from ')) {
                    // Try to resolve relative imports in inline scripts
                    let updatedContent = scriptContent;
                    for (const [fileName, blobUrl] of blobMap.entries()) {
                        // Replace common import patterns
                        const patterns = [
                            new RegExp(`from\\s+['"]\\.?/?${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
                            new RegExp(`import\\s+['"]\\.?/?${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
                        ];
                        patterns.forEach(pattern => {
                            updatedContent = updatedContent.replace(pattern, (match) => {
                                return match.replace(/['"].*?['"]/, `'${blobUrl}'`);
                            });
                        });
                    }
                    if (updatedContent !== scriptContent) {
                        script.textContent = updatedContent;
                    }
                }
            });
            
            // Handle JSX/TSX files with Babel if needed
            if (needsBabel) {
                const blobToFileName = new Map<string, string>();
                for (const [fileName, blobUrl] of blobMap.entries()) {
                    blobToFileName.set(blobUrl, fileName);
                }
                // Handle both module and regular scripts
                doc.querySelectorAll('script[src]').forEach(s => {
                    const scriptElement = s as HTMLScriptElement;
                    const src = scriptElement.getAttribute('src');
                    if (src && blobToFileName.has(src)) {
                        const fileName = blobToFileName.get(src)!;
                        if (/\.(jsx|tsx)$/.test(fileName)) {
                            // Store original type before changing
                            const wasModule = scriptElement.type === 'module';
                            scriptElement.type = 'text/babel';
                            // Preserve module behavior for JSX/TSX files
                            if (wasModule) {
                                scriptElement.setAttribute('data-type', 'module');
                            }
                        }
                    }
                });
            }
            
            // Add comprehensive error handling and performance monitoring FIRST
            const errorHandlerScript = doc.createElement('script');
            errorHandlerScript.textContent = `
                (function() {
                    // Enhanced error handling for heavy applications
                    const errors = [];
                    const warnings = [];
                    
                    window.addEventListener('error', function(e) {
                        const errorInfo = {
                            message: e.message,
                            filename: e.filename,
                            lineno: e.lineno,
                            colno: e.colno,
                            error: e.error ? e.error.toString() : null,
                            stack: e.error ? e.error.stack : null
                        };
                        errors.push(errorInfo);
                        console.error('Deployment error:', errorInfo);
                        
                        // Try to recover from common errors
                        if (e.message.includes('Failed to fetch') || e.message.includes('Loading chunk')) {
                            console.warn('Network error detected, attempting recovery...');
                            setTimeout(() => {
                                const scripts = document.querySelectorAll('script[src]');
                                scripts.forEach(script => {
                                    if (script.dataset.retryCount < 3) {
                                        script.dataset.retryCount = (script.dataset.retryCount || 0) + 1;
                                        const src = script.src;
                                        script.src = '';
                                        setTimeout(() => { script.src = src; }, 1000);
                                    }
                                });
                            }, 2000);
                        }
                    });
                    
                    window.addEventListener('unhandledrejection', function(e) {
                        const rejectionInfo = {
                            reason: e.reason ? e.reason.toString() : 'Unknown',
                            stack: e.reason && e.reason.stack ? e.reason.stack : null
                        };
                        warnings.push(rejectionInfo);
                        console.error('Unhandled promise rejection:', rejectionInfo);
                    });
                    
                    // Performance monitoring
                    window.addEventListener('load', function() {
                        if (window.performance && window.performance.timing) {
                            const perf = window.performance.timing;
                            const loadTime = perf.loadEventEnd - perf.navigationStart;
                            console.log('Page load time:', loadTime + 'ms');
                        }
                    });
                    
                    // Expose error info for debugging
                    window.__deploymentErrors = errors;
                    window.__deploymentWarnings = warnings;
                })();
            `;
            doc.head.appendChild(errorHandlerScript);
            
            // Add import map BEFORE any module scripts
            doc.querySelector('script[type="importmap"]')?.remove();
            const importMapScript = doc.createElement('script'); 
            importMapScript.type = 'importmap'; 
            importMapScript.innerHTML = JSON.stringify(importMap); 
            doc.head.prepend(importMapScript);
            
            // Add Babel standalone for JSX/TSX support (load synchronously before other scripts)
            if (needsBabel) { 
                const babelScript = doc.createElement('script'); 
                babelScript.src = "https://unpkg.com/@babel/standalone/babel.min.js"; 
                babelScript.crossOrigin = 'anonymous';
                babelScript.async = false;
                babelScript.defer = false;
                // Add error handling for Babel loading
                babelScript.onerror = function() {
                    console.error('Failed to load Babel. Trying alternative CDN...');
                    const altBabel = doc.createElement('script');
                    altBabel.src = "https://cdn.jsdelivr.net/npm/@babel/standalone@7.23.0/babel.min.js";
                    altBabel.crossOrigin = 'anonymous';
                    altBabel.async = false;
                    doc.head.insertBefore(altBabel, babelScript.nextSibling);
                };
                doc.head.insertBefore(babelScript, importMapScript.nextSibling);
            }
            
            // Optimize script loading order for heavy applications
            // 1. Ensure all module scripts maintain their type
            const allScripts = Array.from(doc.querySelectorAll('script[src]')) as HTMLScriptElement[];
            const moduleScripts: HTMLScriptElement[] = [];
            const regularScripts: HTMLScriptElement[] = [];
            
            allScripts.forEach(script => {
                const originalType = script.getAttribute('type');
                const src = script.getAttribute('src');
                
                // Preserve module type if it was originally a module
                if (originalType === 'module' && script.getAttribute('type') !== 'text/babel') {
                    script.setAttribute('type', 'module');
                    moduleScripts.push(script);
                } else if (!originalType || originalType === 'text/javascript') {
                    regularScripts.push(script);
                }
                
                // Add defer/async attributes for better loading performance
                if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
                    // For heavy apps, use defer for better parallel loading
                    if (script.type === 'module') {
                        script.setAttribute('defer', '');
                    } else {
                        // Regular scripts can use async for non-blocking loading
                        script.setAttribute('async', '');
                    }
                }
                
                // Add retry mechanism for failed script loads
                script.dataset.retryCount = '0';
            });
            
            // Sort scripts by dependencies (simple heuristic: smaller files first, then larger)
            // This helps with faster initial rendering
            const sortedScripts = [...moduleScripts, ...regularScripts].sort((a, b) => {
                const aSrc = a.getAttribute('src') || '';
                const bSrc = b.getAttribute('src') || '';
                // Prioritize smaller utility files over large app files
                if (aSrc.includes('utils') || aSrc.includes('helpers')) return -1;
                if (bSrc.includes('utils') || bSrc.includes('helpers')) return 1;
                return 0;
            });
            
            // Reorder scripts in DOM for optimal loading
            sortedScripts.forEach((script, index) => {
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                    if (index === 0) {
                        // Insert after Babel/importmap
                        const insertPoint = doc.querySelector('script[type="importmap"]')?.nextSibling || 
                                          doc.querySelector('script[src*="babel"]')?.nextSibling ||
                                          doc.head.lastChild;
                        if (insertPoint) {
                            doc.head.insertBefore(script, insertPoint.nextSibling);
                        } else {
                            doc.head.appendChild(script);
                        }
                    } else {
                        doc.head.appendChild(script);
                    }
                }
            });
            
            // Add loading optimization script for heavy applications
            const loadingOptimizer = doc.createElement('script');
            loadingOptimizer.textContent = `
                (function() {
                    // Optimize for heavy applications with code splitting and dynamic imports
                    
                    // Support for dynamic imports (common in heavy React/Vue apps)
                    if (!window.__dynamicImportMap) {
                        window.__dynamicImportMap = new Map();
                    }
                    
                    // Intercept dynamic imports to resolve blob URLs
                    const originalImport = window.__import || (() => {
                        throw new Error('Dynamic imports not supported');
                    });
                    
                    // Preload critical resources using requestIdleCallback
                    if ('requestIdleCallback' in window) {
                        requestIdleCallback(function() {
                            // Preload stylesheets
                            const links = document.querySelectorAll('link[rel="stylesheet"]');
                            links.forEach(link => {
                                if (!link.href.startsWith('http')) {
                                    const preload = document.createElement('link');
                                    preload.rel = 'preload';
                                    preload.as = 'style';
                                    preload.href = link.href;
                                    document.head.appendChild(preload);
                                }
                            });
                            
                            // Preload module scripts
                            const moduleScripts = document.querySelectorAll('script[type="module"][src]');
                            moduleScripts.forEach(script => {
                                const preload = document.createElement('link');
                                preload.rel = 'modulepreload';
                                preload.href = script.src;
                                document.head.appendChild(preload);
                            });
                        }, { timeout: 2000 });
                    }
                    
                    // Optimize for large applications: use Intersection Observer for lazy loading
                    if ('IntersectionObserver' in window) {
                        const imageObserver = new IntersectionObserver((entries) => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    const img = entry.target;
                                    if (img.dataset.src) {
                                        img.src = img.dataset.src;
                                        img.removeAttribute('data-src');
                                        imageObserver.unobserve(img);
                                    }
                                }
                            });
                        });
                        
                        // Observe all images with data-src (lazy loaded)
                        document.querySelectorAll('img[data-src]').forEach(img => {
                            imageObserver.observe(img);
                        });
                    }
                    
                    // Performance optimization: batch DOM updates
                    let rafScheduled = false;
                    const pendingUpdates = [];
                    const scheduleUpdate = (fn) => {
                        pendingUpdates.push(fn);
                        if (!rafScheduled) {
                            rafScheduled = true;
                            requestAnimationFrame(() => {
                                pendingUpdates.forEach(update => update());
                                pendingUpdates.length = 0;
                                rafScheduled = false;
                            });
                        }
                    };
                    
                    // Expose for heavy apps that need it
                    window.__scheduleUpdate = scheduleUpdate;
                })();
            `;
            doc.head.appendChild(loadingOptimizer);

            const finalHtml = new XMLSerializer().serializeToString(doc);
            const mainBlob = new Blob([finalHtml], { type: 'text/html' }); 
            const mainUrl = URL.createObjectURL(mainBlob);
            
            // Store the hash of deployed files to detect changes later
            lastDeployedFilesRef.current = JSON.stringify(editableFiles.map(f => ({ fileName: f.fileName, content: f.content })));
            
            setDeployment({ mainUrl, assetUrls }); 
            // Only switch to preview if not already there (to avoid infinite loop)
            if (activeTab !== 'preview') {
                setActiveTab('preview');
            }
        } catch (e: any) { 
            setDeployError(e.message); 
        } finally { 
            setIsDeploying(false); 
        }
    }, [editableFiles, deployment, activeTab]); // Include dependencies to ensure latest values are used

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
                    <button onClick={handleSaveChanges} disabled={!hasUnsavedChanges} className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"><LogoIcon className="w-5 h-5 button-logo-icon"/> Save Changes</button>
                    <button onClick={handleDownloadProject} disabled={isDownloading} className="flex items-center justify-center gap-2 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"><LogoIcon className="w-5 h-5 button-logo-icon"/>{isDownloading ? 'Zipping...' : 'Download'}</button>
                    <button onClick={handleDeployProject} disabled={isDeploying} className="flex items-center justify-center gap-2 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"><LogoIcon className="w-5 h-5 button-logo-icon"/>{isDeploying ? 'Deploying...' : 'Deploy'}</button>
                    {deployment && (
                        <button 
                            onClick={() => window.open(deployment.mainUrl, '_blank', 'noopener,noreferrer')} 
                            className="flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-500 transition-colors"
                            title="Open preview in new tab"
                        >
                            <LogoIcon className="w-5 h-5 button-logo-icon"/> Open in New Tab
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
                        <button onClick={handleCreateFile} className="w-full flex items-center justify-center gap-2 bg-gray-700 text-sm py-2 px-3 rounded-md hover:bg-gray-600 mb-2 shrink-0"><LogoIcon className="w-4 h-4 button-logo-icon"/> New File</button>
                        <div className="overflow-y-auto flex-1 space-y-0.5 pr-1" style={{ minHeight: 0 }}>
                            {Object.entries(fileTree).sort(([aName, aNode], [bName, bNode]) => {
                                if (aNode.isFile && !bNode.isFile) return 1;
                                if (!aNode.isFile && bNode.isFile) return -1;
                                return aName.localeCompare(bName);
                            }).map(([name, node]) => (
                                <FileTreeItem key={name} name={name} node={node} onFileSelect={setSelectedFileName} selectedFile={selectedFileName} level={0} onDeleteFile={handleDeleteFile} dirtyFiles={dirtyFiles}/>
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
                        <DeployIcon className="w-12 h-12 mx-auto mb-2 animate-pulse"/>
                        <p>Deploying latest changes...</p>
                    </div>
                </div>
            ) : deployment ? (
                <div className="flex-grow bg-gray-800 rounded-lg border border-gray-700 p-1 relative">
                    <iframe 
                        key={deployment.mainUrl} 
                        src={deployment.mainUrl} 
                        className="w-full h-full border-0 bg-white rounded-md" 
                        title="Deployment Preview" 
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads allow-orientation-lock allow-pointer-lock allow-presentation"
                        allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; vr; xr-spatial-tracking; fullscreen"
                        loading="eager"
                        referrerPolicy="no-referrer-when-downgrade"
                        onLoad={(e) => {
                            // Monitor iframe load for heavy applications
                            const iframe = e.target as HTMLIFrameElement;
                            try {
                                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                                if (iframeDoc) {
                                    console.log('Iframe loaded successfully');
                                    // Check for errors in iframe
                                    if (iframe.contentWindow) {
                                        iframe.contentWindow.addEventListener('error', (err) => {
                                            console.error('Iframe error:', err);
                                        });
                                    }
                                }
                            } catch (err) {
                                // Cross-origin restrictions - this is expected
                                console.log('Iframe loaded (cross-origin restrictions apply)');
                            }
                        }}
                    />
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center bg-gray-800 rounded-lg border border-gray-700">
                    <div className="text-center text-gray-500">
                        <DeployIcon className="w-12 h-12 mx-auto mb-2"/>
                        <p>Deploy the project to see a live preview.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Other View Components ---

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex items-center gap-4">
        <div className="bg-gray-700 p-3 rounded-full text-blue-500">{icon}</div>
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-gray-200">{value}</p>
        </div>
    </div>
);

const TeamDashboardView = ({ project }: { project: Project }) => {
    const pendingTasks = project.tasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = project.tasks.filter(t => t.status === 'in-progress').length;
    const doneTasks = project.tasks.filter(t => t.status === 'done').length;
    const totalTasks = project.tasks.length;
    const completionPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const totalFiles = project.generatedCode.length;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Team Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Tasks" value={totalTasks} icon={<TasksIcon />} />
                <StatCard title="Generated Files" value={totalFiles} icon={<FileIcon />} />
                <StatCard title="Chat Messages" value={project.messages.length} icon={<ChatIcon />} />
            </div>
            <div className="mt-8 bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Task Progress</h3>
                <div className="w-full bg-gray-700 rounded-full h-4">
                    <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                </div>
                <p className="text-right text-sm text-gray-400 mt-2">{completionPercentage}% Complete</p>
                <div className="flex justify-between mt-4 text-center">
                    <div><p className="font-bold text-xl">{pendingTasks}</p><p className="text-sm text-gray-400">Pending</p></div>
                    <div><p className="font-bold text-xl">{inProgressTasks}</p><p className="text-sm text-gray-400">In Progress</p></div>
                    <div><p className="font-bold text-xl">{doneTasks}</p><p className="text-sm text-gray-400">Done</p></div>
                </div>
            </div>
        </div>
    );
};

const ProjectHeatmapView = ({ project }: { project: Project }) => {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [filterStatus, setFilterStatus] = useState<Task['status'] | 'all'>('all');
    const [sortBy, setSortBy] = useState<'files' | 'status' | 'name'>('files');

    if (!project.tasks.length) {
        return (
            <div className="text-center p-8 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-bold">No Task Data</h2>
                <p className="text-gray-400 mt-2">Generate some tasks to see the project heatmap.</p>
            </div>
        );
    }

    const maxFiles = Math.max(...project.tasks.map(t => t.files.length), 0);
    const totalFiles = project.tasks.reduce((sum, task) => sum + task.files.length, 0);
    const avgFiles = project.tasks.length > 0 ? (totalFiles / project.tasks.length).toFixed(1) : '0';

    const getIntensity = (fileCount: number) => {
        if (maxFiles === 0) return 0;
        return fileCount / maxFiles;
    };

    const getStatusColor = (status: Task['status']) => {
        switch (status) {
            case 'done': return 'bg-green-500';
            case 'in-progress': return 'bg-yellow-500';
            case 'pending': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    const getHeatmapColor = (intensity: number, status: Task['status']) => {
        const baseIntensity = intensity;
        if (status === 'done') {
            return `rgba(34, 197, 94, ${0.3 + baseIntensity * 0.7})`; // Green gradient
        } else if (status === 'in-progress') {
            return `rgba(234, 179, 8, ${0.3 + baseIntensity * 0.7})`; // Yellow gradient
        } else {
            return `rgba(59, 130, 246, ${0.2 + baseIntensity * 0.8})`; // Blue gradient
        }
    };

    const filteredTasks = project.tasks.filter(task => 
        filterStatus === 'all' || task.status === filterStatus
    );

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        switch (sortBy) {
            case 'files':
                return b.files.length - a.files.length;
            case 'status':
                const statusOrder = { 'done': 0, 'in-progress': 1, 'pending': 2 };
                return statusOrder[a.status] - statusOrder[b.status];
            case 'name':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });

    const statusCounts = {
        pending: project.tasks.filter(t => t.status === 'pending').length,
        'in-progress': project.tasks.filter(t => t.status === 'in-progress').length,
        done: project.tasks.filter(t => t.status === 'done').length
    };

    return (
        <div className="h-full flex flex-col" style={{ minHeight: 0 }}>
            {/* Header with Stats - Fixed/Shrinkable */}
            <div className="shrink-0 overflow-y-auto">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Project Heatmap
                </h2>
                <p className="text-gray-400 mb-4">Visualize task complexity, status, and file associations at a glance</p>
                
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm p-3 rounded-xl border border-blue-500/30">
                        <div className="text-2xl font-bold text-blue-400">{project.tasks.length}</div>
                        <div className="text-xs text-gray-400">Total Tasks</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm p-3 rounded-xl border border-purple-500/30">
                        <div className="text-2xl font-bold text-purple-400">{totalFiles}</div>
                        <div className="text-xs text-gray-400">Total Files</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm p-3 rounded-xl border border-green-500/30">
                        <div className="text-2xl font-bold text-green-400">{avgFiles}</div>
                        <div className="text-xs text-gray-400">Avg Files/Task</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-sm p-3 rounded-xl border border-yellow-500/30">
                        <div className="text-2xl font-bold text-yellow-400">{maxFiles}</div>
                        <div className="text-xs text-gray-400">Max Files</div>
                    </div>
                </div>

                {/* Filters and Controls */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Filter:</span>
                        <div className="flex gap-1.5">
                            {(['all', 'pending', 'in-progress', 'done'] as const).map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                        filterStatus === status
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {status === 'all' ? 'All' : status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Sort:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'files' | 'status' | 'name')}
                            className="px-2.5 py-1 rounded-lg bg-gray-700 text-white text-xs border border-gray-600 focus:outline-none focus:border-blue-500"
                        >
                            <option value="files">By File Count</option>
                            <option value="status">By Status</option>
                            <option value="name">By Name</option>
                        </select>
                    </div>
                </div>

                {/* Status Legend */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-xs">
                    <span className="text-gray-400">Status:</span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-blue-500"></div>
                        <span className="text-gray-300">Pending ({statusCounts.pending})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-yellow-500"></div>
                        <span className="text-gray-300">In Progress ({statusCounts['in-progress']})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-green-500"></div>
                        <span className="text-gray-300">Done ({statusCounts.done})</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 flex flex-col gap-4" style={{ minHeight: 0 }}>
                {/* Heatmap Grid - Scrollable */}
                <div className="flex-1 overflow-auto" style={{ minHeight: 0 }}>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2.5 p-2">
                        {sortedTasks.map(task => {
                            const intensity = getIntensity(task.files.length);
                            const bgColor = getHeatmapColor(intensity, task.status);
                            const isSelected = selectedTask?.id === task.id;
                            
                            return (
                                <div
                                    key={task.id}
                                    onClick={() => setSelectedTask(task)}
                                    className="relative group cursor-pointer transform transition-all hover:scale-105"
                                >
                                    <div
                                        className={`aspect-square rounded-lg border-2 transition-all ${
                                            isSelected ? 'border-white shadow-lg shadow-blue-500/50 scale-105' : 'border-transparent group-hover:border-blue-400'
                                        }`}
                                        style={{
                                            background: bgColor,
                                            boxShadow: intensity > 0.5 ? `0 0 15px ${bgColor}` : 'none',
                                        }}
                                    >
                                        {/* Status indicator */}
                                        <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${getStatusColor(task.status)} shadow-sm`}></div>
                                        
                                        {/* File count badge */}
                                        {task.files.length > 0 && (
                                            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-semibold">
                                                {task.files.length}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Enhanced Tooltip - Fixed positioning */}
                                    <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 p-2.5 bg-gray-900 text-white rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-gray-700 ${
                                        isSelected ? 'opacity-100' : ''
                                    }`}
                                    style={{ 
                                        maxWidth: 'calc(100vw - 2rem)',
                                        wordBreak: 'break-word'
                                    }}>
                                        <div className="flex items-start justify-between mb-1.5 gap-2">
                                            <h4 className="font-bold text-xs leading-tight">{task.title}</h4>
                                            <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${getStatusColor(task.status)}`}>
                                                {task.status === 'in-progress' ? 'IP' : task.status.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-300 mb-1.5 line-clamp-2 leading-tight">{task.description}</p>
                                        <div className="flex items-center gap-3 text-xs">
                                            <div className="flex items-center gap-1">
                                                <FileIcon className="w-3 h-3" />
                                                <span>{task.files.length}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: bgColor }}></div>
                                                <span>{(intensity * 100).toFixed(0)}%</span>
                                            </div>
                                        </div>
                                        {task.files.length > 0 && (
                                            <div className="mt-1.5 pt-1.5 border-t border-gray-700">
                                                <div className="text-xs text-gray-400 mb-1">Files:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {task.files.slice(0, 2).map((file, idx) => (
                                                        <span key={idx} className="text-xs bg-gray-800 px-1 py-0.5 rounded truncate max-w-[120px]">
                                                            {file.split('/').pop()}
                                                        </span>
                                                    ))}
                                                    {task.files.length > 2 && (
                                                        <span className="text-xs text-gray-500">+{task.files.length - 2}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Task Details Panel - Fixed at bottom */}
                {selectedTask && (
                    <div className="shrink-0 bg-gray-800 rounded-lg p-4 border border-gray-700 animate-slide-up max-h-64 overflow-y-auto">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold mb-1 truncate">{selectedTask.title}</h3>
                                <div className="flex items-center gap-2 text-sm flex-wrap">
                                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedTask.status)}`}>
                                        {selectedTask.status === 'in-progress' ? 'In Progress' : selectedTask.status.charAt(0).toUpperCase() + selectedTask.status.slice(1)}
                                    </span>
                                    <span className="text-gray-400 flex items-center gap-1">
                                        <FileIcon className="w-3 h-3" />
                                        {selectedTask.files.length} {selectedTask.files.length === 1 ? 'file' : 'files'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedTask(null)}
                                className="text-gray-400 hover:text-white transition-colors shrink-0 ml-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{selectedTask.description}</p>
                        {selectedTask.files.length > 0 ? (
                            <div>
                                <h4 className="text-xs font-semibold text-gray-400 mb-2">Associated Files:</h4>
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                    {selectedTask.files.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 bg-gray-700 px-2 py-1.5 rounded-lg text-xs">
                                            <FileIcon className="w-3 h-3 text-blue-400 shrink-0" />
                                            <span className="truncate max-w-[200px]">{file}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500 text-sm">No files associated with this task yet.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const MemoryAgentView = ({ state, onStateChange }: { state?: { messages: ChatMessage[]; input: string; isLoading: boolean }, onStateChange?: (updates: Partial<{ messages: ChatMessage[]; input: string; isLoading: boolean }>) => void }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(state?.messages || []);
    const [input, setInput] = useState(state?.input || '');
    const [isLoading, setIsLoading] = useState(state?.isLoading || false);

    // Component will remount when switching views, so state prop will be used in useState initialization above

    // Update persisted state when local state changes
    const updateState = (updates: Partial<{ messages: ChatMessage[]; input: string; isLoading: boolean }>) => {
        if (onStateChange) {
            onStateChange(updates);
        }
    };

    const handleInputChange = (value: string) => {
        setInput(value);
        updateState({ input: value });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { id: `mem-msg-${Date.now()}`, sender: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        const currentInput = input;
        setInput('');
        setIsLoading(true);
        updateState({ messages: newMessages, input: '', isLoading: true });

        try {
            const aiResponseText = await geminiService.askMemoryAgent(newMessages, currentInput);
            const aiMessage: ChatMessage = { id: `mem-msg-${Date.now() + 1}`, sender: 'ai', text: aiResponseText };
            const updatedMessages = [...newMessages, aiMessage];
            setMessages(updatedMessages);
            updateState({ messages: updatedMessages, isLoading: false });
        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = { id: `mem-msg-${Date.now() + 1}`, sender: 'ai', text: 'Sorry, I encountered an error.' };
            const updatedMessages = [...newMessages, errorMessage];
            setMessages(updatedMessages);
            updateState({ messages: updatedMessages, isLoading: false });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-2">Memory Agent</h2>
            <p className="text-gray-400 mb-4">Chat with an AI that remembers the entire conversation for better contextual understanding.</p>
            <div className="flex-grow bg-gray-800 rounded-t-lg p-4 border border-b-0 border-gray-700 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xl p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-gray-700'} prose prose-invert max-w-none`}>
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="flex justify-start"><div className="max-w-xl p-3 rounded-lg bg-gray-700">Thinking...</div></div>}
                </div>
            </div>
            <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 rounded-b-lg border border-t-0 border-gray-700">
                <input
                    type="text"
                    value={input}
                    onChange={e => handleInputChange(e.target.value)}
                    placeholder="Start a conversation..."
                    className="w-full p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                />
            </form>
        </div>
    );
};

const AgentSimulationView = ({ project, onUpdateProject, onSwitchView, state, onStateChange }: { project: Project, onUpdateProject: (updates: Partial<Project>) => void, onSwitchView: (view: View) => void, state?: { goal: string; simulationTurns: SimulationTurn[]; finalFileSet: GeneratedCode[]; isLoading: boolean; error: string; isComplete: boolean }, onStateChange?: (updates: Partial<{ goal: string; simulationTurns: SimulationTurn[]; finalFileSet: GeneratedCode[]; isLoading: boolean; error: string; isComplete: boolean }>) => void }) => {
    const [goal, setGoal] = useState(state?.goal || '');
    const [simulationTurns, setSimulationTurns] = useState<SimulationTurn[]>(state?.simulationTurns || []);
    const [finalFileSet, setFinalFileSet] = useState<GeneratedCode[]>(state?.finalFileSet || []);
    const [isLoading, setIsLoading] = useState(state?.isLoading || false);
    const [error, setError] = useState(state?.error || '');
    const [isComplete, setIsComplete] = useState(state?.isComplete || false);

    // Component will remount when switching views, so state prop will be used in useState initialization above

    // Update persisted state when local state changes
    const updateState = (updates: Partial<{ goal: string; simulationTurns: SimulationTurn[]; finalFileSet: GeneratedCode[]; isLoading: boolean; error: string; isComplete: boolean }>) => {
        if (onStateChange) {
            onStateChange(updates);
        }
    };

    const handleGoalChange = (value: string) => {
        setGoal(value);
        updateState({ goal: value });
    };

    const handleRun = async () => {
        if (!goal.trim()) return;
        setIsLoading(true);
        setError('');
        setSimulationTurns([]);
        setFinalFileSet([]);
        setIsComplete(false);
        updateState({ isLoading: true, error: '', simulationTurns: [], finalFileSet: [], isComplete: false });
        try {
            const result = await geminiService.runAgentSimulation(goal, project.generatedCode);
            setSimulationTurns(result.turns);
            setFinalFileSet(result.files);
            setIsComplete(true);
            updateState({ simulationTurns: result.turns, finalFileSet: result.files, isComplete: true, isLoading: false });
        } catch (e) {
            const errorMessage = (e as Error).message;
            setError(errorMessage);
            updateState({ error: errorMessage, isLoading: false });
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = () => {
        const codeMap = new Map<string, GeneratedCode>(project.generatedCode.map(file => [file.fileName, file]));
        finalFileSet.forEach(newFile => {
            codeMap.set(newFile.fileName, newFile);
        });
        const mergedCode = Array.from(codeMap.values());
        onUpdateProject({ generatedCode: mergedCode });
        onSwitchView('editor');
    };

    const handleDiscard = () => {
        setSimulationTurns([]);
        setFinalFileSet([]);
        setIsComplete(false);
        setGoal('');
        updateState({ simulationTurns: [], finalFileSet: [], isComplete: false, goal: '' });
    };

    const { createdFiles, modifiedFiles } = React.useMemo(() => {
        if (!isComplete) return { createdFiles: [], modifiedFiles: [] };
        const existingFileNames = new Set(project.generatedCode.map(f => f.fileName));
        const created: string[] = [];
        const modified: string[] = [];
        finalFileSet.forEach(file => {
            if (existingFileNames.has(file.fileName)) {
                modified.push(file.fileName);
            } else {
                created.push(file.fileName);
            }
        });
        return { createdFiles: created, modifiedFiles: modified };
    }, [isComplete, finalFileSet, project.generatedCode]);

    const getAgentInfo = (agentName: string): { icon: React.ReactNode; color: string; name: string } => {
        const lowerAgentName = agentName.toLowerCase();
        if (lowerAgentName.includes('manager')) {
            return { icon: <ManagerIcon className="w-8 h-8 text-blue-400" />, color: 'border-blue-500', name: "Project Manager" };
        }
        if (lowerAgentName.includes('developer')) {
            return { icon: <CodeIcon className="w-8 h-8 text-green-400" />, color: 'border-green-500', name: "Senior Developer" };
        }
        if (lowerAgentName.includes('qa')) {
            return { icon: <QAIcon className="w-8 h-8 text-yellow-400" />, color: 'border-yellow-500', name: "QA Engineer" };
        }
        return { icon: <ChatIcon className="w-8 h-8 text-gray-400" />, color: 'border-gray-500', name: agentName };
    };

    return (
         <div className="flex flex-col h-full gap-4">
            <div>
                <h2 className="text-2xl font-bold mb-2">Multi-Agent Simulation</h2>
                <p className="text-gray-400">Define a goal and watch a simulated team of AI agents (Manager, Developer, QA) collaborate to achieve it. Approve their work to apply it directly to your project files.</p>
            </div>
            
            {!isComplete ? (
                 <div className="flex flex-col gap-4">
                    <textarea
                        className="w-full h-24 p-3 bg-gray-800 border border-gray-700 rounded-lg"
                        value={goal}
                        onChange={(e) => {
                            const value = e.target.value;
                            setGoal(value);
                            updateState({ goal: value });
                        }}
                        placeholder="e.g., 'Add a dark mode toggle button to the React app'"
                    />
                    <button
                        onClick={handleRun}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Simulating...' : 'Start Simulation'} <LogoIcon className="w-5 h-5 button-logo-icon" />
                    </button>
                 </div>
            ) : (
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h3 className="text-lg font-bold">Simulation Complete</h3>
                    <p className="text-gray-400 mb-4">Review the proposed changes and approve to apply them to the editor.</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <h4 className="font-semibold mb-2 text-green-400">Files to Create ({createdFiles.length})</h4>
                            <ul className="text-sm list-disc list-inside text-gray-300">{createdFiles.map(f => <li key={f} className="truncate">{f}</li>)}</ul>
                        </div>
                        <div>
                             <h4 className="font-semibold mb-2 text-yellow-400">Files to Modify ({modifiedFiles.length})</h4>
                            <ul className="text-sm list-disc list-inside text-gray-300">{modifiedFiles.map(f => <li key={f} className="truncate">{f}</li>)}</ul>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleApprove} className="flex-1 flex items-center justify-center gap-2 bg-green-600 font-semibold p-2 rounded-lg hover:bg-green-500">
                            <LogoIcon className="w-5 h-5 button-logo-icon" /> Approve & Apply Changes
                        </button>
                        <button onClick={handleDiscard} className="flex-1 flex items-center justify-center gap-2 bg-gray-600 font-semibold p-2 rounded-lg hover:bg-gray-500">
                           <LogoIcon className="w-5 h-5 button-logo-icon" /> Discard
                        </button>
                    </div>
                </div>
            )}
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 overflow-y-auto flex-grow">
                {isLoading && <div className="text-center p-8">Simulation in progress... This may take a moment.</div>}
                {error && <p className="text-red-400">{error}</p>}
                {!isLoading && !error && simulationTurns.length > 0 && (
                    <div className="space-y-6">
                        {simulationTurns.map((turn, index) => {
                            const { icon, color, name } = getAgentInfo(turn.agent);
                            return (
                                <div key={index} className={`flex items-start gap-4 p-4 bg-gray-700/50 rounded-lg border-l-4 ${color}`}>
                                    <div className="shrink-0 pt-1">{icon}</div>
                                    <div className="flex-grow">
                                        <p className="font-bold text-gray-200">{name}</p>
                                        <div className="prose prose-invert max-w-none text-gray-300">
                                            <ReactMarkdown>{turn.message}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                 {!isLoading && !error && simulationTurns.length === 0 && (
                    <div className="text-center text-gray-500 p-8">
                        The simulation results will appear here.
                    </div>
                )}
            </div>
        </div>
    );
};