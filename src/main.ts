import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, UnprocessableEntityException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
    routeResolutionStrategy: 'specificity',
    routeConflictPolicy: {
      duplicate: 'error',
      shadow: 'error',
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      errorHttpStatusCode: 422,
      exceptionFactory: (errors) => {
        const fieldErrors: Record<string, string[]> = {};

        for (const error of errors) {
          const fields = error.children?.length
            ? error.children
            : [error];

          for (const field of fields) {
            const constraints = field.constraints ?? {};

            const message =
              constraints.isNotEmpty ??
              constraints.isEmail ??
              Object.values(constraints)[0] ??
              'is invalid';

            fieldErrors[field.property] = [message];
          }
        }

        return new UnprocessableEntityException({
          errors: fieldErrors,
        });
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Realworld example')
    .setDescription('Realworld API docs')
    .addBearerAuth(
      {
        type: 'http',
        bearerFormat: 'JWT',
        scheme: 'Bearer',
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