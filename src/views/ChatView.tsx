import React, { useState } from 'react';
import { Project, ChatMessage } from '../types';
import * as geminiService from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const ChatView = ({ project, updateProjectState }: { project: Project, updateProjectState: (updates: Partial<Project>) => void }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { id: `msg-${Date.now()}`, sender: 'user', text: input };
        const updatedMessages = [...project.messages, userMessage];
        updateProjectState({ messages: updatedMessages });
        setInput('');
        setIsLoading(true);

        try {
            const aiResponseText = await geminiService.continueConversation(updatedMessages, project);
            const aiMessage: ChatMessage = { id: `msg-${Date.now() + 1}`, sender: 'ai', text: aiResponseText };
            updateProjectState({ messages: [...updatedMessages, aiMessage] });
        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = { id: `msg-${Date.now() + 1}`, sender: 'ai', text: 'Sorry, I encountered an error.' };
            updateProjectState({ messages: [...updatedMessages, errorMessage] });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-4">Team Chat</h2>
            <div className="flex-grow bg-gray-800 rounded-t-lg p-4 border border-b-0 border-gray-700 overflow-y-auto">
                <div className="space-y-4">
                    {project.messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xl p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-gray-700'} prose prose-invert max-w-none`}>
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="flex justify-start"><div className="max-w-xl p-3 rounded-lg bg-gray-700">Thinking...</div></div>}
                </div>
            </div>
            <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 rounded-b-lg border border-t-0 border-gray-700">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask DevFlow.AI anything..."
                    className="w-full p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                />
            </form>
        </div>
    );
};

export default ChatView;
