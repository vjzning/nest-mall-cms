import type { AstroGlobal } from 'astro';

export interface User {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
}

export interface SessionData {
  user: User;
  token: string;
}

// 使用 Astro.session API (SSR 模式)
export async function getSession(Astro: AstroGlobal): Promise<SessionData | null> {
  if (!Astro.session) return null;
  
  const user = await Astro.session.get('user');
  const token = await Astro.session.get('token');
  
  if (!user || !token) {
    return null;
  }
  
  return {
    user: user as User,
    token: token as string,
  };
}

export async function setSession(Astro: AstroGlobal, data: SessionData): Promise<void> {
  if (!Astro.session) return;
  
  await Astro.session.set('user', data.user);
  await Astro.session.set('token', data.token);
}

export async function clearSession(Astro: AstroGlobal): Promise<void> {
  if (!Astro.session) return;
  await Astro.session.destroy();
}

export async function isAuthenticated(Astro: AstroGlobal): Promise<boolean> {
  const sessionData = await getSession(Astro);
  return sessionData !== null;
}
