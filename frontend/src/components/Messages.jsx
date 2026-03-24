import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaComment } from 'react-icons/fa';
import api, { getAuthHeaders } from '../services/api';
import { connectSocket, onNewMessage, offNewMessage } from '../services/socket';
import './Messages.css';

const Motion = motion;

const Messages = ({ token, currentUser }) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (currentUser?.userId) {
      connectSocket(currentUser.userId);
    }
    fetchConversations();

    // Listen for new messages
    const handleNewMessage = (message) => {
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.conversationId === message.conversationId) {
            return {
              ...conv,
              lastMessage: {
                text: message.text,
                senderId: message.senderId,
                createdAt: message.createdAt,
              },
              updatedAt: message.createdAt,
            };
          }
          return conv;
        });
        // Sort by most recent
        return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    };

    onNewMessage(handleNewMessage);

    return () => {
      offNewMessage(handleNewMessage);
    };
  }, [currentUser?.userId]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations', {
        headers: getAuthHeaders(token),
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await api.get(`/user/search?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders(token),
      });
      setSearchResults(response.data.filter((u) => u.userId !== currentUser?.userId));
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setSearching(false);
    }
  };

  const startConversation = async (userId) => {
    try {
      const response = await api.post(
        `/messages/conversations/user/${userId}`,
        {},
        { headers: getAuthHeaders(token) }
      );
      navigate(`/messages/${response.data.conversationId}`);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const openConversation = (conversationId) => {
    navigate(`/messages/${conversationId}`);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="messages-loading">
        <Motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          💬
        </Motion.div>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className="messages-search">
        <FaSearch className="messages-search-icon" />
        <input
          type="text"
          placeholder="Search users to message..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="messages-search-input"
        />
      </div>

      {searchQuery.length >= 2 && (
        <div className="messages-search-results">
          {searching ? (
            <div className="messages-searching">Searching...</div>
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => (
              <Motion.div
                key={user.userId}
                className="messages-search-item"
                whileHover={{ backgroundColor: '#f8f9fa' }}
                onClick={() => startConversation(user.userId)}
              >
                <div className="messages-avatar">👤</div>
                <span className="messages-username">{user.username}</span>
              </Motion.div>
            ))
          ) : (
            <div className="messages-no-results">No users found</div>
          )}
        </div>
      )}

      <div className="messages-list">
        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <Motion.div
              key={conv.conversationId}
              className="messages-conversation-item"
              whileHover={{ backgroundColor: '#f8f9fa' }}
              onClick={() => openConversation(conv.conversationId)}
            >
              <div className="messages-avatar">👤</div>
              <div className="messages-conversation-info">
                <div className="messages-conversation-header">
                  <span className="messages-conversation-name">
                    {conv.otherUser?.username || 'Unknown'}
                  </span>
                  <span className="messages-conversation-time">
                    {formatTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                  </span>
                </div>
                <p className="messages-conversation-preview">
                  {conv.lastMessage?.senderId === currentUser?.userId && 'You: '}
                  {conv.lastMessage?.text || 'No messages yet'}
                </p>
              </div>
            </Motion.div>
          ))
        ) : (
          <div className="messages-empty">
            <FaComment size={48} />
            <h3>No conversations yet</h3>
            <p>Search for users above to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
