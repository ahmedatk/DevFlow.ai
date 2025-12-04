import React, { useState } from 'react';
import { ChatMessage } from '../types';
import * as geminiService from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const MemoryAgentView = ({ state, onStateChange }: { state?: { messages: ChatMessage[]; input: string; isLoading: boolean }, onStateChange?: (updates: Partial<{ messages: ChatMessage[]; input: string; isLoading: boolean }>) => void }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(state?.messages || []);
    const [input, setInput] = useState(state?.input || '');
    const [isLoading, setIsLoading] = useState(state?.isLoading || false);

    // Component will remount when switching views, so state prop will be used in useState initialization above

    // Update persisted state when local state changes
    const updateState = (updates: Partial<{ messages: ChatMessage[]; input: string; isLoading: boolean }>) => {
        if (onStateChange) {
            onStateChange(updates);
        }
    };

    const handleInputChange = (value: string) => {
        setInput(value);
        updateState({ input: value });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { id: `mem-msg-${Date.now()}`, sender: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        const currentInput = input;
        setInput('');
        setIsLoading(true);
        updateState({ messages: newMessages, input: '', isLoading: true });

        try {
            const aiResponseText = await geminiService.askMemoryAgent(newMessages, currentInput);
            const aiMessage: ChatMessage = { id: `mem-msg-${Date.now() + 1}`, sender: 'ai', text: aiResponseText };
            const updatedMessages = [...newMessages, aiMessage];
            setMessages(updatedMessages);
            updateState({ messages: updatedMessages, isLoading: false });
        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = { id: `mem-msg-${Date.now() + 1}`, sender: 'ai', text: 'Sorry, I encountered an error.' };
            const updatedMessages = [...newMessages, errorMessage];
            setMessages(updatedMessages);
            updateState({ messages: updatedMessages, isLoading: false });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-2">Memory Agent</h2>
            <p className="text-gray-400 mb-4">Chat with an AI that remembers the entire conversation for better contextual understanding.</p>
            <div className="flex-grow bg-gray-800 rounded-t-lg p-4 border border-b-0 border-gray-700 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map(msg => (
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
                    onChange={e => handleInputChange(e.target.value)}
                    placeholder="Start a conversation..."
                    className="w-full p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                />
            </form>
        </div>
    );
};

export default MemoryAgentView;
