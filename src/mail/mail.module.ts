import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { VerifyMailProvider, VerifyMailRenderer } from './mail.service.js';

@Module({
  imports: [AuthModule],
  providers: [VerifyMailProvider, VerifyMailRenderer]
})
export class MailModule { }
