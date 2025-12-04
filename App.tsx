import React, { useState, useEffect } from 'react';
import { auth, db } from './src/firebase';
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { collection, query, orderBy, onSnapshot, addDoc, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { Project } from './src/types';
import { LogoIcon } from './src/components/icons';
import LandingPage from './src/pages/LandingPage';
import AuthPage from './src/pages/AuthPage';
import ProjectSelection from './src/pages/ProjectSelection';
import ProjectDashboard from './src/pages/ProjectDashboard';

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

    const handleDeleteProject = async (projectId: string) => {
        if (!user) return;
        const projectDocRef = doc(db, 'users', user.uid, 'projects', projectId);
        try {
            await deleteDoc(projectDocRef);
            if (selectedProjectId === projectId) {
                setSelectedProjectId(null);
            }
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    if (!selectedProject) {
        return <ProjectSelection projects={projects} onSelectProject={handleSelectProject} onCreateProject={handleCreateProject} onDeleteProject={handleDeleteProject} onLogout={handleLogout} />;
    }

    return <ProjectDashboard key={selectedProject.id} project={selectedProject} onGoBack={() => setSelectedProjectId(null)} onUpdateProject={handleUpdateProject} user={user} onLogout={handleLogout} />;
};

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