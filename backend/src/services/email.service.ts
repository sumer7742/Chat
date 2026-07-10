import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../config/logger';

class EmailService {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter | null {
    if (this.transporter) return this.transporter;
    if (!env.SMTP_HOST) {
      logger.warn('SMTP not configured — emails will be logged to console');
      return null;
    }
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure: (env.SMTP_PORT ?? 587) === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
    return this.transporter;
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    const transporter = this.getTransporter();
    if (!transporter) {
      logger.info({ to, subject, html }, '📧 [dev] email');
      return;
    }
    // Email is a side effect — a delivery failure must never break the request
    // (e.g. registration). Log and move on; the user can retry / resend.
    try {
      await transporter.sendMail({ from: env.SMTP_FROM, to, subject, html });
    } catch (err) {
      logger.error({ err, to, subject }, 'Email delivery failed');
    }
  }

  sendVerificationOtp(to: string, otp: string): Promise<void> {
    return this.send(
      to,
      'Verify your email',
      `<p>Your verification code is <b style="font-size:20px">${otp}</b>. It expires in ${Math.floor(
        env.OTP_TTL_SECONDS / 60,
      )} minutes.</p>`,
    );
  }

  sendPasswordReset(to: string, token: string): Promise<void> {
    const link = `${env.CORS_ORIGIN.split(',')[0]}/reset-password?token=${token}`;
    return this.send(
      to,
      'Reset your password',
      `<p>Click to reset your password: <a href="${link}">${link}</a></p><p>This link expires in 1 hour.</p>`,
    );
  }
}

export const emailService = new EmailService();
