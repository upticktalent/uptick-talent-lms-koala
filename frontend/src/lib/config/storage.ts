import { env } from '@/lib/config/constants';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import DomPurify from 'dompurify';

type StorageProps = {
  key: string;
  value?: string | unknown;
};

export const storeCookie = ({ key, value }: StorageProps) => {
  const date = new Date();
  const expireTime = new Date(date.getTime() + 1 * 60 * 60 * 1000);
  const maxAge = 12 * 60 * 60;

  console.log(key, value);

  if (key && value)
    return setCookie(key, value, {
      expires: expireTime,
      maxAge,
    });
  return;
};

export const getAuthToken = () => getCookie(env.AUTH_TOKEN);

export const getStoredCookie = (key: string): string | undefined => {
  const cookie = getCookie(key, {
    path: '/',
    sameSite: 'strict',
  });

  if (typeof cookie === 'string') {
    const sanitizedData = DomPurify.sanitize(cookie);
    try {
      const data = JSON.parse(sanitizedData);
      return data;
    } catch (error) {
      console.error(error);
      return sanitizedData;
    }
  }
};

export const deleteStorageCookie = ({ key }: StorageProps) => deleteCookie(key);

export const setLocalItem = ({ key, value }: StorageProps) => {
  if (typeof window !== 'undefined')
    return window.localStorage.setItem(key, DomPurify.sanitize(JSON.stringify(value)));
};

export const getLocalItem = <T>({ key }: StorageProps): T | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const item = window.localStorage.getItem(key);
    if (item !== null) {
      try {
        return JSON.parse(DomPurify.sanitize(item));
      } catch (err) {
        console.error(`Error parsing local storage item: `, err);
      }
    }
  }
  return null;
};

export const removeLocalItem = ({ key }: StorageProps) => {
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
};

export const clearLocalStorage = () => localStorage.clear();
