import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import DetectionResultView from '../components/upload/DetectionResultView';

const formatWhen = (timestamp) =>
  new Date(timestamp).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

const runLabel = (run) => {
  if (run.status === 'completed') {
    const count = run.croppedImages?.length || 0;
    return `${count} ${count === 1 ? 'item' : 'items'}`;
  }
  return run.status === 'failed' ? 'Failed' : 'Processing';
};

const HistoryPage = () => {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const detailRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    api
      .get('/api/detection-runs')
      .then(({ data }) => {
        if (isMounted) setRuns(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (isMounted) setError(err.response?.data?.error || 'Failed to load detection history');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Runs arrive newest first; until one is picked, the latest is shown.
  const selectedRun = runs.find((run) => run._id === selectedId) || runs[0];

  const handleSelect = (id) => {
    setSelectedId(id);
    // The list stays in view while scrolling; bring the results up with it.
    const detail = detailRef.current;
    if (detail && detail.getBoundingClientRect().top < 0) detail.scrollIntoView({ block: 'start' });
  };

  return (
    <div className="app-wrap">
      <div className="app-head">
        <h1 className="mega">
          History
          <b>.</b>
        </h1>
        <p className="auth-sub">Every photo you have scanned, with its detected garments and matches.</p>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {loading && <p className="mono">Loading…</p>}

      {!loading && !error && runs.length === 0 && (
        <p className="empty">
          No scans yet. <Link to="/app">Upload a photo</Link>
        </p>
      )}

      {selectedRun && (
        <div className="hist">
          <ul className="hist-list" aria-label="Past scans">
            {runs.map((run) => (
              <li key={run._id}>
                <button
                  type="button"
                  className={`hist-item hist-item--${run.status}`}
                  aria-current={run._id === selectedRun._id ? 'true' : undefined}
                  onClick={() => handleSelect(run._id)}
                >
                  {run.originalImageUrl ? (
                    <img className="hist-thumb" src={run.originalImageUrl} alt="" loading="lazy" />
                  ) : (
                    <span className="hist-thumb" />
                  )}
                  <span className="hist-meta">
                    <span className="hist-when">{formatWhen(run.timestamp)}</span>
                    <span className="mono">{runLabel(run)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <section className="hist-detail" ref={detailRef}>
            <h2 className="hist-title">{formatWhen(selectedRun.timestamp)}</h2>
            {selectedRun.status === 'completed' ? (
              <DetectionResultView
                key={selectedRun._id}
                result={{
                  runId: selectedRun._id,
                  originalImageUrl: selectedRun.originalImageUrl,
                  detectedImageUrl: selectedRun.detectedImageUrl,
                  croppedImages: selectedRun.croppedImages,
                }}
              />
            ) : selectedRun.status === 'failed' ? (
              <p className="empty">
                This scan failed{selectedRun.error ? `: ${selectedRun.error}` : '.'}{' '}
                <Link to="/app">Upload the photo again</Link>
              </p>
            ) : (
              <p className="empty">This scan is still processing. Check back in a moment.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
