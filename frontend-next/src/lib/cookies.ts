// frontend-next/src/lib/cookies.ts
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const COOKIE_NAME = 'tempUserId';

export async function getOrCreateTempUserId(): Promise<string> {
  const cookieStore = await cookies();
  let userId = cookieStore.get(COOKIE_NAME)?.value;

  if (!userId) {
    userId = uuidv4();
    cookieStore.set(COOKIE_NAME, userId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return userId;
}
