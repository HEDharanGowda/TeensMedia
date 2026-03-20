
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import './Auth.css';

const Motion = motion;

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentBg, setCurrentBg] = useState(0);
  const navigate = useNavigate();

  // 3D wallpaper backgrounds array
  const backgrounds = [
    'https://imgs.search.brave.com/y2Kac64YsDcZa2KG7KaL0RKM5UZLmkCcV11ITibLgyM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA3LzEyLzQ2LzE5/LzM2MF9GXzcxMjQ2/MTkwMF9MS2NJZW5C/Qmk1TWRLNnoxUVVj/SUNFbk9CMVJORUJZ/Qy5qcGc', // Abstract 3D shapes
    'https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2232&auto=format&fit=croph', // Neon 3D landscape
    'https://imgs.search.brave.com/_oWICImyyotLibpK3muLXxv8XdNQx3dhUedbrkJGlF8/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly93d3cu/aXdhbnR3YWxscGFw/ZXIuY28udWsvaW1h/Z2VzL2RjLWNvbWlj/cy1jb2xsZWN0aW9u/LWp1c3RpY2UtbGVh/Z3VlLXN1cGVyLWhl/cm9lcy13YWxscGFw/ZXItcDY5MjYtMTk2/MDJfbWVkaXVtLmpw/Zw', // Floating 3D islands
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2370&auto=format&fit=crop', // Cyberpunk city
    'https://images.unsplash.com/photo-1679678691006-0d9a4a5df3e3?q=80&w=2370&auto=format&fit=crop', // Abstract liquid
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  const particles = useMemo(
    () =>
      Array.from({ length: 10 }, () => ({
        size: Math.random() * 20 + 5,
        left: Math.random() * 100,
        top: Math.random() * 100,
        moveX: Math.random() * 200 - 100,
        moveY: Math.random() * 200 - 100,
        duration: Math.random() * 10 + 5,
      })),
    [],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });

      const data = response.data;
      if (data.success) {
        onLogin(data);
        navigate('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="auth-page"
    >
      <Motion.div
        className="auth-background"
        style={{ backgroundImage: `url(${backgrounds[currentBg]})` }}
        key={currentBg}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      <div className="auth-overlay" />

      {particles.map((particle, i) => (
        <Motion.div
          key={i}
          className="auth-particle"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            x: [0, particle.moveX],
            y: [0, particle.moveY],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        />
      ))}

      <Motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="auth-card"
      >
        <div className="auth-header">
          <Motion.h1 
            className="auth-title"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Welcome Back Champ! 
          </Motion.h1>
          <Motion.p 
            className="auth-subtitle"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Ready to continue your adventure?
          </Motion.p>
        </div>

        {error && (
          <Motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="auth-error"
          >
            ⚠️ {error}
          </Motion.div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <Motion.div whileHover={{ scale: 1.02 }}>
            <input
              type="text"
              placeholder="🦸 Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input auth-input--primary"
              required
            />
          </Motion.div>

          <Motion.div whileHover={{ scale: 1.02 }}>
            <input
              type="password"
              placeholder="🔐 Enter Secret Code"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input auth-input--accent"
              required
            />
          </Motion.div>

          <Motion.button 
            type="submit" 
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="auth-submit auth-submit--login"
          >
            {isLoading ? (
              <Motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🔒
              </Motion.span>
            ) : (
              <>
                Continue Adventure!
                <Motion.span 
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  ⚡
                </Motion.span>
              </>
            )}
          </Motion.button>
        </form>

        <Motion.p 
          className="auth-switch"
          whileHover={{ scale: 1.05 }}
        >
          New to our world?{' '}
          <span 
            onClick={() => navigate('/register')}
            className="auth-switch-link"
          >
            Join the adventure! 🎉
          </span>
        </Motion.p>
      </Motion.div>
    </Motion.div>
  );
};

export default Login;