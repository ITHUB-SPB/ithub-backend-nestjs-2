import { Injectable } from '@nestjs/common';
import { Mailer, MailTemplateContent, type Mailable } from '@nestjs/mail';
import { AuthenticationRegistry, EmailVerificationHandler, type EmailVerificationLink } from '@nestjs/authentication';
import { AuthService } from '../auth/auth.service.js';

@Injectable()
export class VerifyMailRenderer implements Mailable<EmailVerificationLink> {
    render({ url }: EmailVerificationLink): MailTemplateContent {
        return {
            subject: "Confirm your email address",
            template: "verify-email",
            context: { url }
        }
    }
}

@Injectable()
export class VerifyMailProvider extends EmailVerificationHandler {
    constructor(
        private readonly authService: AuthService,
        private readonly mailer: Mailer,
        registry: AuthenticationRegistry
    ) {
        super()
        registry.registerHandler('emailVerification', this)
    }

    async send(link: EmailVerificationLink): Promise<void> {
        await this.mailer.send(VerifyMailRenderer, { to: link.email, data: link })
    }

    async markVerified(userId: string, email: string): Promise<boolean> {
        return this.authService.markVerified(userId, email)
    }
}