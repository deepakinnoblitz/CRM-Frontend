import { getAuthHeaders, frappeRequest } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export async function login(usr: string, pwd: string) {
  const res = await fetch('/api/method/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ usr, pwd }),
  });

  if (!res.ok) {
    throw new Error('LOGIN_FAILED');
  }

  return res.json();
}

export async function getLoggedUser() {
  const res = await frappeRequest('/api/method/frappe.auth.get_logged_user');

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.message ?? null;
}

export async function logout() {
  const headers = await getAuthHeaders();
  await frappeRequest('/api/method/logout', {
    method: 'POST',
    headers,
    credentials: 'include',
  });
}

export async function getCurrentUserInfo() {
  const res = await frappeRequest('/api/method/company.company.frontend_api.get_current_user_info');

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.message ?? null;
}
