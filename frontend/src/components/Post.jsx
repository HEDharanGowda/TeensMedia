
import React from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaComment, FaPaperPlane, FaBookmark } from 'react-icons/fa';
import './Post.css';

const Motion = motion;

const Post = ({ post }) => {
  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="post-card"
    >
      <div className="post-media">
        {post.imageBase64 ? (
          <img 
            src={`data:image/jpeg;base64,${post.imageBase64}`}
            alt="Post content"
            className="post-media-image"
          />
        ) : (
          <div className="post-media-empty">
            🖼️
          </div>
        )}
      </div>

      <div className="post-actions-row">
        <div className="post-actions-left">
          <Motion.button whileTap={{ scale: 0.9 }} className="post-action-button">
            <FaHeart />
          </Motion.button>
          <Motion.button whileTap={{ scale: 0.9 }} className="post-action-button">
            <FaComment />
          </Motion.button>
          <Motion.button whileTap={{ scale: 0.9 }} className="post-action-button">
            <FaPaperPlane />
          </Motion.button>
        </div>
        <Motion.button whileTap={{ scale: 0.9 }} className="post-action-button">
          <FaBookmark />
        </Motion.button>
      </div>

      <div className="post-likes">
        {Math.floor(Math.random() * 5000 + 100).toLocaleString()} likes
      </div>

      {post.caption && (
        <div className="post-caption">
          {post.caption}
        </div>
      )}
    </Motion.div>
  );
};

export default Post;