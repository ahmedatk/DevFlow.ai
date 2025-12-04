import React, { useState } from 'react';
import { Project, Task } from '../types';
import { FileIcon } from '../components/icons';

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
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${filterStatus === status
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
                                        className={`aspect-square rounded-lg border-2 transition-all ${isSelected ? 'border-white shadow-lg shadow-blue-500/50 scale-105' : 'border-transparent group-hover:border-blue-400'
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
                                    <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 p-2.5 bg-gray-900 text-white rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-gray-700 ${isSelected ? 'opacity-100' : ''
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

export default ProjectHeatmapView;
