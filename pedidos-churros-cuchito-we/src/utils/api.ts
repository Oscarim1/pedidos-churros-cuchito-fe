export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  let token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');

  const headers = new Headers(init.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response = await fetch(input, { ...init, headers });

  if (response.status === 401 || response.status === 403) {
    const message = await response.text();

    if (message.includes('Token inválido o expirado') && refreshToken) {
      const refreshRes = await fetch('https://tienda-churroscuchito.cl/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const newToken = data.access_token || data.accessToken || data.token;
        const newRefresh = data.refreshToken || data.refresh_token;
        if (newToken) {
          localStorage.setItem('token', newToken);
          token = newToken;
        }
        if (newRefresh) {
          localStorage.setItem('refreshToken', newRefresh);
        }
        headers.set('Authorization', `Bearer ${token}`);
        response = await fetch(input, { ...init, headers });
      } else if (refreshRes.status === 403) {
        const refreshMsg = await refreshRes.text();
        if (refreshMsg.includes('Refresh token inválido o expirado')) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          throw new Error(refreshMsg);
        } else {
          throw new Error(refreshMsg || 'Request failed');
        }
      } else {
        const refreshMsg = await refreshRes.text();
        throw new Error(refreshMsg || 'Request failed');
      }
    } else if (message.includes('Refresh token inválido o expirado')) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      throw new Error(message);
    } else {
      throw new Error(message || 'Request failed');
    }
  }

  return response;
}
