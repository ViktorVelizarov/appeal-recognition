import React, { useState } from 'react';
import api from '../../api/axios';
import ShoppingResults from './ShoppingResults';

const DetectionCard = ({ detection, index = 0 }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState(null);

  const handleFindSimilar = async () => {
    if (items || loading) return;

    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/similar-items', {
        params: { imageUrl: detection.imageUrl },
      });
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search for similar items');
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="det">
      <header className="det-head">
        <span className="det-id">D-0{index + 1}</span>
        <h3 className="det-name">{detection.class}</h3>
        <span className="det-conf">{(detection.confidence || 0).toFixed(2)}</span>
      </header>

      {!items && (
        <div className="det-actions">
          <button type="button" className="btn btn--sm" onClick={handleFindSimilar} disabled={loading}>
            {loading ? 'Searching…' : 'Find similar items'}
          </button>
        </div>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {items && <ShoppingResults items={items} />}
    </article>
  );
};

export default DetectionCard;
