import { DynamicModule, Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-options.interface';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Address } from 'nodemailer/lib/mailer';

export interface MailOptions extends Omit<MailerOptions, 'template'> {
    from: Address;
}

@Module({})
@Global()
export class MailModule {
    static forRoot(options: MailOptions): DynamicModule {
        return {
            module: MailModule,
            imports: [
                MailerModule.forRoot({
                    ...options,
                    template: {
                        dir: join(
                            __dirname,
                            '..',
                            '..',
                            '..',
                            'email-templates',
                        ),
                        adapter: new HandlebarsAdapter(),
                        options: {
                            strict: true,
                        },
                    },
                }),
            ],
            providers: [
                MailService,
                {
                    provide: 'OPTIONS',
                    useValue: options,
                },
            ],
            exports: [MailService],
        };
    }
}
