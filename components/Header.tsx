import React from 'react';
import { MenuIcon, CloseIcon } from './icons';

export const Header = ({ title, projectName, onToggleSidebar, isSidebarOpen }: { title: string, projectName: string, onToggleSidebar?: () => void, isSidebarOpen?: boolean }) => {
    const showToggle = Boolean(onToggleSidebar);
    return (
        <header className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between gap-4 flex-shrink-0">
            <div className="flex items-center gap-3">
                {showToggle && (
                    <button
                        onClick={onToggleSidebar}
                        className="lg:hidden p-2 rounded-md bg-gray-700/60 border border-gray-600 text-gray-200 hover:bg-gray-700 transition-colors"
                        aria-label="Toggle navigation"
                    >
                        {isSidebarOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
                    </button>
                )}
                <div>
                    <p className="text-xs text-gray-400">Project</p>
                    <h2 className="text-lg font-semibold text-gray-200">{projectName}</h2>
                </div>
            </div>
            <div className="text-right">
                <p className="text-xs text-gray-400">Current View</p>
                <h2 className="text-lg font-semibold text-gray-200">{title}</h2>
            </div>
        </header>
    );
};