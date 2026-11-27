import { NestFactory, Reflector } from "@nestjs/core";
import {
  ClassSerializerInterceptor,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule, ObserveInstrument } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
    routeResolutionStrategy: "specificity",
    routeConflictPolicy: { duplicate: "error", shadow: "error" },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors: Record<string, string[]> = {};

        const extract = (errs: ValidationError[]) => {
          for (const err of errs) {
            if (err.children && err.children.length > 0) {
              extract(err.children);
            } else if (err.constraints) {
              formattedErrors[err.property] = Object.values(err.constraints);
            }
          }
        };

        extract(errors);
        return new UnprocessableEntityException({ errors: formattedErrors });
      },
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  const config = new DocumentBuilder()
    .setTitle('Realworld example')
    .setDescription('Realworld API docs')
    .addBearerAuth(
      {
        type: "http",
        bearerFormat: "JWT",
        scheme: "Bearer",
        in: 'Header',
      },
      'JWT',
    )
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();
