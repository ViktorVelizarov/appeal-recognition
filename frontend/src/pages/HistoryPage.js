import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import DetectionResultView from '../components/upload/DetectionResultView';

const HistoryPage = () => {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);

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

      {!loading && runs.length === 0 && (
        <p className="empty">
          No scans yet. <Link to="/app">Upload a photo</Link>
        </p>
      )}

      {runs.length > 0 && (
        <ul className="runs">
          {runs.map((run) => (
            <li className="run" key={run._id}>
              <div className="run-meta">
                <span className={`run-status run-status--${run.status}`}>{run.status}</span>
                <span className="mono">
                  {new Date(run.timestamp).toLocaleString()}
                  {run.status === 'completed' && ` · ${run.croppedImages?.length || 0} items`}
                  {run.error && ` · ${run.error}`}
                </span>
              </div>
              {run.status === 'completed' && (
                <button type="button" className="btn btn--sm" onClick={() => setSelectedRun(run)}>
                  View
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {selectedRun && (
        <section className="run-selected">
          <div className="run-selected-head">
            <h2 className="mono">{new Date(selectedRun.timestamp).toLocaleString()}</h2>
            <button type="button" className="btn btn--sm btn--ghost" onClick={() => setSelectedRun(null)}>
              Close
            </button>
          </div>
          <DetectionResultView
            result={{
              runId: selectedRun._id,
              originalImageUrl: selectedRun.originalImageUrl,
              detectedImageUrl: selectedRun.detectedImageUrl,
              croppedImages: selectedRun.croppedImages,
            }}
          />
        </section>
      )}
    </div>
  );
};

export default HistoryPage;
