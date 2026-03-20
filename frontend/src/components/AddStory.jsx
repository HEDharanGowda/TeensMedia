import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaImage, FaCheck } from 'react-icons/fa';
import api, { getAuthHeaders } from '../services/api';
import './AddStory.css';

const Motion = motion;

const AddStory = ({ token, onClose, onStoryCreated }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setSelectedImage(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedImage || !preview) return;

    setUploading(true);
    setError(null);

    try {
      // Extract base64 data without the prefix
      const base64Data = preview.split(',')[1];

      const response = await api.post(
        '/stories',
        { imageBase64: base64Data },
        { headers: getAuthHeaders(token) }
      );

      setSuccess(true);
      setTimeout(() => {
        onStoryCreated?.(response.data);
        onClose();
      }, 1000);
    } catch (err) {
      if (err.response?.data?.status === 'BANNED') {
        setError('Your account has been banned');
      } else {
        setError(err.response?.data?.message || 'Failed to upload story');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <Motion.div
        className="add-story-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <Motion.div
          className="add-story-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="add-story-header">
            <h2>Add Story</h2>
            <button onClick={onClose} className="add-story-close">
              <FaTimes />
            </button>
          </div>

          <div className="add-story-content">
            {!preview ? (
              <label className="add-story-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
                <FaImage size={48} />
                <span>Click to select an image</span>
                <span className="add-story-hint">Max size: 5MB</span>
              </label>
            ) : (
              <div className="add-story-preview">
                <img src={preview} alt="Story preview" />
                {!success && (
                  <button
                    onClick={() => {
                      setPreview(null);
                      setSelectedImage(null);
                    }}
                    className="add-story-change"
                  >
                    Change Image
                  </button>
                )}
              </div>
            )}

            {error && (
              <Motion.div
                className="add-story-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </Motion.div>
            )}

            {success && (
              <Motion.div
                className="add-story-success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <FaCheck size={24} />
                <span>Story posted!</span>
              </Motion.div>
            )}
          </div>

          {preview && !success && (
            <div className="add-story-footer">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="add-story-submit"
              >
                {uploading ? 'Posting...' : 'Post Story'}
              </button>
            </div>
          )}
        </Motion.div>
      </Motion.div>
    </AnimatePresence>
  );
};

export default AddStory;
