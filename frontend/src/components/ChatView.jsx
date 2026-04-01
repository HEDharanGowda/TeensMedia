import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import api, { getAuthHeaders } from '../services/api';
import { connectSocket, joinConversation, leaveConversation, onNewMessage, offNewMessage } from '../services/socket';
import './ChatView.css';

const Motion = motion;

const ChatView = ({ token, currentUser }) => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const addMessage = useCallback((message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.messageId === message.messageId)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  useEffect(() => {
    if (currentUser?.userId) {
      connectSocket(currentUser.userId);
    }
    fetchConversation();
    fetchMessages();
    joinConversation(conversationId);

    // Listen for new messages
    const handleNewMessage = (message) => {
      if (message.conversationId === conversationId) {
        addMessage(message);
      }
    };

    onNewMessage(handleNewMessage);

    return () => {
      leaveConversation(conversationId);
      offNewMessage(handleNewMessage);
    };
  }, [conversationId, currentUser?.userId, addMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async () => {
    try {
      const response = await api.get('/messages/conversations', {
        headers: getAuthHeaders(token),
      });
      const conv = response.data.find((c) => c.conversationId === conversationId);
      if (conv) {
        setOtherUser(conv.otherUser);
      }
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/conversations/${conversationId}/messages`, {
        headers: getAuthHeaders(token),
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const response = await api.post(
        `/messages/conversations/${conversationId}/messages`,
        { text: messageText },
        { headers: getAuthHeaders(token) }
      );

      if (response?.data) {
        addMessage(response.data);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((msg) => {
      const date = new Date(msg.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="chat-loading">
        <Motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          💬
        </Motion.div>
        <p>Loading chat...</p>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="chat-view">
      <div className="chat-header">
        <button onClick={() => navigate('/messages')} className="chat-back-button">
          <FaArrowLeft />
        </button>
        <div className="chat-header-info">
          <div className="chat-avatar">👤</div>
          <span className="chat-username">{otherUser?.username || 'User'}</span>
        </div>
      </div>

      <div className="chat-messages">
        {Object.keys(messageGroups).map((date) => (
          <div key={date}>
            <div className="chat-date-divider">
              <span>{formatDate(date)}</span>
            </div>
            {messageGroups[date].map((msg) => {
              const isOwn = msg.senderId === currentUser?.userId;
              return (
                <Motion.div
                  key={msg.messageId}
                  className={`chat-message ${isOwn ? 'chat-message-own' : 'chat-message-other'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="chat-message-bubble">
                    <p className="chat-message-text">{msg.text}</p>
                    <span className="chat-message-time">{formatTime(msg.createdAt)}</span>
                  </div>
                </Motion.div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-container">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="chat-input"
          disabled={sending}
        />
        <Motion.button
          type="submit"
          className="chat-send-button"
          disabled={!newMessage.trim() || sending}
          whileTap={{ scale: 0.95 }}
        >
          <FaPaperPlane />
        </Motion.button>
      </form>
    </div>
  );
};

export default ChatView;
