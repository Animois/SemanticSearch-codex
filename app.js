import React, { useMemo, useState } from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';

const fakeEmbedding = (text = '') => {
  const v = new Array(64).fill(0);
  for (let i = 0; i < text.length; i++) v[i % 64] += text.charCodeAt(i) / 255;
  return v;
};

const cosine = (a = [], b = []) => {
  if (!a.length || !b.length || a.length !== b.length) return -1;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return -1;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};

let localProgrammingDataset = null;

const getLocalProgrammingDataset = async () => {
  if (localProgrammingDataset) return localProgrammingDataset;
  const files = ['data/stackoverflow_3000.json', 'data.json', 'stackoverflow_3000.json'];

  for (const file of files) {
    try {
      const res = await fetch(file);
      if (!res.ok) continue;
      const raw = await res.json();
      localProgrammingDataset = raw.filter((r) => Array.isArray(r.embedding)).slice(0, 3000);
      if (localProgrammingDataset.length) return localProgrammingDataset;
    } catch {}
  }

  localProgrammingDataset = [];
  return localProgrammingDataset;
};

const localApiSearch = async (query) => {
  const dataset = await getLocalProgrammingDataset();
  const qv = fakeEmbedding(query);
  const results = dataset
    .map((row) => ({
      question: row.question,
      answer: row.answer,
      tags: row.tags || [],
      score: cosine(qv, row.embedding?.length ? row.embedding : fakeEmbedding(row.question || row.answer || ''))
    }))
    .filter((r) => r.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return { datasetSize: dataset.length, results, fallback: true };
};

const searchApi = async (query) => {
  try {
    const response = await fetch('/api/programming-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    const text = await response.text();
    const payload = JSON.parse(text || '{}');
    if (!response.ok) throw new Error(payload.error || 'Request failed');
    return { ...payload, fallback: false };
  } catch {
    return localApiSearch(query);
  }
};

function ResultCard({ item, index }) {
  return React.createElement('article', { className: 'result-item' },
    React.createElement('div', { className: 'meta' },
      React.createElement('span', null, `#${index + 1}`),
      React.createElement('span', null, `Score: ${Number(item.score).toFixed(4)}`)
    ),
    React.createElement('h3', null, item.question || 'Untitled question'),
    React.createElement('p', null, (item.answer || '').slice(0, 300)),
    React.createElement('div', { className: 'tags' }, (item.tags || []).slice(0, 5).join(', '))
  );
}

function App() {
  const [query, setQuery] = useState('How can I optimize React rendering performance?');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [datasetSize, setDatasetSize] = useState(0);
  const [fallback, setFallback] = useState(false);

  const subtitle = useMemo(
    () => fallback
      ? 'Backend unavailable — running in local semantic mode.'
      : 'Connected to API semantic search pipeline.',
    [fallback]
  );

  const onSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await searchApi(query.trim());
      setResults(data.results || []);
      setDatasetSize(data.datasetSize || 0);
      setFallback(Boolean(data.fallback));
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('main', { className: 'app' },
    React.createElement('header', { className: 'hero' },
      React.createElement('h1', null, 'SemanticSearch Studio'),
      React.createElement('p', null, 'A modern React interface for searching StackOverflow vectors with clean, glassmorphism design.')
    ),

    React.createElement('section', { className: 'grid' },
      React.createElement('div', { className: 'card' },
        React.createElement('label', { htmlFor: 'search' }, 'Ask a programming question'),
        React.createElement('textarea', {
          id: 'search',
          value: query,
          onChange: (e) => setQuery(e.target.value),
          placeholder: 'e.g. What is the difference between useMemo and useCallback?'
        }),
        React.createElement('div', { className: 'actions' },
          React.createElement('button', { type: 'button', onClick: onSearch, disabled: loading }, loading ? 'Searching…' : 'Search Semantically'),
          React.createElement('span', { className: 'badge' }, `${datasetSize || 0} vectors`)
        ),
        React.createElement('p', { className: 'small' }, subtitle)
      ),

      React.createElement('aside', { className: 'card' },
        React.createElement('h3', null, 'UI Improvements'),
        React.createElement('ul', { className: 'small' },
          React.createElement('li', null, 'React 18 component architecture.'),
          React.createElement('li', null, 'Responsive modern card layout.'),
          React.createElement('li', null, 'Glassmorphism + gradient accents.'),
          React.createElement('li', null, 'Semantic search status indicators.')
        )
      )
    ),

    React.createElement('section', { className: 'card' },
      React.createElement('h3', null, 'Search Results'),
      React.createElement('div', { className: 'results' },
        results.length
          ? results.map((item, index) => React.createElement(ResultCard, { key: `${item.question}-${index}`, item, index }))
          : React.createElement('div', { className: 'empty' }, 'Run a search to see top semantic matches.')
      )
    )
  );
}

createRoot(document.getElementById('root')).render(React.createElement(App));
