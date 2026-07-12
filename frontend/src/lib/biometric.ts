/**
 * Lightweight biometric convenience using the platform authenticator
 * (Touch ID / Face ID / Windows Hello / Android fingerprint) via WebAuthn.
 *
 * This is a local user-verification gate, NOT a replacement for password auth:
 * a successful prompt lets a returning user resume an existing session (whose
 * security still rests on the httpOnly refresh cookie + JWT on the backend).
 */

export async function biometricAvailable(): Promise<boolean> {
  try {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) return false;
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/** Prompts the platform authenticator. Resolves true if the user verified. */
export async function biometricVerify(): Promise<boolean> {
  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60_000,
        userVerification: 'required',
        // No allowCredentials → the OS offers any available platform passkey.
        allowCredentials: [],
      },
    });
    return true;
  } catch {
    // User cancelled, no passkey, or unsupported — fall back to password.
    return false;
  }
}
