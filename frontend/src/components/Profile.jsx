import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaImages, FaExclamationTriangle, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import api, { getAuthHeaders } from '../services/api';
import './Profile.css';

const Motion = motion;

const Profile = ({ token, currentUser }) => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const isOwnProfile = !username || username === currentUser?.username;

  useEffect(() => {
    fetchProfile();
  }, [username]);

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
        <button onClick={() => navigate('/')} className="profile-error-button">
          Go to Feed
        </button>
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
      transition={{ duration: 0.5 }}
    >
      <Motion.div
        className="profile-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="profile-avatar">
          <span className="profile-avatar-icon">👤</span>
        </div>

        <div className="profile-info">
          <div className="profile-info-top">
            <h1 className="profile-username">{profile.user.username}</h1>
            {isOwnProfile ? (
              <button className="profile-edit-button">
                Edit profile
              </button>
            ) : (
              <Motion.button
                className={`profile-follow-button ${isFollowing ? 'profile-follow-button--following' : ''}`}
                onClick={isFollowing ? handleUnfollow : handleFollow}
                disabled={followLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {followLoading ? (
                  'Loading...'
                ) : isFollowing ? (
                  <>
                    <FaUserMinus />
                    <span>Unfollow</span>
                  </>
                ) : (
                  <>
                    <FaUserPlus />
                    <span>Follow</span>
                  </>
                )}
              </Motion.button>
            )}
          </div>

          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-number">{profile.user.postCount}</span>
              <span className="profile-stat-label">posts</span>
            </div>

            <div className="profile-stat">
              <span className="profile-stat-number">{followersCount}</span>
              <span className="profile-stat-label">followers</span>
            </div>

            <div className="profile-stat">
              <span className="profile-stat-number">{followingCount}</span>
              <span className="profile-stat-label">following</span>
            </div>
          </div>

          <div className="profile-meta">
            <div className="profile-join-date">
              <FaCalendarAlt />
              <span>
                Joined {new Date(profile.user.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>

            {isOwnProfile && profile.user.violations !== undefined && profile.user.violations > 0 && (
              <div className="profile-violations">
                <FaExclamationTriangle />
                <span>
                  {profile.user.violations} violation{profile.user.violations !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </Motion.div>

      <div className="profile-divider"></div>

      <div className="profile-posts-section">
        <div className="profile-posts-header">
          <FaImages />
          <span>POSTS</span>
        </div>

        {profile.posts.length > 0 ? (
          <div className="profile-posts-grid">
            {profile.posts.map((post, index) => (
              <Motion.div
                key={post.id}
                className="profile-post-item"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handlePostClick(post)}
              >
                <img
                  src={`data:image/jpeg;base64,${post.imageBase64}`}
                  alt={post.caption || 'Post'}
                  className="profile-post-image"
                />
                {post.caption && (
                  <div className="profile-post-overlay">
                    <p className="profile-post-caption">{post.caption}</p>
                  </div>
                )}
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
