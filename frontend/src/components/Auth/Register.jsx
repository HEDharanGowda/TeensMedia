
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import './Auth.css';

const Motion = motion;

const Register = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentBg, setCurrentBg] = useState(0);
  const navigate = useNavigate();

  // 3D wallpaper backgrounds array
  const backgrounds = [
    'https://imgs.search.brave.com/0d-A1BAGHfs_OxjHSfs9TipPo1ildiQ6NIWutPXS0xU/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAzLzA4LzIzLzEx/LzM2MF9GXzMwODIz/MTE1Ml85T2RDVE5S/dUVTY0t6ZU13WlFi/VU94QkhxMjM4Nnlr/NS5qcGc', // Abstract 3D shapes
    'https://imgs.search.brave.com/NE8-xi-vKZiO-tzhVE04DRZ79y4WK36gRQDc_uZewwg/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzFnYVpsTzBXdkwu/anBn', // Neon 3D landscape
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2370&auto=format&fit=crop', // Floating 3D islands
    'https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2232&auto=format&fit=crop', // Cyberpunk city
    'https://imgs.search.brave.com/Cwa31Rb89Pem8dEfrHTltJX0KM4_JL5ygSTM6UGHkJY/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly93d3cu/d2FsbHBhcGVyLXVr/LmNvbS9jZG4vc2hv/cC9maWxlcy9NYXJ2/ZWwtQ29taWMtU3Ry/aXAtYnktTXVyaXZh/bWFydmVsLWNvbWlj/LXN0cmlwLW0tMTU5/NTAxLmpwZz92PTE3/MTE0NTAwNjgmd2lk/dGg9ODAw', // Abstract liquid
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
      const response = await api.post('/auth/register', {
        username,
        password,
      });

      const data = response.data;
      if (data.success) {
        onRegister(data);
        navigate('/');
      } else {
        setError(data.message || 'Registration failed');
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
            Teen's Media
           </Motion.h1>
          <Motion.p 
            className="auth-subtitle"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Create your new profile!
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
              placeholder="🦸 Your Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input auth-input--primary"
              required
            />
          </Motion.div>

          <Motion.div whileHover={{ scale: 1.02 }}>
            <input
              type="password"
              placeholder="🔐 Secret Power Code"
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
            className="auth-submit auth-submit--register"
          >
            {isLoading ? (
              <Motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🌀
              </Motion.span>
            ) : (
              <>
                Begin Journey!
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
          Already have an Account?{' '}
          <span 
            onClick={() => navigate('/login')}
            className="auth-switch-link"
          >
           Login 
          </span>
        </Motion.p>
      </Motion.div>
    </Motion.div>
  );
};

export default Register;