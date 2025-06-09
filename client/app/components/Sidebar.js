// client/app/components/Sidebar.js
"use client";
import React from 'react';

const Sidebar = ({ isOpen, onClose, children, onNewChatClick }) => {
    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            ></div>

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full bg-[#111b21] text-white w-80 z-50 transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <div className="flex justify-between items-center p-4 border-b border-[#313d44]">
                    <h2 className="text-lg font-semibold">Sessions</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#374045] rounded-full"
                        title="Close sidebar"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
                <div className="relative flex-grow overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-700">
                    {/* Sidebar content (session list) */}
                    {children}
                </div>
                {/* New Chat Button - Moved outside the scrollable area */}
                <button
                    onClick={() => {
                        if (onNewChatClick) onNewChatClick();
                        onClose(); // Close sidebar after clicking
                    }}
                    // Positioned absolutely relative to the main sidebar container
                    className="absolute bottom-6 right-6 z-10 flex items-center justify-center w-14 h-14 bg-[#00a884] hover:bg-[#017561] text-white rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111b21] focus:ring-[#00a884]"
                    title="New Chat"
                >
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </>
    );
};

export default Sidebar;