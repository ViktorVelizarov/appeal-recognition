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
    <div>
      <h1>Detection history</h1>

      {error && <p role="alert">{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && runs.length === 0 && (
        <p>
          No detections yet. <Link to="/app">Upload a photo</Link>
        </p>
      )}

      <ul>
        {runs.map((run) => (
          <li key={run._id}>
            {new Date(run.timestamp).toLocaleString()} - {run.status}
            {run.status === 'completed' && ` - ${run.croppedImages?.length || 0} items`}
            {run.error && ` - ${run.error}`}{' '}
            {run.status === 'completed' && (
              <button type="button" onClick={() => setSelectedRun(run)}>
                View
              </button>
            )}
          </li>
        ))}
      </ul>

      {selectedRun && (
        <section>
          <h2>{new Date(selectedRun.timestamp).toLocaleString()}</h2>
          <button type="button" onClick={() => setSelectedRun(null)}>
            Close
          </button>
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
