const API_BASE_URL = 'http://localhost:5000/api';

function getCurrentToken() {
  try {
    const currentUserType = localStorage.getItem('currentUserType');
    if (!currentUserType) return null;
    return localStorage.getItem(`${currentUserType.toLowerCase()}Token`);
  } catch (err) {
    console.error('Error reading token from storage', err);
    return null;
  }
}

function handleUnauthorized() {
  try {
    localStorage.removeItem('currentUserType');
    localStorage.removeItem('studentToken');
    localStorage.removeItem('candidateToken');
    localStorage.removeItem('adminToken');
  } catch (err) {
    console.error('Error clearing auth storage', err);
  }

  try {
    if (typeof window !== 'undefined' && typeof CustomEvent === 'function') {
      const event = new CustomEvent('auth:unauthorized', { cancelable: true, detail: { reason: '401' } });
      const defaultPrevented = !window.dispatchEvent(event);

      if (!defaultPrevented) {
        window.location.href = '/';
      }
    } else if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  } catch (err) {
    console.error('Error dispatching auth:unauthorized event', err);
    if (typeof window !== 'undefined') window.location.href = '/';
  }
}

export async function apiFetch(path, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body = null,
    auth = true,
    isFormData = false,
  } = options;

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  const init = { method, headers: { ...headers } };

  if (auth) {
    const token = getCurrentToken();
    if (token) init.headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData && !init.headers['Content-Type']) {
    init.headers['Content-Type'] = 'application/json';
  }

  if (body != null) {
    init.body = isFormData ? body : (typeof body === 'string' ? body : JSON.stringify(body));
  }

  const resp = await fetch(url, init);

  if (resp.status === 401) {
    handleUnauthorized();
    const text = await resp.text().catch(() => '');
    throw new Error(`Unauthorized: ${text}`);
  }

  let data = null;
  try {
    data = await resp.json();
  } catch (err) {
  }

  return { response: resp, data };
}

export default { apiFetch };
