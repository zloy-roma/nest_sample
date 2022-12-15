import { DynamicModule, Global, HttpException, Module } from '@nestjs/common';
import { JwtTokensService } from './jwt-tokens.service';
import { JwtModule, JwtModuleAsyncOptions } from '@nestjs/jwt';
import { JwtModuleOptions } from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface';
import { JwtTokensException } from './jwt-tokens.exception';

export type JwtExceptionFactory = (
    exception: JwtTokensException,
) => HttpException;

export interface JwtTokensRegisterOptions extends JwtModuleOptions {
    exceptionFactory?: JwtExceptionFactory;
}

@Module({})
@Global()
export class JwtTokensModule {
    static register(options: JwtTokensRegisterOptions): DynamicModule {
        return {
            module: JwtTokensModule,
            imports: [JwtModule.register(options)],
            providers: [
                JwtTokensService,
                {
                    provide: 'OPTIONS',
                    useValue: options,
                },
            ],
            exports: [JwtTokensService],
        };
    }

    static registerAsync(
        options: JwtTokensRegisterOptions,
        asyncOptions: Omit<JwtModuleAsyncOptions, 'useFactory'> = {},
    ): DynamicModule {
        return {
            module: JwtTokensModule,
            imports: [
                JwtModule.registerAsync({
                    ...asyncOptions,
                    useFactory: async () => options,
                }),
            ],

            providers: [
                JwtTokensService,
                {
                    provide: 'OPTIONS',
                    useValue: options,
                },
            ],
            exports: [JwtTokensService],
        };
    }
}
