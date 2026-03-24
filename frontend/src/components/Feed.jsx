
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Post from './Post';
import AddStory from './AddStory';
import StoryViewer from './StoryViewer';
import { motion } from 'framer-motion';
import { FaPlus } from 'react-icons/fa';
import api, { getAuthHeaders } from '../services/api';
import './Feed.css';

const Motion = motion;

const Feed = ({ posts, token, currentUser }) => {
  const [stories, setStories] = useState([]);
  const [showAddStory, setShowAddStory] = useState(false);
  const [viewingStory, setViewingStory] = useState(null);
  const [viewingStoryIndex, setViewingStoryIndex] = useState(0);

  useEffect(() => {
    // Clear stories when user changes to avoid showing stale data
    setStories([]);
    fetchStories();
  }, [currentUser?.username]);

  const fetchStories = async () => {
    try {
      const response = await api.get('/stories');
      setStories(response.data);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    }
  };

  const handleStoryCreated = () => {
    fetchStories();
  };

  const handleStoryClick = (userStory, index) => {
    setViewingStory(userStory);
    setViewingStoryIndex(index);
  };

  const handleCloseViewer = () => {
    setViewingStory(null);
    setViewingStoryIndex(0);
  };

  // Check if current user has a story
  const currentUserStory = stories.find(s => s.username === currentUser?.username);

  return (
    <div className="feed-page">
      <Motion.div className="stories-container">
        {/* Current user's story / Add story */}
        <Motion.div
          key={`current-user-${currentUser?.username || 'guest'}`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="story-item"
          onClick={() => {
            if (currentUserStory) {
              handleStoryClick(currentUserStory, stories.findIndex(s => s.username === currentUser?.username));
            } else {
              setShowAddStory(true);
            }
          }}
        >
          <div className={currentUserStory ? 'story-ring story-ring--active' : 'story-ring'}>
            <div className="story-ring__inner">
              <div className="story-image story-image-placeholder">
                {currentUserStory ? '👤' : <FaPlus size={24} />}
              </div>
            </div>
          </div>
          <span className="story-username">
            {currentUserStory ? 'Your story' : 'Add story'}
          </span>
        </Motion.div>

        {/* Other users' stories */}
        {stories
          .filter(story => story.username !== currentUser?.username)
          .map((userStory) => (
            <Motion.div
              key={userStory.userId}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="story-item"
              onClick={() => handleStoryClick(userStory, stories.findIndex(s => s.userId === userStory.userId))}
            >
              <div className="story-ring story-ring--active">
                <div className="story-ring__inner">
                  <div className="story-image story-image-placeholder">
                    👤
                  </div>
                </div>
              </div>
              <span className="story-username">
                {userStory.username}
              </span>
            </Motion.div>
          ))}
      </Motion.div>

      <div className="feed-posts-grid">
        {posts.length > 0 ? (
          posts.map((post) => (
            <article key={post.timestamp} className="feed-post-card">
              <div className="feed-post-header">
                <div className="feed-post-user">
                  <div className="feed-post-avatar">
                    <span className="feed-post-avatar-icon">👤</span>
                  </div>
                  {post.username ? (
                    <Link
                      to={`/profile/${post.username}`}
                      className="feed-post-username"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {post.username}
                    </Link>
                  ) : (
                    <span className="feed-post-username">
                      anonymous_user
                    </span>
                  )}
                </div>
                <span className="feed-post-time">
                  {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <Post post={post} token={token} currentUser={currentUser} />
            </article>
          ))
        ) : (
          <Motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="feed-empty"
          >
            <div className="feed-empty-icon">📷</div>
            <h2 className="feed-empty-title">
              Share Your First Post!
            </h2>
            <p className="feed-empty-subtitle">
              When you share photos and videos, they'll appear on your profile.
            </p>
          </Motion.div>
        )}
      </div>

      {/* Modals */}
      {showAddStory && (
        <AddStory
          token={token}
          onClose={() => setShowAddStory(false)}
          onStoryCreated={handleStoryCreated}
        />
      )}

      {viewingStory && (
        <StoryViewer
          userStory={viewingStory}
          onClose={handleCloseViewer}
          allStories={stories}
          currentIndex={viewingStoryIndex}
        />
      )}
    </div>
  );
};

export default Feed;