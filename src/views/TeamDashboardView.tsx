import React from 'react';
import { Project } from '../types';
import { TasksIcon, FileIcon, ChatIcon } from '../components/icons';

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

export default TeamDashboardView;
