import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaEllipsisV,
  FaImages,
  FaExclamationTriangle,
  FaUserPlus,
  FaUserMinus,
  FaSignOutAlt,
  FaComment,
  FaTh,
  FaCamera
} from 'react-icons/fa';
import api, { getAuthHeaders } from '../services/api';
import './Profile.css';

const Motion = motion;

const Profile = ({ token, currentUser, onLogout, onProfilePictureChange }) => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef(null);

  const isOwnProfile = !username || username === currentUser?.username;

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const resolveAvatarSrc = (value) => {
    if (!value) return null;
    return value.startsWith('data:') ? value : `data:image/jpeg;base64,${value}`;
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = username
        ? `/user/${username}/profile`
        : '/user/profile';

      const response = await api.get(endpoint, {
        headers: getAuthHeaders(token)
      });

      setProfile(response.data);
      setFollowersCount(response.data.user.followersCount || 0);
      setFollowingCount(response.data.user.followingCount || 0);
      setIsFollowing(response.data.user.isFollowing || false);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('User not found');
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile?.user?.userId || followLoading) return;

    setFollowLoading(true);
    try {
      const response = await api.post(
        `/users/${profile.user.userId}/follow`,
        {},
        { headers: getAuthHeaders(token) }
      );

      setIsFollowing(true);
      setFollowersCount(response.data.followersCount);
    } catch (err) {
      console.error('Failed to follow:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!profile?.user?.userId || followLoading) return;

    setFollowLoading(true);
    try {
      const response = await api.delete(
        `/users/${profile.user.userId}/follow`,
        { headers: getAuthHeaders(token) }
      );

      setIsFollowing(false);
      setFollowersCount(response.data.followersCount);
    } catch (err) {
      console.error('Failed to unfollow:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessageClick = () => {
    // Navigate to messages with this user
    navigate('/messages');
  };

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    setAvatarError('');

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image should be smaller than 5MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result;
      const base64String = typeof dataUrl === 'string' ? dataUrl.split(',')[1] || dataUrl : '';

      if (!base64String) {
        setAvatarError('Could not read image data.');
        return;
      }

      setAvatarUploading(true);
      try {
        const response = await api.patch(
          '/user/profile-picture',
          { profilePicture: base64String },
          { headers: getAuthHeaders(token) },
        );

        const normalized = resolveAvatarSrc(response.data.profilePicture);

        setProfile((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            user: {
              ...prev.user,
              profilePicture: normalized,
            },
          };
        });

        onProfilePictureChange?.(normalized);

        const stored = localStorage.getItem('instasafe_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.profilePicture = normalized;
          localStorage.setItem('instasafe_user', JSON.stringify(parsed));
        }
      } catch (err) {
        setAvatarError(err.response?.data?.message || 'Failed to update profile picture.');
      } finally {
        setAvatarUploading(false);
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      setAvatarError('Unable to read the selected file.');
    };

    reader.readAsDataURL(file);
  };

  const handlePostClick = (post) => {
    // Future enhancement: open post in modal
    console.log('Post clicked:', post);
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <Motion.div
          className="profile-loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          ⚡
        </Motion.div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Motion.div
        className="profile-error"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <FaExclamationTriangle size={48} />
        <h2>{error}</h2>
        <div className="profile-error-buttons">
          <button onClick={() => navigate('/')} className="profile-error-button">
            Go to Feed
          </button>
          {isOwnProfile && onLogout && (
            <button onClick={onLogout} className="profile-error-logout-button">
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          )}
        </div>
      </Motion.div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <Motion.div
      className="profile-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top Navigation Bar */}
      <div className="profile-nav">
        <button onClick={() => navigate(-1)} className="profile-nav-back">
          <FaArrowLeft />
        </button>
        <span className="profile-nav-username">{profile.user.username}</span>
        <button className="profile-nav-menu">
          <FaEllipsisV />
        </button>
      </div>

      {/* Profile Info Section */}
      <div className="profile-content">
        {/* Avatar */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              {resolveAvatarSrc(profile.user.profilePicture) ? (
                <img
                  src={resolveAvatarSrc(profile.user.profilePicture)}
                  alt={`${profile.user.username}'s avatar`}
                  className="profile-avatar-image"
                />
              ) : (
                <span className="profile-avatar-icon">👤</span>
              )}
              {isOwnProfile && (
                <button
                  type="button"
                  className="profile-avatar-edit"
                  onClick={handleAvatarButtonClick}
                  disabled={avatarUploading}
                >
                  <FaCamera />
                  <span>{avatarUploading ? 'Saving...' : 'Update photo'}</span>
                </button>
              )}
              {isOwnProfile && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="profile-avatar-input"
                  onChange={handleAvatarChange}
                />
              )}
            </div>
          </div>
          <h2 className="profile-display-name">{profile.user.username}</h2>
          {avatarError && <p className="profile-avatar-error">{avatarError}</p>}
        </div>

        {/* Stats */}
        <div className="profile-stats-row">
          <div className="profile-stat-item">
            <span className="profile-stat-number">{profile.user.postCount}</span>
            <span className="profile-stat-label">Posts</span>
          </div>
          <div className="profile-stat-item">
            <span className="profile-stat-number">{followersCount}</span>
            <span className="profile-stat-label">Followers</span>
          </div>
          <div className="profile-stat-item">
            <span className="profile-stat-number">{followingCount}</span>
            <span className="profile-stat-label">Following</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions-row">
          {isOwnProfile ? (
            <>
              <button className="profile-action-btn profile-action-btn--primary">
                Edit Profile
              </button>
              <button className="profile-action-btn" onClick={onLogout}>
                <FaSignOutAlt />
              </button>
            </>
          ) : (
            <>
              <button
                className={`profile-action-btn ${
                  isFollowing ? 'profile-action-btn--secondary' : 'profile-action-btn--primary'
                }`}
                onClick={isFollowing ? handleUnfollow : handleFollow}
                disabled={followLoading}
              >
                {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
              </button>
              <button className="profile-action-btn profile-action-btn--secondary" onClick={handleMessageClick}>
                Message
              </button>
              <button className="profile-action-btn">
                <FaUserPlus />
              </button>
            </>
          )}
        </div>

        {/* Violations Badge (if any) */}
        {isOwnProfile && profile.user.violations !== undefined && profile.user.violations > 0 && (
          <div className="profile-violations-badge">
            <FaExclamationTriangle />
            <span>
              {profile.user.violations} violation{profile.user.violations !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Posts Grid Header */}
      <div className="profile-tabs">
        <button className="profile-tab profile-tab--active">
          <FaTh />
        </button>
      </div>

      {/* Posts Grid */}
      <div className="profile-posts-section">
        {profile.posts.length > 0 ? (
          <div className="profile-posts-grid">
            {profile.posts.map((post, index) => (
              <Motion.div
                key={post.id}
                className="profile-post-item"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03, duration: 0.2 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handlePostClick(post)}
              >
                <img
                  src={`data:image/jpeg;base64,${post.imageBase64}`}
                  alt={post.caption || 'Post'}
                  className="profile-post-image"
                />
              </Motion.div>
            ))}
          </div>
        ) : (
          <Motion.div
            className="profile-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="profile-empty-icon">
              <FaImages size={64} />
            </div>
            <h3 className="profile-empty-title">
              {isOwnProfile ? 'Share Your First Post!' : 'No Posts Yet'}
            </h3>
            <p className="profile-empty-text">
              {isOwnProfile
                ? 'When you share photos, they\'ll appear here.'
                : `${profile.user.username} hasn't shared any posts yet.`}
            </p>
          </Motion.div>
        )}
      </div>
    </Motion.div>
  );
};

export default Profile;
