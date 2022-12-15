import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
    ClassSerializerInterceptor,
    HttpStatus,
    ValidationPipe,
} from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ErrorsFilter } from './exceptions/errors.filter';
import { AppException } from './exceptions/app.exception';

const globalPipes = (app) => [
    new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        dismissDefaultMessages: true,
        validationError: {
            value: false,
            target: false,
        },
        stopAtFirstError: true,
        exceptionFactory: (errors) =>
            new AppException(
                Object.values(errors[0].constraints)[0],
                HttpStatus.BAD_REQUEST,
            ),
    }),
];

const globalFilters = (app) => [new ErrorsFilter()];

const globalGuards = (app) => [];

const globalInterceptors = (app) => [
    new ClassSerializerInterceptor(app.get(Reflector), {}),
];

const bootstrap = async (port: number, hostname?: string) => {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(...globalPipes(app));
    app.useGlobalFilters(...globalFilters(app));
    app.useGlobalGuards(...globalGuards(app));
    app.useGlobalInterceptors(...globalInterceptors(app));
    app.use(cookieParser());
    return app.listen(port, hostname);
};

bootstrap(3001);
