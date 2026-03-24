import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Feed from './components/Feed';
import CreatePost from './components/CreatePost';
import Profile from './components/Profile';
import Messages from './components/Messages';
import ChatView from './components/ChatView';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import api, { getAuthHeaders } from './services/api';
import './App.css';

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('instasafe_user', JSON.stringify(userData));
    checkBanStatus(userData.token);
  };

  const handleProfilePictureChange = (profilePicture) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextUser = { ...prev, profilePicture };
      localStorage.setItem('instasafe_user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('instasafe_user');
    window.location.href = '/login'; 
  };

  const checkBanStatus = useCallback(async (token) => {
    try {
      const response = await api.get('/user/status', {
        headers: getAuthHeaders(token),
      });

      if (response.data.banned) {
        handleLogout();
        window.location.href = '/login?banned=true';
      }
    } catch (error) {
      console.error('Error checking ban status:', error);
    }
  }, []);

  const fetchPosts = useCallback((userId) => {
    const url = userId ? `/posts?userId=${userId}` : '/posts';
    api.get(url)
      .then(res => setPosts(res.data))
      .catch(err => console.error('Error fetching posts:', err));
  }, []);

  const handlePostSuccess = (status) => {
    if (status === 'BANNED') {
      handleLogout();
      return;
    }

    fetchPosts(user?.userId);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('instasafe_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);

      if (!userData?.token) {
        localStorage.removeItem('instasafe_user');
        setLoading(false);
        return;
      }

      setUser(userData);
      checkBanStatus(userData.token);

      fetchPosts(userData.userId);
    }

    setLoading(false); // done checking localStorage

    const interval = setInterval(() => {
      if (user?.token) {
        checkBanStatus(user.token);
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [checkBanStatus, user?.token, fetchPosts]);

  // While checking user, show nothing (or loader)
  if (loading) {
    return null; // or <div>Loading...</div>
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onRegister={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  const isChatView = location.pathname.match(/^\/messages\/.+$/);
  const isProfileView = location.pathname.match(/^\/profile/);

  return (
    <>
      {!isChatView && !isProfileView && <Header />}
      <div className={`content-container ${isChatView || isProfileView ? 'content-container--no-header' : ''}`}>
        <Routes>
          <Route path="/" element={<Feed posts={posts} token={user.token} currentUser={user} />} />
          <Route path="/search" element={<Navigate to="/" />} />
          <Route path="/activity" element={<Navigate to="/" />} />
          <Route
            path="/create"
            element={
              <CreatePost
                token={user.token}
                onPostSuccess={handlePostSuccess}
                onBanDetected={handleLogout}
              />
            }
          />
          <Route
            path="/messages"
            element={
              <Messages
                token={user.token}
                currentUser={user}
              />
            }
          />
          <Route
            path="/messages/:conversationId"
            element={
              <ChatView
                token={user.token}
                currentUser={user}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <Profile
                token={user.token}
                currentUser={user}
                onLogout={handleLogout}
                onProfilePictureChange={handleProfilePictureChange}
              />
            }
          />
          <Route
            path="/profile/:username"
            element={
              <Profile
                token={user.token}
                currentUser={user}
                onLogout={handleLogout}
                onProfilePictureChange={handleProfilePictureChange}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      {!isChatView && <BottomNav currentUser={user} />}
    </>
  );
}

export default AppWrapper;
