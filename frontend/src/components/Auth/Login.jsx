
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Auth.css';

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
  }, []);

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
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (data.success) {
        onLogin(data);
        navigate('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="auth-page"
    >
      <motion.div
        className="auth-background"
        style={{ backgroundImage: `url(${backgrounds[currentBg]})` }}
        key={currentBg}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      <div className="auth-overlay" />

      {particles.map((particle, i) => (
        <motion.div
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

      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="auth-card"
      >
        <div className="auth-header">
          <motion.h1 
            className="auth-title"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Welcome Back Champ! 
          </motion.h1>
          <motion.p 
            className="auth-subtitle"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Ready to continue your adventure?
          </motion.p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="auth-error"
          >
            ⚠️ {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <motion.div whileHover={{ scale: 1.02 }}>
            <input
              type="text"
              placeholder="🦸 Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input auth-input--primary"
              required
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <input
              type="password"
              placeholder="🔐 Enter Secret Code"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input auth-input--accent"
              required
            />
          </motion.div>

          <motion.button 
            type="submit" 
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="auth-submit auth-submit--login"
          >
            {isLoading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🔒
              </motion.span>
            ) : (
              <>
                Continue Adventure!
                <motion.span 
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  ⚡
                </motion.span>
              </>
            )}
          </motion.button>
        </form>

        <motion.p 
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
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default Login;