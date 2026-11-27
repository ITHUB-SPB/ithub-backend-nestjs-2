import { NestFactory } from "@nestjs/core";
import { ValidationError } from "class-validator";
import { UnprocessableEntityException, ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
    routeResolutionStrategy: "specificity",
    routeConflictPolicy: { duplicate: "error", shadow: "error" }
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[]) => {
        const errors: Record<string, string[]> = {}

        const addErrors = (items: ValidationError[]) => {
          for (const item of items) {
            if (item.children?.length) {
              addErrors(item.children)
              continue
            }

            const message = item.value === '' || item.value === null || item.value === undefined
              ? "can't be blank"
              : Object.values(item.constraints ?? {})[0] ?? 'is invalid'
            errors[item.property] ??= []
            if (!errors[item.property].includes(message)) {
              errors[item.property].push(message)
            }
          }
        }

        addErrors(validationErrors)
        return new UnprocessableEntityException({ errors })
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Realworld example')
    .setDescription('Realworld API docs')
    .addBearerAuth({
      type: "http",
      bearerFormat: "JWT",
      scheme: "Bearer",
      in: "Header"
    }, 'JWT')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();
