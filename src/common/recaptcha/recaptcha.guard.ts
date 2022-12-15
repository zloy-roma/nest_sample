import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
} from '@nestjs/common';
import { RecaptchaService } from './recaptcha.service';

@Injectable()
export class RecaptchaGuard implements CanActivate {
    constructor(
        @Inject(RecaptchaService)
        private recaptchaService: RecaptchaService,
    ) {}

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        return this.recaptchaService.checkCaptcha(
            request.query[this.recaptchaService.getQueryName()],
        );
    }
}
