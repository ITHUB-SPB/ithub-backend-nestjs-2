import { join } from 'node:path'

import { Module } from '@nestjs/common';
import { MailModule as GlobalMailModule, SmtpTransport, LogMailTransport, FileTemplateEngine } from "@nestjs/mail";
import { AuthModule } from '../auth/auth.module.js';
import { VerifyMailProvider, VerifyMailRenderer } from './mail.service.js';

@Module({
  imports: [
    AuthModule,
    GlobalMailModule.forRoot({
      transport: process.env.NODE_ENV === "production"
        ? new SmtpTransport({
          secure: false,
          port: Number(process.env.SMTP_PORT),
          host: process.env.SMTP_HOST,
          auth: {
            user: process.env.SMTP_USER ?? "",
            pass: process.env.SMTP_PASSWORD ?? "",
          }
        })
        : new LogMailTransport(),
      templates: new FileTemplateEngine({ dir: join(import.meta.dirname, 'templates') }),
      from: `Support <noreply@medium.com>`
    }),
  ],
  providers: [VerifyMailProvider, VerifyMailRenderer],
  exports: [VerifyMailProvider]
})
export class MailModule { }
