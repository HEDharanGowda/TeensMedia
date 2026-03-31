import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaComment, FaPaperPlane, FaBookmark, FaEllipsisV, FaTrash } from 'react-icons/fa';
import api, { getAuthHeaders } from '../services/api';
import './Post.css';

const Motion = motion;

const Post = ({ post, token, currentUser, onPostDeleted }) => {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [postMenuPosition, setPostMenuPosition] = useState({ top: 0, left: 0 });
  const [deletingPost, setDeletingPost] = useState(false);
  const menuRef = useRef(null);
  const postMenuRef = useRef(null);

  const isOwnPost = currentUser?.userId === post.userId;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
      if (postMenuRef.current && !postMenuRef.current.contains(event.target)) {
        setShowPostMenu(false);
      }
    };

    if (openMenuId || showPostMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId, showPostMenu]);

  const handleLike = async () => {
    if (!token) return;

    try {
      if (liked) {
        const response = await api.delete(`/posts/${post.id}/like`, {
          headers: getAuthHeaders(token),
        });
        setLiked(false);
        setLikesCount(response.data.likesCount);
      } else {
        const response = await api.post(`/posts/${post.id}/like`, {}, {
          headers: getAuthHeaders(token),
        });
        setLiked(true);
        setLikesCount(response.data.likesCount);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await api.get(`/posts/${post.id}/comments`);
      setComments(response.data.comments);
      setCommentsCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    if (showComments) {
      setShowComments(false);
      setOpenMenuId(null);
    } else {
      setShowComments(true);
      fetchComments();
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !token || submittingComment) return;

    try {
      setSubmittingComment(true);
      const response = await api.post(
        `/posts/${post.id}/comments`,
        { text: newComment.trim() },
        { headers: getAuthHeaders(token) }
      );
      setComments([...comments, response.data]);
      setCommentsCount(prev => prev + 1);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!token) return;

    try {
      await api.delete(`/posts/comments/${commentId}`, {
        headers: getAuthHeaders(token),
      });
      setComments(comments.filter(c => c.commentId !== commentId));
      setCommentsCount(prev => prev - 1);
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const toggleMenu = (commentId, event) => {
    if (openMenuId === commentId) {
      setOpenMenuId(null);
    } else {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 100,
      });
      setOpenMenuId(commentId);
    }
  };

  const togglePostMenu = (event) => {
    if (showPostMenu) {
      setShowPostMenu(false);
    } else {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      setPostMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 120,
      });
      setShowPostMenu(true);
    }
  };

  const handleDeletePost = async () => {
    if (!token || deletingPost) return;

    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      setShowPostMenu(false);
      return;
    }

    try {
      setDeletingPost(true);
      await api.delete(`/posts/${post.id}`, {
        headers: getAuthHeaders(token),
      });
      setShowPostMenu(false);
      onPostDeleted?.(post.id);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setDeletingPost(false);
    }
  };

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
            {String.fromCodePoint(0x1F5BC)}
          </div>
        )}
      </div>

      <div className="post-actions-row">
        <div className="post-actions-left">
          <Motion.button
            whileTap={{ scale: 0.9 }}
            className={`post-action-button ${liked ? 'post-action-button--liked' : ''}`}
            onClick={handleLike}
          >
            {liked ? <FaHeart /> : <FaRegHeart />}
          </Motion.button>
          <Motion.button
            whileTap={{ scale: 0.9 }}
            className={`post-action-button ${showComments ? 'post-action-button--active' : ''}`}
            onClick={handleToggleComments}
          >
            <FaComment />
          </Motion.button>
          <Motion.button whileTap={{ scale: 0.9 }} className="post-action-button">
            <FaPaperPlane />
          </Motion.button>
        </div>
        <div className="post-actions-right">
          <Motion.button whileTap={{ scale: 0.9 }} className="post-action-button">
            <FaBookmark />
          </Motion.button>
          {isOwnPost && (
            <div className="post-menu-wrapper" ref={postMenuRef}>
              <Motion.button
                whileTap={{ scale: 0.9 }}
                className="post-action-button"
                onClick={togglePostMenu}
              >
                <FaEllipsisV />
              </Motion.button>
              {showPostMenu && (
                <div
                  className="post-menu"
                  style={{
                    position: 'fixed',
                    top: postMenuPosition.top,
                    left: postMenuPosition.left,
                  }}
                >
                  <button
                    className="post-menu-item post-menu-item--delete"
                    onClick={handleDeletePost}
                    disabled={deletingPost}
                  >
                    <FaTrash size={14} />
                    <span>{deletingPost ? 'Deleting...' : 'Delete Post'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="post-likes">
        {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
      </div>

      {post.caption && (
        <div className="post-caption">
          {post.caption}
        </div>
      )}

      {commentsCount > 0 && !showComments && (
        <button className="post-view-comments" onClick={handleToggleComments}>
          View all {commentsCount} comment{commentsCount !== 1 ? 's' : ''}
        </button>
      )}

      {showComments && (
        <div className="post-comments-section">
          <div className="post-comments-header">
            <span>Comments ({commentsCount})</span>
          </div>

          <div className="post-comments-list">
            {loadingComments ? (
              <div className="post-comments-loading">Loading comments...</div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.commentId} className="post-comment">
                  <div className="post-comment-content">
                    <span className="post-comment-username">{comment.username}</span>
                    <span className="post-comment-text">{comment.text}</span>
                  </div>
                  {currentUser?.userId === comment.userId && (
                    <div className="post-comment-menu-wrapper" ref={openMenuId === comment.commentId ? menuRef : null}>
                      <button
                        className="post-comment-menu-btn"
                        onClick={(e) => toggleMenu(comment.commentId, e)}
                      >
                        <FaEllipsisV size={12} />
                      </button>
                      {openMenuId === comment.commentId && (
                        <div
                          className="post-comment-menu"
                          style={{
                            position: 'fixed',
                            top: menuPosition.top,
                            left: menuPosition.left,
                          }}
                        >
                          <button
                            className="post-comment-menu-item post-comment-menu-item--delete"
                            onClick={() => handleDeleteComment(comment.commentId)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="post-comments-empty">No comments yet. Be the first!</div>
            )}
          </div>

          <form className="post-comment-form" onSubmit={handleSubmitComment}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={500}
              className="post-comment-input"
            />
            <button
              type="submit"
              className="post-comment-submit"
              disabled={!newComment.trim() || submittingComment}
            >
              Post
            </button>
          </form>
        </div>
      )}
    </Motion.div>
  );
};

export default Post;
