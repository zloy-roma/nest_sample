import { DynamicModule, Global, HttpException, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RecaptchaService } from './recaptcha.service';
import { RecaptchaException } from './recaptcha.exception';

export interface RecaptchaOptions {
    secret: string;
    recapthcaQueryName?: string;
    hostname?: string;
    checkHostname?: boolean;
    enabled?: boolean;
    exceptionFactory?: (error: RecaptchaException) => HttpException;
}

@Module({})
@Global()
export class RecaptchaModule {
    static forRoot(options: RecaptchaOptions): DynamicModule {
        return {
            module: RecaptchaModule,
            imports: [HttpModule],
            providers: [
                RecaptchaService,
                {
                    provide: 'OPTIONS',
                    useValue: options,
                },
            ],
            exports: [RecaptchaService],
        };
    }
}
