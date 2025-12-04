import React, { useState } from 'react';
import { Project, SimulationTurn, GeneratedCode } from '../types';
import * as geminiService from '../services/geminiService';
import { View } from '../components/layout/Sidebar';
import { ManagerIcon, CodeIcon, QAIcon, ChatIcon, LogoIcon } from '../components/icons';
import ReactMarkdown from 'react-markdown';

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

export default AgentSimulationView;
