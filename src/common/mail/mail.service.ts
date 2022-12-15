import { Inject, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { MailTemplates } from './mail.templates';
import { ISendMailOptions } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';
import { MailOptions } from './mail.module';

interface SendMailOptions<T extends keyof MailTemplates>
    extends Omit<Omit<Omit<ISendMailOptions, 'template'>, 'context'>, 'from'> {
    template: T;
    context?: MailTemplates[T];
}

@Injectable()
export class MailService {
    constructor(
        @Inject(MailerService)
        private mailerService: MailerService,
        @Inject('OPTIONS')
        private mailerOptions: MailOptions,
    ) {}

    sendMail<T extends keyof MailTemplates>(options: SendMailOptions<T>) {
        return this.mailerService.sendMail({
            ...options,
            template: `${options.template}.hbs`,
            from: this.mailerOptions.from,
        });
    }
}
