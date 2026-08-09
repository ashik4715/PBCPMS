export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getUser(): any {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function setAuth(token: string, user: any) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function isAdmin(): boolean {
  const user = getUser();
  return user?.role === 'ADMIN';
}

export function isOwner(): boolean {
  const user = getUser();
  return user?.role === 'OWNER';
}