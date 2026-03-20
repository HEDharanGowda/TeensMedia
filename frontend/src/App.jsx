import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Feed from './components/Feed';
import CreatePost from './components/CreatePost';
import Navbar from './components/Navbar';
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
  const [loading, setLoading] = useState(true); // New loading state

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('instasafe_user', JSON.stringify(userData));
    checkBanStatus(userData.token);
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

  const handlePostSuccess = (status) => {
    if (status === 'BANNED') {
      handleLogout();
      return;
    }

    api.get('/posts')
      .then(res => setPosts(res.data))
      .catch(err => console.error('Error fetching posts:', err));
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

      api.get('/posts')
        .then(res => setPosts(res.data))
        .catch(err => console.error('Failed to fetch posts:', err));
    }
    
    setLoading(false); // done checking localStorage

    const interval = setInterval(() => {
      if (user?.token) {
        checkBanStatus(user.token);
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [checkBanStatus, user?.token]);

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

  return (
    <>
      <Navbar onLogout={handleLogout} />
      <div className="content-container">
        <Routes>
          <Route path="/" element={<Feed posts={posts} />} />
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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

export default AppWrapper;
