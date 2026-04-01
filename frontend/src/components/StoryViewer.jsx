import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaChevronLeft, FaChevronRight, FaTrash } from 'react-icons/fa';
import api, { getAuthHeaders } from '../services/api';
import './StoryViewer.css';

const Motion = motion;

const StoryViewer = ({
  userStory,
  onClose,
  allStories,
  currentIndex,
  token,
  currentUserId,
  onStoriesChanged,
}) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentUserIndex, setCurrentUserIndex] = useState(currentIndex || 0);
  const [progress, setProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const resolveAvatarSrc = (value) => {
    if (!value) return null;
    if (value.startsWith('http')) return value;
    if (value.startsWith('data:')) return value;
    return `data:image/jpeg;base64,${value}`;
  };

  const currentUserStory = allStories[currentUserIndex];
  const stories = currentUserStory?.stories || userStory?.stories || [];
  const username = currentUserStory?.username || userStory?.username;
  const avatarSrc = resolveAvatarSrc(currentUserStory?.profilePicture || userStory?.profilePicture);
  const isOwnStoryGroup = currentUserStory?.userId === currentUserId;

  useEffect(() => {
    setCurrentStoryIndex(0);
  }, [currentUserIndex]);

  useEffect(() => {
    setProgress(0);
    const duration = 5000; // 5 seconds per story
    const interval = 50; // Update every 50ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next story
          if (currentStoryIndex < stories.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1);
          } else if (currentUserIndex < allStories.length - 1) {
            // Move to next user's stories
            setCurrentUserIndex(currentUserIndex + 1);
          } else {
            // All stories finished
            onClose();
          }
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentStoryIndex, currentUserIndex, stories.length, allStories.length, onClose]);

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(currentUserIndex - 1);
      // Will be set to 0 by the useEffect
    }
  };

  const handleNext = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else if (currentUserIndex < allStories.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
    } else {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!stories.length) return null;

  const currentStory = stories[currentStoryIndex];

  const handleDeleteStory = async () => {
    if (!token || !currentStory?.id || deleting) return;

    const confirmed = window.confirm('Delete this story now?');
    if (!confirmed) return;

    setDeleting(true);
    try {
      await api.delete(`/stories/${currentStory.id}`, {
        headers: getAuthHeaders(token),
      });

      await onStoriesChanged?.();

      const hasMoreStoriesInUser = stories.length > 1;
      const hasMoreUsers = currentUserIndex < allStories.length - 1;

      if (hasMoreStoriesInUser) {
        if (currentStoryIndex >= stories.length - 1) {
          setCurrentStoryIndex(stories.length - 2);
        }
        return;
      }

      if (hasMoreUsers) {
        setCurrentUserIndex(currentUserIndex + 1);
        setCurrentStoryIndex(0);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete story:', error);
      window.alert(error?.response?.data?.message || 'Failed to delete story');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <Motion.div
        className="story-viewer-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <Motion.div
          className="story-viewer-container"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bars */}
          <div className="story-progress-bars">
            {stories.map((_, index) => (
              <div key={index} className="story-progress-bar-container">
                <div
                  className="story-progress-bar-fill"
                  style={{
                    width:
                      index < currentStoryIndex
                        ? '100%'
                        : index === currentStoryIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="story-viewer-header">
            <div className="story-viewer-user">
              <div className="story-viewer-avatar">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={`${username}'s avatar`} className="story-viewer-avatar-image" />
                ) : (
                  '👤'
                )}
              </div>
              <span className="story-viewer-username">{username}</span>
              <span className="story-viewer-time">
                {formatTimeAgo(currentStory.createdAt)}
              </span>
            </div>
            <div className="story-viewer-header-actions">
              {isOwnStoryGroup && (
                <button
                  onClick={handleDeleteStory}
                  className="story-viewer-delete"
                  disabled={deleting}
                  aria-label="Delete story"
                >
                  <FaTrash />
                </button>
              )}
              <button onClick={onClose} className="story-viewer-close" aria-label="Close story viewer">
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Story content */}
          <div className="story-viewer-content">
            <img
              src={currentStory.imageUrl || (currentStory.imageBase64 ? `data:image/jpeg;base64,${currentStory.imageBase64}` : '')}
              alt="Story"
              className="story-viewer-image"
            />

            {/* Navigation */}
            {(currentStoryIndex > 0 || currentUserIndex > 0) && (
              <button onClick={handlePrevious} className="story-nav story-nav-prev">
                <FaChevronLeft />
              </button>
            )}

            {(currentStoryIndex < stories.length - 1 ||
              currentUserIndex < allStories.length - 1) && (
              <button onClick={handleNext} className="story-nav story-nav-next">
                <FaChevronRight />
              </button>
            )}
          </div>
        </Motion.div>
      </Motion.div>
    </AnimatePresence>
  );
};

function formatTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default StoryViewer;
