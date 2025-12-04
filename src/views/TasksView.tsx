import React, { useState, useEffect } from 'react';
import { Project, Task, GeneratedFile, GeneratedCode } from '../types';
import * as geminiService from '../services/geminiService';
import { CodePreview } from '../components/common/CodePreview';
import { PlusIcon, FileIcon, TrashIcon } from '../components/icons';

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

export default TasksView;
