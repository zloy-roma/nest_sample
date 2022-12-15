import { Inject, Injectable, Scope } from '@nestjs/common';
import { RecaptchaOptions } from './recaptcha.module';
import { HttpService } from '@nestjs/axios';
import { RecaptchaException, RecaptchaResponse } from './recaptcha.exception';

interface ApiResponse {
    success: boolean;
    challenge_ts: Date;
    hostname: string;
    'error-codes'?: (keyof RecaptchaResponse)[];
}

@Injectable({
    scope: Scope.REQUEST,
})
export class RecaptchaService {
    private recaptchaDefaultOptions: Omit<RecaptchaOptions, 'secret'> = {
        recapthcaQueryName: 'captcha',
        enabled: true,
        checkHostname: false,
        exceptionFactory: (error) => error,
    };

    constructor(
        @Inject('OPTIONS')
        private recaptchaOptions: RecaptchaOptions,
        @Inject(HttpService)
        private httpService: HttpService,
    ) {}

    getQueryName() {
        return this.getOption('recapthcaQueryName');
    }

    private getOption(key: keyof RecaptchaOptions) {
        return this.recaptchaOptions[key] ?? this.recaptchaDefaultOptions[key];
    }

    private throwError(response: ApiResponse) {
        const factory =
            this.recaptchaOptions.exceptionFactory ||
            this.recaptchaDefaultOptions.exceptionFactory;
        throw factory(new RecaptchaException(response['error-codes']));
    }

    async checkCaptcha(response: string): Promise<boolean> {
        if (
            this.getOption['enabled'] !== undefined &&
            !this.getOption['enabled']
        ) {
            return true;
        }

        return await this.httpService.axiosRef
            .post(
                'https://www.google.com/recaptcha/api/siteverify',
                undefined,
                {
                    params: {
                        secret: this.recaptchaOptions.secret,
                        response,
                    },
                },
            )
            .then(({ data }: { data: ApiResponse }) => {
                if (!data.success) {
                    this.throwError(data);
                    return false;
                }
                return true;
            });
    }
}
