import React, { useState, useEffect, useRef } from 'react';
import {
    ScaffoldIcon, EditorIcon, SimulationIcon,
    LogoIcon, ChatIcon, TasksIcon, DocsIcon,
    ArchitectureIcon, ComplexityIcon, CommitIcon,
    MemoryIcon, HeatmapIcon, TeamDashboardIcon,
    RunReviewIcon, TestGeneratorIcon, CodeReviewIcon
} from './icons';

const slides = [
    {
        id: 'intro',
        title: 'Welcome to DevFlow.AI',
        subtitle: 'The AI-Powered Developer Command Center',
        icon: <LogoIcon className="w-32 h-32 text-blue-500" />,
        color: 'from-blue-600 to-purple-600'
    },
    {
        id: 'scaffold',
        title: 'AI Project Scaffolder',
        subtitle: 'Describe your idea, and watch the entire codebase appear in seconds.',
        icon: <ScaffoldIcon className="w-32 h-32 text-green-400" />,
        color: 'from-green-600 to-teal-600'
    },
    {
        id: 'editor',
        title: 'Hierarchical Editor',
        subtitle: 'A powerful, VS Code-like environment right in your browser.',
        icon: <EditorIcon className="w-32 h-32 text-yellow-400" />,
        color: 'from-yellow-600 to-orange-600'
    },
    {
        id: 'tasks',
        title: 'Kanban Board',
        subtitle: 'Visualize and manage your workflow with AI-generated tasks.',
        icon: <TasksIcon className="w-32 h-32 text-pink-400" />,
        color: 'from-pink-600 to-red-600'
    },
    {
        id: 'docs',
        title: 'AI Documentation',
        subtitle: 'Instantly create comprehensive docs from your code.',
        icon: <DocsIcon className="w-32 h-32 text-cyan-400" />,
        color: 'from-cyan-600 to-blue-600'
    },
    {
        id: 'chat',
        title: 'Context-Aware Chat',
        subtitle: 'Chat with an AI that understands your entire project context.',
        icon: <ChatIcon className="w-32 h-32 text-indigo-400" />,
        color: 'from-indigo-600 to-violet-600'
    },
    {
        id: 'architecture',
        title: 'Architecture Diagrams',
        subtitle: 'Visualize your code structure automatically with Mermaid diagrams.',
        icon: <ArchitectureIcon className="w-32 h-32 text-orange-400" />,
        color: 'from-orange-600 to-red-600'
    },
    {
        id: 'complexity',
        title: 'Complexity Analysis',
        subtitle: 'Identify and refactor complex code blocks to improve maintainability.',
        icon: <ComplexityIcon className="w-32 h-32 text-red-400" />,
        color: 'from-red-600 to-rose-600'
    },
    {
        id: 'commit',
        title: 'Commit Summarizer',
        subtitle: 'Generate professional commit messages from your changes automatically.',
        icon: <CommitIcon className="w-32 h-32 text-gray-400" />,
        color: 'from-gray-600 to-slate-600'
    },
    {
        id: 'memory',
        title: 'Memory Agent',
        subtitle: 'An AI partner that remembers your project history and decisions.',
        icon: <MemoryIcon className="w-32 h-32 text-emerald-400" />,
        color: 'from-emerald-600 to-green-600'
    },
    {
        id: 'simulation',
        title: 'Agent Simulation',
        subtitle: 'Deploy a team of AI agents to plan, code, and QA your project.',
        icon: <SimulationIcon className="w-32 h-32 text-purple-400" />,
        color: 'from-purple-600 to-pink-600'
    },
    {
        id: 'heatmap',
        title: 'Project Heatmap',
        subtitle: 'Visualize development activity and hotspots in your codebase.',
        icon: <HeatmapIcon className="w-32 h-32 text-amber-400" />,
        color: 'from-amber-600 to-orange-600'
    },
    {
        id: 'team',
        title: 'Team Dashboard',
        subtitle: 'Track progress and collaboration across your entire team.',
        icon: <TeamDashboardIcon className="w-32 h-32 text-blue-400" />,
        color: 'from-blue-600 to-cyan-600'
    },
    {
        id: 'outro',
        title: 'Ready to Build?',
        subtitle: 'Join thousands of developers shipping faster with DevFlow.AI.',
        icon: <LogoIcon className="w-32 h-32 text-white" />,
        color: 'from-blue-600 to-indigo-900'
    }
];

