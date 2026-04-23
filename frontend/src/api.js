const URLS = ['http://127.0.0.1:8000', 'http://localhost:8000'];

export async function sendChat({ message, history, currentForm }) {
  let lastErr = '';
  for (const base of URLS) {
    try {
      const res = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, current_form: currentForm }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      lastErr = e.message;
    }
  }
  throw new Error(`Cannot reach backend. Is it running?\n${lastErr}`);
}
