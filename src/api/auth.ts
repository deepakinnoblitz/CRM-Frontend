import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';

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
  
  let fcmResponse = null;

  // Clear the FCM token from the backend database first
  try {
    const res = await frappeRequest('/api/method/company.company.api.remove_fcm_token', {
      method: 'POST',
      headers,
      credentials: 'include',
    });
    fcmResponse = await res.json();
  } catch (err) {
    console.error('Failed to clear FCM token from backend:', err);
    fcmResponse = { error: String(err) };
  }

  // Now perform the actual logout
  await frappeRequest('/api/method/logout', {
    method: 'POST',
    headers,
    credentials: 'include',
  });

  return fcmResponse;
}

export async function getCurrentUserInfo() {
  const res = await frappeRequest('/api/method/company.company.frontend_api.get_current_user_info');

  if (!res.ok) {
    return null;
  }

  const json = await res.json();
  const result = json.message;

  if (result?.status === 'success') {
    return result.data;
  }

  return null;
}
