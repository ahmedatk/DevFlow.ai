import React, { useState, useEffect, useRef } from 'react';
import Typewriter from '../components/common/Typewriter';
import { FAQ } from '../components/common/FAQ';
import { FeatureModal } from '../components/common/FeatureModal';
import { DemoModal } from '../components/common/DemoModal';
import {
    ScaffoldIcon, EditorIcon, TasksIcon, DocsIcon, ChatIcon,
    ArchitectureIcon, ComplexityIcon, CommitIcon, MemoryIcon,
    SimulationIcon, HeatmapIcon, TeamDashboardIcon, LogoIcon
} from '../components/icons';

// --- Landing Page Component ---
const LandingPage = ({ onShowAuth }: { onShowAuth: () => void }) => {
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax-layer-1, .parallax-layer-2, .parallax-layer-faq, .parallax-layer-3');
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

    // Animation Observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    entry.target.classList.remove('opacity-0'); // Ensure visibility
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        const animatedElements = document.querySelectorAll('.animate-fade-in-up, .stagger-reveal');
        animatedElements.forEach((el) => observer.observe(el));

        return () => animatedElements.forEach((el) => observer.unobserve(el));
    }, []);

    // Spotlight Effect Logic
    const cardsRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardsRef.current) return;

        const cards = cardsRef.current.getElementsByClassName('spotlight-card');
        for (const card of cards) {
            const rect = (card as HTMLElement).getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
            (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
        }
    };



    const [selectedFeature, setSelectedFeature] = useState<any>(null);
    const [isDemoOpen, setIsDemoOpen] = useState(false);

    const features = [
        {
            icon: <ScaffoldIcon />,
            name: 'AI Project Scaffolder',
            desc: 'Generate a full codebase from a description.',
            details: 'The AI Project Scaffolder is your starting point for any new idea. Instead of spending hours setting up boilerplate code, configuring build tools, and structuring directories, simply describe your project in plain English. Our advanced AI analyzes your requirements and generates a production-ready project structure complete with necessary dependencies, configuration files, and initial code.',
            benefits: [
                'Save hours of initial setup time',
                'Get industry-standard project structures',
                'Automatic dependency management',
                'Ready-to-run development environment'
            ]
        },
        {
            icon: <EditorIcon />,
            name: 'Hierarchical Editor',
            desc: 'View and manage your code in a file tree.',
            details: 'Experience a familiar yet powerful editing environment right in your browser. The Hierarchical Editor provides a full file tree view, syntax highlighting for over 50 languages, and intelligent code completion. It seamlessly integrates with the AI tools, allowing you to apply generated code directly to your files with a single click.',
            benefits: [
                'VS Code-like editing experience',
                'Seamless AI integration',
                'Real-time syntax highlighting',
                'Easy file management and navigation'
            ]
        },
        {
            icon: <TasksIcon />,
            name: 'Kanban Board',
            desc: 'Visualize and manage your workflow.',
            details: 'Stay organized with our integrated Kanban Board. The AI automatically decomposes your project into manageable tasks and populates the board. You can drag and drop tasks between "To Do", "In Progress", and "Done" states, ensuring you always know what to work on next. It acts as your personal project manager.',
            benefits: [
                'Automated task generation',
                'Visual progress tracking',
                'Drag-and-drop interface',
                'Clear project roadmap'
            ]
        },
        {
            icon: <DocsIcon />,
            name: 'AI Documentation',
            desc: 'Instantly create docs from your code.',
            details: 'Documentation is often neglected, but not with DevFlow.AI. Our Documentation Generator scans your codebase and automatically creates comprehensive documentation, including API references, README files, and inline comments. Keep your project well-documented without writing a single line of manual explanation.',
            benefits: [
                'Always up-to-date documentation',
                'Professional README generation',
                'Detailed API references',
                'Better code maintainability'
            ]
        },
        {
            icon: <ChatIcon />,
            name: 'Context-Aware Chat',
            desc: 'An AI that knows your project status.',
            details: 'Stop copy-pasting code into external chat windows. Our Context-Aware Chat lives inside your IDE and understands your entire project structure, open files, and recent changes. Ask questions like "Why is this function failing?" or "How do I add authentication?" and get answers that are specifically tailored to your current codebase.',
            benefits: [
                'No context switching required',
                'Deep understanding of your code',
                'Instant debugging assistance',
                'Personalized coding advice'
            ]
        },
        {
            icon: <ArchitectureIcon />,
            name: 'Architecture Diagrams',
            desc: 'Visualize your code automatically.',
            details: 'Understanding complex systems is easier with visuals. The Architecture Diagram tool automatically analyzes your code imports and dependencies to generate interactive Mermaid diagrams. Visualize class hierarchies, data flow, and system modules to get a high-level view of your project\'s structure.',
            benefits: [
                'Instant visual system overview',
                'Identify dependency issues',
                'Better architectural planning',
                'Great for onboarding new team members'
            ]
        },
        {
            icon: <ComplexityIcon />,
            name: 'Complexity Analysis',
            desc: 'Understand the efficiency of your code.',
            details: 'Write better, more efficient code with our Complexity Analysis tool. It scans your files to calculate Cyclomatic Complexity and other metrics, highlighting areas that are too complex or prone to bugs. Get actionable suggestions on how to refactor and simplify your code for better performance and maintainability.',
            benefits: [
                'Identify technical debt early',
                'Improve code readability',
                'Reduce bug potential',
                'Data-driven refactoring'
            ]
        },
        {
            icon: <CommitIcon />,
            name: 'Commit Summarizer',
            desc: 'Generate commit messages from diffs.',
            details: 'Never write a vague "bug fixes" commit message again. The Commit Summarizer analyzes your staged changes and generates descriptive, conventional commit messages automatically. It ensures your git history is clean, professional, and easy to understand for your team.',
            benefits: [
                'Professional git history',
                'Time-saving automation',
                'Accurate change descriptions',
                'Standardized commit format'
            ]
        },
        {
            icon: <MemoryIcon />,
            name: 'Memory Agent',
            desc: 'Chat with an AI that remembers everything.',
            details: 'The Memory Agent is your long-term project partner. Unlike standard chat sessions that reset, the Memory Agent retains information across sessions. It remembers your architectural decisions, preferred coding style, and past discussions, providing increasingly personalized and relevant assistance as your project evolves.',
            benefits: [
                'Long-term context retention',
                'Personalized coding style',
                'Remembers past decisions',
                'Continuous learning assistant'
            ]
        },
        {
            icon: <SimulationIcon />,
            name: 'Agent Simulation',
            desc: 'Simulate a dev team to solve problems.',
            details: 'Unleash the power of a virtual development team. The Agent Simulation creates specialized AI agents (e.g., Product Manager, Lead Developer, QA Engineer) that collaborate to solve complex problems. Watch them discuss, plan, and execute tasks together to find the best solution for your challenge.',
            benefits: [
                'Multi-perspective problem solving',
                'Automated peer review',
                'Comprehensive solution planning',
                'Simulated team collaboration'
            ]
        },
        {
            icon: <HeatmapIcon />,
            name: 'Project Heatmap',
            desc: 'Visualize task complexity at a glance.',
            details: 'Get a bird\'s-eye view of your project\'s activity and complexity. The Project Heatmap visualizes which files are being modified most frequently and where the most complex logic resides. It helps you identify hotspots that might need refactoring or extra testing attention.',
            benefits: [
                'Identify active development areas',
                'Spot potential bottlenecks',
                'Visual complexity tracking',
                'Data-driven project management'
            ]
        },
        {
            icon: <TeamDashboardIcon />,
            name: 'Team Dashboard',
            desc: 'Get a high-level overview of progress.',
            details: 'Keep your team aligned and informed. The Team Dashboard aggregates data from all other tools to provide a high-level overview of project health, recent activity, and upcoming tasks. It\'s the perfect command center for team leads and project managers.',
            benefits: [
                'Centralized project status',
                'Team velocity tracking',
                'Better resource allocation',
                'Transparent progress monitoring'
            ]
        },
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
                        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight animate-fade-in-up">
                            <span className="bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent animate-gradient-text">
                                Your AI-Powered Developer Command Center
                            </span>
                        </h1>
                        <p className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-100 min-h-[3.5rem]">
                            <Typewriter text="Plan, build, debug, and document your projects with a unified AI-native workflow, without ever leaving your IDE." />
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200">
                            <button onClick={onShowAuth} className="bg-blue-600 text-white font-semibold py-4 px-10 rounded-lg text-lg hover:bg-blue-500 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50 animate-glow-pulse">
                                Get Started for Free
                            </button>
                            <button onClick={() => setIsDemoOpen(true)} className="border-2 border-gray-600 text-white font-semibold py-4 px-10 rounded-lg text-lg hover:border-gray-500 hover:bg-gray-800/50 transition-all backdrop-blur-sm">
                                Watch Demo
                            </button>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="py-16 parallax-layer-2">
                        <div className="text-center mb-12 animate-fade-in-up">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">All The Tools You Need. Unified.</h2>
                            <p className="text-gray-400 text-lg">Everything you need to build, deploy, and scale your projects in one place</p>
                        </div>
                        <div
                            ref={cardsRef}
                            onMouseMove={handleMouseMove}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-reveal"
                        >
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedFeature(feature)}
                                    className="spotlight-card bg-gray-800/60 backdrop-blur-md p-6 rounded-xl text-left border border-gray-700/50 hover:border-blue-500/50 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20 group cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative z-10">
                                        <div className="text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300">{React.cloneElement(feature.icon, { className: 'w-8 h-8' })}</div>
                                        <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">{feature.name}</h3>
                                        <p className="text-gray-400 mb-4">{feature.desc}</p>
                                        <div className="flex items-center text-sm text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                            Learn more <span className="ml-1">&rarr;</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>


                    </div>


                    {/* FAQ Section */}
                    <div className="parallax-layer-faq">
                        <FAQ />
                    </div>

                    {/* CTA Section */}
                    <div className="py-20 text-center parallax-layer-3">
                        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md p-12 rounded-2xl border border-blue-500/30 max-w-4xl mx-auto animate-fade-in-up">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Development Workflow?</h2>
                            <p className="text-gray-300 text-lg mb-8">Join thousands of developers who are already building faster with AI</p>
                            <button onClick={onShowAuth} className="bg-blue-600 text-white font-semibold py-4 px-10 rounded-lg text-lg hover:bg-blue-500 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50 animate-glow-pulse">
                                Start Building Now
                            </button>
                        </div>
                    </div>
                </main>

                <footer className="relative z-10 text-center py-8 border-t border-gray-800/50">
                    <p className="text-gray-500">&copy; {new Date().getFullYear()} DevFlow.AI. The future of development.</p>
                </footer>
            </div>

            {/* Feature Detail Modal - Placed here to avoid parallax transform issues */}
            <FeatureModal
                feature={selectedFeature}
                onClose={() => setSelectedFeature(null)}
            />

            {/* Demo Presentation Modal */}
            <DemoModal
                isOpen={isDemoOpen}
                onClose={() => setIsDemoOpen(false)}
            />
        </div>
    );
};

export default LandingPage;