export const DemoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setCurrentSlide(0);
            setProgress(0);
            return;
        }

        if (isPaused) return;

        const slideDuration = 5000; // 5 seconds per slide
        const intervalStep = 50;

        const timer = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + (intervalStep / slideDuration) * 100;
                if (newProgress >= 100) {
                    if (currentSlide < slides.length - 1) {
                        setCurrentSlide(c => c + 1);
                        return 0;
                    } else {
                        // Loop back to start or stop? Let's loop for continuous demo
                        setCurrentSlide(0);
                        return 0;
                    }
                }
                return newProgress;
            });
        }, intervalStep);

        return () => clearInterval(timer);
    }, [isOpen, currentSlide, isPaused]);

    const handleNext = () => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
        setProgress(0);
        setIsPaused(true); // Pause on manual interaction
    };

    const handlePrev = () => {
        setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
        setProgress(0);
        setIsPaused(true);
    };

    const handleJumpTo = (index: number) => {
        setCurrentSlide(index);
        setProgress(0);
        setIsPaused(true);
    };

    if (!isOpen) return null;

    const slide = slides[currentSlide];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in-up">
            <div className="relative w-full max-w-6xl h-[80vh] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 flex flex-col md:flex-row">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-30 p-2 bg-black/50 rounded-full text-white hover:bg-white/20 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Sidebar Taskbar */}
                <div className="hidden md:flex flex-col w-64 bg-gray-800/50 border-r border-gray-700 overflow-y-auto custom-scrollbar">
                    <div className="p-6 border-b border-gray-700/50">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <LogoIcon className="w-6 h-6" /> Demo Tour
                        </h3>
                    </div>
                    <div className="flex-1 p-4 space-y-2">
                        {slides.map((s, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleJumpTo(idx)}
                                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${currentSlide === idx
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                    }`}
                            >
                                <span className="w-5 h-5 flex-shrink-0">
                                    {React.cloneElement(s.icon as React.ReactElement, { className: 'w-full h-full' })}
                                </span>
                                <span className="truncate">{s.title}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Slide Content */}
                <div className="flex-1 relative flex flex-col">
                    <div className={`absolute inset-0 bg-gradient-to-br ${slide.color} opacity-10 transition-colors duration-1000`} />

                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 md:p-16 relative z-10">
                        {/* Animated Content Container with Key for Re-triggering Animations */}
                        <div key={slide.id} className="flex flex-col items-center">
                            <div className="mb-8 animate-float">
                                {slide.icon}
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 animate-fade-in-up">
                                {slide.title}
                            </h2>
                            <p className="text-lg md:text-2xl text-gray-200 max-w-2xl animate-fade-in-up delay-100 leading-relaxed">
                                {slide.subtitle}
                            </p>
                        </div>
                    </div>

                    {/* Controls & Progress */}
                    <div className="relative z-10 bg-gradient-to-t from-black/80 to-transparent p-6 md:p-8">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <button
                                onClick={handlePrev}
                                className="p-2 rounded-full bg-gray-800/50 text-white hover:bg-blue-600 transition-colors border border-gray-600 hover:border-blue-500"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <div className="flex gap-2">
                                {slides.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleJumpTo(idx)}
                                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-blue-500' : 'w-2 bg-gray-600 hover:bg-gray-400'
                                            }`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleNext}
                                className="p-2 rounded-full bg-gray-800/50 text-white hover:bg-blue-600 transition-colors border border-gray-600 hover:border-blue-500"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-100 ease-linear"
                                style={{ width: `${((currentSlide) / slides.length * 100) + (progress / slides.length)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
