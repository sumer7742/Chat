/**
 * App-open lock state. The Couple Code (or biometrics) gates the whole app on
 * every fresh load. Unlocked state lives in memory only, so a reload re-locks —
 * matching "the Couple Code acts as the lock screen every time the app opens".
 */
let unlocked = false;

const BIO_KEY = 'coupleBiometric'; // '1' when the user enabled biometric unlock

export function isUnlocked(): boolean {
  return unlocked;
}

export function markUnlocked(): void {
  unlocked = true;
}

export function relock(): void {
  unlocked = false;
}

export function biometricEnabled(): boolean {
  try {
    return localStorage.getItem(BIO_KEY) === '1';
  } catch {
    return false;
  }
}

export function setBiometricEnabled(on: boolean): void {
  try {
    if (on) localStorage.setItem(BIO_KEY, '1');
    else localStorage.removeItem(BIO_KEY);
  } catch {
    /* ignore */
  }
}
