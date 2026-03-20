import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUpload, FiAlertCircle } from 'react-icons/fi';
import api, { getAuthHeaders } from '../services/api';
import './CreatePost.css';

const Motion = motion;

const CreatePost = ({ token, onPostSuccess, onBanDetected }) => {
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setError(null);
    const file = e.target.files[0];
    
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      setError('Please upload an image file (JPEG, PNG)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.onerror = () => setError('Failed to read image file');
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!preview) {
      setError('Please upload an image first!');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const base64String = preview.split(',')[1] || preview;
      const response = await api.post('/check', {
        imageBase64: base64String,
      }, {
        headers: getAuthHeaders(token),
      });

      switch (response.data.status) {
        case 'APPROVED':
          onPostSuccess?.();
          navigate('/');
          break;
        case 'REJECTED':
          setError(`Post rejected: ${response.data.message}`);
          break;
        case 'BANNED':
          onBanDetected?.();
          onPostSuccess?.('BANNED');
          return;
        case 'FLAGGED':
          setError('Post flagged for manual review');
          break;
        default:
          setError('Unexpected response from server');
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      if (error.response?.data?.status === 'BANNED') {
        onBanDetected?.();
        return;
      }
      
      setError(error.response?.data?.message || 
              error.message || 
              'Failed to upload post');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="create-post-page"
    >
      <Motion.div className="create-post-card">
        <h1 className="create-post-title">
          Add Post
        </h1>

        {error && (
          <Motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="create-post-error"
          >
            <FiAlertCircle size={20} />
            <span>{error}</span>
          </Motion.div>
        )}

        <div className="upload-area">
          <input
            type="file"
            id="post-upload"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/jpeg,image/png"
            className="create-post-input"
          />
          <Motion.label 
            htmlFor="post-upload" 
            className="upload-label"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ borderColor: preview ? '#74b9ff' : '#a55eea' }}
          >
            {preview ? (
              <Motion.img 
                src={preview} 
                alt="Preview" 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="create-post-preview"
              />
            ) : (
              <Motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="create-post-placeholder"
              >
                <div className="create-post-placeholder-icon-wrapper">
                  <FiUpload size={40} color="white" />
                </div>
                <p className="create-post-placeholder-text">
                  Add Your Art or Pictures!<br />
                  Let's inspire the world! 🎉
                </p>
              </Motion.div>
            )}
          </Motion.label>
        </div>

        {preview && (
          <Motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={isLoading}
            className="create-post-submit"
            style={{ background: isLoading ? '#b2bec3' : '#74b9ff' }}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              'Upload  Picture 🚀'
            )}
          </Motion.button>
        )}
      </Motion.div>
    </Motion.div>
  );
};

export default CreatePost;