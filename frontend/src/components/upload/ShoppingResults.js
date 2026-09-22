import React from 'react';

const formatPrice = (item) => {
  if (!item.price) return null;
  if (typeof item.price === 'object') {
    const value = item.price.extracted_value || item.price.value;
    return value ? `${item.price.currency || ''}${value}`.trim() : null;
  }
  return `${item.price} ${item.currency || ''}`.trim();
};

const ShoppingResults = ({ items }) => {
  if (!items || items.length === 0) {
    return <p className="empty">No similar items found.</p>;
  }

  return (
    <ul className="matches">
      {items.map((item, idx) => (
        <li className="match" key={item.itemUrl || idx}>
          <span className="m-shop">{item.source || 'Shop'}</span>
          <span className="m-item">{item.title || 'Similar item'}</span>
          <span className="m-price">{formatPrice(item) || '—'}</span>
          {item.itemUrl ? (
            <a className="m-buy" href={item.itemUrl} target="_blank" rel="noopener noreferrer">
              Buy &#8599;
            </a>
          ) : (
            <span />
          )}
        </li>
      ))}
    </ul>
  );
};

export default ShoppingResults;
