import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as fs from 'fs';
import { join, resolve } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecaptchaModule } from './common/recaptcha/recaptcha.module';
import { AppException } from './exceptions/app.exception';
import { MailModule } from './common/mail/mail.module';
import { JwtTokensModule } from './common/jwt-tokens/jwt-tokens.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: fs
                .readdirSync(join('configs', process.env.NODE_ENV))
                .map((file) => join('configs', process.env.NODE_ENV, file)),
            isGlobal: true,
        }),
        ServeStaticModule.forRoot(
            {
                rootPath: resolve(__dirname, '..', 'images'),
                serveRoot: '/images',
                serveStaticOptions: {
                    index: false,
                },
            },
            {
                rootPath: join(__dirname, '..', 'public'),
                exclude: ['/api/(.*)'],
            },
        ),
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.DATABASE_HOST,
            port: +process.env.DATABASE_PORT,
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_DATABASE,
            entities: ['dist/**/*.entity.js'],
            cache: {
                type: 'redis',
                options: {
                    host: process.env.CACHE_HOST,
                    port: +process.env.CACHE_PORT,
                },
                ignoreErrors: true,
            },
            //Отключить в продакшне
            synchronize: false,
        }),
        RecaptchaModule.forRoot({
            secret: process.env.RECAPTCHA_SECRET_KEY,
            enabled: !!process.env.USE_RECAPTCHA,
            hostname: process.env.RECAPTCHA_HOSTNAME,
            checkHostname: true,
            exceptionFactory: (error) => {
                return new AppException(
                    error.getResponse()[0],
                    error.getStatus(),
                );
            },
        }),
        MailModule.forRoot({
            transport: {
                host: process.env.SMTP_HOST,
                port: +process.env.SMTP_PORT,
                secure: !!process.env.SMTP_SECURE,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                },
            },
            from: {
                name: process.env.SMTP_FROM_NAME,
                address: process.env.SMTP_FROM,
            },
        }),
        ScheduleModule.forRoot(),
        JwtTokensModule.register({
            secret: process.env.JWT_SECRET_KEY,
            signOptions: {
                expiresIn: process.env.JWT_EXPORATION_TIME,
            },
            exceptionFactory: () => {
                return new AppException('Ошибка при валидации токена', 400);
            },
        }),
    ],
})
export class AppModule {}
