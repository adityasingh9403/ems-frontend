import React, { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import EmptyState from '../Common/EmptyState';
import LoadingSpinner from '../Common/LoadingSpinner';
import { showToast } from '../../utils/uiHelpers';
import { apiGetChatMessages, apiPostChatMessage } from '../../apiService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

const formatDateSeparator = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const Chat = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Animation Logic
    const [observer, setElements, entries] = useIntersectionObserver({ threshold: 0.1, rootMargin: '0px' });
    useEffect(() => { entries.forEach(e => e.isIntersecting && e.target.classList.add('is-visible')) }, [entries, observer]);
    useEffect(() => { if (!loading) setElements(document.querySelectorAll('.fade-in-section')) }, [setElements, loading]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // This combined useEffect handles both initial data load and real-time connection
    useEffect(() => {
        if (!user) return;

        let connection;

        // 1. Function to load initial chat history
        const loadInitialMessages = async () => {
            setLoading(true);
            try {
                const response = await apiGetChatMessages();
                // This robust line handles both clean arrays and objects with .$values
                const serverMessages = response.data?.$values || (Array.isArray(response.data) ? response.data : []);
                setMessages(serverMessages);
            } catch (error) {
                showToast("Could not fetch chat history.", "error");
            } finally {
                setLoading(false);
            }
        };

        // 2. Function to setup and start SignalR
        const setupSignalR = () => {
            connection = new HubConnectionBuilder()
                .withUrl("http://localhost:5198/chatHub")
                .withAutomaticReconnect()
                .build();

            // Listen for incoming messages from the server
            connection.on("ReceiveMessage", (id, userId, userName, message, createdAt) => {
                const receivedMessage = { id, userId, userName, message, createdAt };
                // Add the new message to the state
                setMessages(prevMessages => [...prevMessages, receivedMessage]);
            });

            // Start the connection
            connection.start()
                .then(() => console.log('SignalR Connected!'))
                .catch(err => console.error('SignalR Connection Error: ', err));
        };

        loadInitialMessages();
        setupSignalR();

        // Cleanup function to stop the connection when the component unmounts
        return () => {
            if (connection) {
                connection.stop();
            }
        };
    }, [user]);

    // Effect to scroll to the bottom when new messages are added
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // This function now ONLY sends the message to the server
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        
        const originalMessage = newMessage;
        setNewMessage('');
        
        try {
            // The SignalR broadcast will handle the UI update for everyone, including the sender
            await apiPostChatMessage({ message: originalMessage });
        } catch (error) {
            showToast("Failed to send message.", "error");
            setNewMessage(originalMessage); // Restore message on failure
        }
    };
    
    const renderMessages = () => {
        let lastDate = null;
        return messages.map((msg) => {
            const msgDate = new Date(msg.createdAt).toDateString();
            let separator = null;
            if (msgDate !== lastDate) {
                separator = (<div key={`sep-${msg.id}`} className="relative text-center my-4"><hr className="absolute top-1/2 left-0 w-full border-slate-200 dark:border-slate-700" /><span className="relative bg-slate-50 dark:bg-slate-900 px-2 text-xs font-semibold text-slate-500">{formatDateSeparator(msg.createdAt)}</span></div>);
                lastDate = msgDate;
            }
            return (
                <React.Fragment key={msg.id}>
                    {separator}
                    <div className={`flex items-end gap-2 ${msg.userId === user.id ? 'justify-end' : 'justify-start'}`}>
                        {msg.userId !== user.id && (<div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-bold text-sm shrink-0">{msg.userName.charAt(0)}</div>)}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-xl ${msg.userId === user.id ? 'bg-teal-500 text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-700 rounded-bl-none'}`}>
                            {msg.userId !== user.id && <p className="text-xs font-bold mb-1 text-teal-600 dark:text-teal-400">{msg.userName}</p>}
                            <p className="text-sm break-words">{msg.message}</p>
                            <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                </React.Fragment>
            );
        });
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 h-full flex flex-col">
            <div className="fade-in-section">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Company Chat</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">A place for company-wide announcements and discussions.</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border mt-6 flex-1 flex flex-col overflow-hidden fade-in-section">
                <div className="p-4 flex-1 overflow-y-auto">
                    {loading ? <LoadingSpinner message="Connecting to chat..."/> : (
                        messages.length > 0 ? renderMessages() : (
                            <EmptyState
                                icon={MessageSquare}
                                title="Start a Conversation"
                                message="Messages sent here are visible to everyone in your company."
                            />
                        )
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 p-2 bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-800 dark:text-slate-200" />
                        <button type="submit" className="bg-teal-600 text-white p-2.5 rounded-lg hover:bg-teal-700 disabled:opacity-50" disabled={!newMessage.trim()}><Send className="w-5 h-5" /></button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;