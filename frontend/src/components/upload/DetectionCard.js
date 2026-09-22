import React, { useState } from 'react';
import api from '../../api/axios';
import ShoppingResults from './ShoppingResults';

const DetectionCard = ({ detection }) => {
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
    <article>
      <img src={detection.imageUrl} alt={`Detected ${detection.class}`} width="160" />
      <p>
        {detection.class} ({Math.round(detection.confidence * 100)}%)
      </p>
      <button type="button" onClick={handleFindSimilar} disabled={loading}>
        {loading ? 'Searching...' : 'Find similar items'}
      </button>
      {error && <p role="alert">{error}</p>}
      {items && <ShoppingResults items={items} />}
    </article>
  );
};

export default DetectionCard;
