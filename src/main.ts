import * as dotenv from 'dotenv';
import * as passport from 'passport';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { AuthenticatedWsAdapter } from './components/ws-adapters/authenticate-ws-adapter';
import * as bodyParser from 'body-parser';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(passport.initialize());
  app.use(passport.session());
  app.useWebSocketAdapter(new AuthenticatedWsAdapter(app));
  app.useStaticAssets(join(__dirname, 'static'));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableCors();

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/v1/swagger-html', app, document);

  configureMiddleware(app);

  await app.listen(JSON.parse(process.env.API_PORT));
  console.info(
    `Application is running on: ${await app.getUrl()} DEBUG : NODE_ENV = ${
      process.env.NODE_ENV
    }`,
  );

  function configureMiddleware(app) {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
  }
}

bootstrap();
