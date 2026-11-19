import { NestFactory, Reflector } from "@nestjs/core";
import { ClassSerializerInterceptor } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
    routeResolutionStrategy: "specificity",
    routeConflictPolicy: { duplicate: "error", shadow: "error" }
  });

  const config = new DocumentBuilder()
    .setTitle('Realworld example')
    .setDescription('Realworld API docs')
    .addBearerAuth({
      type: "http",
      bearerFormat: "Bearer",
      scheme: "Bearer",
      in: "Header"
    })
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();
