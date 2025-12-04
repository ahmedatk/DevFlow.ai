import React from 'react';
import { MenuIcon, CloseIcon } from '../icons';

export const Header = ({ title, projectName, onToggleSidebar, isSidebarOpen }: { title: string, projectName: string, onToggleSidebar?: () => void, isSidebarOpen?: boolean }) => {
    const showToggle = Boolean(onToggleSidebar);
    return (
        <header className="bg-gray-800 p-3 sm:p-4 border-b border-gray-700 flex items-center justify-between gap-2 sm:gap-4 flex-shrink-0 safe-area-top">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {showToggle && (
                    <button
                        onClick={onToggleSidebar}
                        className="lg:hidden p-2 rounded-md bg-gray-700/60 border border-gray-600 text-gray-200 hover:bg-gray-700 transition-colors flex-shrink-0"
                        aria-label="Toggle navigation"
                    >
                        {isSidebarOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
                    </button>
                )}
                <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 hidden sm:block">Project</p>
                    <h2 className="text-sm sm:text-lg font-semibold text-gray-200 truncate">{projectName}</h2>
                </div>
            </div>
            <div className="text-right flex-shrink-0 hidden sm:block">
                <p className="text-xs text-gray-400">Current View</p>
                <h2 className="text-lg font-semibold text-gray-200 truncate max-w-[200px]">{title}</h2>
            </div>
            <div className="text-right flex-shrink-0 sm:hidden">
                <h2 className="text-xs font-semibold text-gray-200 truncate max-w-[100px]">{title}</h2>
            </div>
        </header>
    );
};