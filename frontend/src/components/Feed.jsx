
import React from 'react';
import Post from './Post';
import { motion } from 'framer-motion';
import './Feed.css';

const Motion = motion;

const Feed = ({ posts }) => {
  const stories = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    username: ['jake_adventures', 'mikey_arts', 'sophia.creates', 'emily_designs', 'lily.photography'][i],
    image: [
      'https://imgs.search.brave.com/FipXDy51e_mbQUC4HPSUSX37-RA5r8qWhgWSHywtFhY/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA0LzY4LzU2LzIx/LzM2MF9GXzQ2ODU2/MjEyMF9YME4xUEd2/WjdERjdEMmZKdDMw/Sm5XYW9kekx6eW5L/SC5qcGc',
      'https://imgs.search.brave.com/0RqnM31-IeFPLTXeemSChGZtxgO7c4oZ6kYOyvG7puY/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS1waG90by9m/cm9udC12aWV3LXRl/ZW5hZ2VyLXdpdGgt/aGVhZHBob25lc18y/My0yMTQ4NzU4NDk4/LmpwZz9zZW10PWFp/c19oeWJyaWQ',
      'https://imgs.search.brave.com/1PS_4hyz2IrEEpKYAPNH1inAlitr7ZtZmxgYbLj4VUw/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTE1/ODAxNDMwNS9waG90/by9oZWFkc2hvdC1v/Zi1hLXRlZW5hZ2Ut/Ym95LmpwZz9zPTYx/Mng2MTImdz0wJms9/MjAmYz04LUlnSFdK/cW1wVHdTM0JjNmpw/VDVqbkhmTzhiSmlL/V0ExSGZ4MXhJcTNr/PQ',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      'https://imgs.search.brave.com/l43vHtExj7PfsaKp3qWT-5NOX47--m7PPvyC0TmvOGg/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS1waG90by90/ZWVuYWdlLWdpcmwt/d2VhcmluZy1oZWFk/cGhvbmVzXzIzLTIx/NDg2NzI0NjYuanBn/P3NlbXQ9YWlzX2h5/YnJpZA'
    ][i],
    hasStory: Math.random() > 0.3
  }));

  return (
    <div className="feed-page">
      <Motion.div className="stories-container">
        {stories.map((story) => (
          <Motion.div 
            key={story.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="story-item"
          >
            <div className={story.hasStory ? 'story-ring story-ring--active' : 'story-ring'}>
              <div className="story-ring__inner">
                <img 
                  src={story.image} 
                  alt={story.username}
                  className="story-image"
                />
              </div>
            </div>
            <span className="story-username">
              {story.username}
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
                  <span className="feed-post-username">
                    anonymous_user
                  </span>
                </div>
                <span className="feed-post-time">
                  {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <Post post={post} />

              {post.caption && (
                <div className="feed-post-caption">
                  {post.caption}
                </div>
              )}
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
    </div>
  );
};

export default Feed;