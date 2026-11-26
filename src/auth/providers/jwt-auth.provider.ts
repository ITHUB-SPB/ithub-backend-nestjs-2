import { Injectable } from '@nestjs/common';
import { AuthenticationRegistry, JwtBearerProvider, type JwtClaims } from '@nestjs/authentication';
import type { User } from '../entities/user.entity.js';
import { AuthService } from '../auth.service.js';

@Injectable()
export class JwtAuth extends JwtBearerProvider<User> {
  constructor(
    private readonly authService: AuthService,
    registry: AuthenticationRegistry,
  ) {
    super({ realm: "realworld " }); // TODO подумать, нужен ли realm
    registry.registerProvider(this, { order: 1 });
  }

  validate({ sub }: JwtClaims) {
    if (!sub) {
      return null
    }

    return this.authService.getUserByEmail(sub);
  }
}
