import React, { useState } from 'react';
import { MdStar, MdStarBorder, MdClose, MdThumbUp } from 'react-icons/md';
import feedbackService from '../../services/feedbackService';
import toast from 'react-hot-toast';
import './FeedbackModal.css';

const EMOJIS = [
  { rating: 1, symbol: '😞', label: 'Very Dissatisfied' },
  { rating: 2, symbol: '🙁', label: 'Dissatisfied' },
  { rating: 3, symbol: '😐', label: 'Neutral' },
  { rating: 4, symbol: '🙂', label: 'Satisfied' },
  { rating: 5, symbol: '😄', label: 'Delighted' },
];

export default function FeedbackModal({ appointment, onSuccess, onClose }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const activeRating = hoverRating || rating;
  const currentEmoji = EMOJIS.find((e) => e.rating === activeRating) || EMOJIS[4];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appointment) return;

    setLoading(true);
    try {
      await feedbackService.submit({
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        rating: rating,
        emoji: currentEmoji.symbol,
        comment: comment.trim(),
      });
      toast.success(`Thank you for rating Dr. ${appointment.doctorName || 'your doctor'}!`, {
        duration: 4000,
        icon: '⭐',
      });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) return null;

  return (
    <div className="fb-modal-overlay">
      <div className="fb-modal-card">
        <button className="fb-close-btn" onClick={onClose} aria-label="Close">
          <MdClose size={22} />
        </button>

        <div className="fb-header">
          <div className="fb-icon-badge">🩺</div>
          <h3>Consultation Feedback</h3>
          <p>
            How was your recent consultation with <strong>Dr. {appointment.doctorName || 'Doctor'}</strong>?
          </p>
          <span className="fb-date">
            Visit Date: {appointment.appointmentDate}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="fb-body">
          {/* Star Picker */}
          <div className="fb-star-picker">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`fb-star-btn ${star <= activeRating ? 'active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                {star <= activeRating ? (
                  <MdStar size={36} color="#F59E0B" />
                ) : (
                  <MdStarBorder size={36} color="#CBD5E1" />
                )}
              </button>
            ))}
          </div>

          {/* Emoji Scale below stars */}
          <div className="fb-emoji-row">
            {EMOJIS.map((item) => (
              <button
                key={item.rating}
                type="button"
                className={`fb-emoji-btn ${activeRating === item.rating ? 'selected' : ''}`}
                onClick={() => setRating(item.rating)}
              >
                <span className="fb-emoji-symbol">{item.symbol}</span>
                <span className="fb-emoji-label">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Selected Status Display */}
          <div className="fb-selected-badge">
            <span className="fb-badge-emoji">{currentEmoji.symbol}</span>
            <span className="fb-badge-text">
              {rating} Star{rating > 1 ? 's' : ''} — {currentEmoji.label}
            </span>
          </div>

          {/* Comments */}
          <div className="fb-input-group">
            <label>Additional Comments (Optional)</label>
            <textarea
              rows={3}
              placeholder="Share details about your experience, doctor care, or wait time..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="fb-actions">
            <button type="button" className="fb-btn-cancel" onClick={onClose} disabled={loading}>
              Skip
            </button>
            <button type="submit" className="fb-btn-submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
