import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("/hc")
  hc(): { ok: true } {
    return { ok: true };
  }
}
