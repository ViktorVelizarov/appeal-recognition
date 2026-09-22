import React from 'react';

const formatPrice = (item) => {
  if (!item.price) return null;
  if (typeof item.price === 'object') {
    const value = item.price.extracted_value || item.price.value;
    return value ? `${value} ${item.price.currency || ''}`.trim() : null;
  }
  return `${item.price} ${item.currency || ''}`.trim();
};

const ShoppingResults = ({ items }) => {
  if (!items || items.length === 0) {
    return <p>No similar items found.</p>;
  }

  return (
    <ul>
      {items.map((item, idx) => (
        <li key={item.itemUrl || idx}>
          {item.imageUrl && <img src={item.imageUrl} alt={item.title || 'Similar item'} width="80" />}
          <div>{item.title || 'Similar item'}</div>
          <div>
            {formatPrice(item) || 'Price unavailable'} - {item.source || 'Shopping'}
          </div>
          {item.itemUrl && (
            <a href={item.itemUrl} target="_blank" rel="noopener noreferrer">
              View
            </a>
          )}
        </li>
      ))}
    </ul>
  );
};

export default ShoppingResults;
