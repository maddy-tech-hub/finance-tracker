import { useEffect, useRef } from "react";

const IDLE_TIMEOUT_MINUTES = Number(import.meta.env.VITE_IDLE_TIMEOUT_MINUTES ?? 30);
const IDLE_TIMEOUT_MS = Math.max(IDLE_TIMEOUT_MINUTES, 1) * 60 * 1000;

const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

const isPublicPath = (path: string) => PUBLIC_PATHS.some((item) => path.startsWith(item));

const clearAuthAndRedirect = () => {
  localStorage.clear();
  if (!isPublicPath(window.location.pathname)) {
    window.location.href = "/login";
  }
};

export const SessionGuard = () => {
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const hasSession = () => Boolean(localStorage.getItem("access_token") && localStorage.getItem("refresh_token"));

    const restartTimer = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      if (!hasSession() || isPublicPath(window.location.pathname)) {
        return;
      }

      timerRef.current = window.setTimeout(() => {
        clearAuthAndRedirect();
      }, IDLE_TIMEOUT_MS);
    };

    const events: Array<keyof WindowEventMap> = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((eventName) => window.addEventListener(eventName, restartTimer, { passive: true }));

    restartTimer();

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, restartTimer));
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return null;
};
