import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtSignOptions } from '@nestjs/jwt/dist/interfaces';
import {
    JwtExceptionFactory,
    JwtTokensRegisterOptions,
} from './jwt-tokens.module';
import { createHash } from 'crypto';
import { JwtTokensException } from './jwt-tokens.exception';

type PartialFields<T extends object> = {
    [P in keyof T]?: true | 'hash';
};

type Payload<Type extends string, Entity extends object = undefined> = {
    type: Type;
    fields: {
        [key in keyof Entity]?: key extends keyof Entity ? any : never;
    };
    types: {
        [key in keyof Entity]?: key extends keyof Entity
            ? 'hash' | 'value'
            : never;
    };
};

@Injectable()
export class JwtTokensService {
    constructor(
        @Inject(JwtService)
        private jwtService: JwtService,
        @Inject('OPTIONS')
        private options: JwtTokensRegisterOptions,
    ) {}

    private throwError(error: string | JwtTokensException) {
        const factory: JwtExceptionFactory =
            this.options.exceptionFactory ?? ((error) => error);
        throw factory(
            error instanceof JwtTokensException
                ? error
                : new JwtTokensException(error),
        );
    }

    private hash(value?: string | number | undefined | null | boolean) {
        switch (typeof value) {
            case 'undefined':
            case null:
                return null;
            case 'string':
            case 'number':
            case 'boolean':
                return value
                    ? createHash('sha256')
                          .update(value.toString())
                          .digest('hex')
                    : null;
        }
    }

    async generateToken<Entity extends object, Type extends string>(
        type: Type,
        entity: Entity,
        fields: PartialFields<Entity>,
        options?: JwtSignOptions,
    ): Promise<string> {
        const payload: Payload<Type, Entity> = { type, fields: {}, types: {} };

        for (const key in fields) {
            switch (fields[key]) {
                case true: {
                    payload.fields[key] = entity[key];
                    payload.types[key] = 'value';
                    break;
                }
                case 'hash': {
                    payload.fields[key] = this.hash(entity[key] as string);
                    payload.types[key] = 'hash';
                    break;
                }
            }
        }

        return this.jwtService.signAsync(payload, options).catch((error) => {
            this.throwError(error);
            throw error;
        });
    }

    async verifyToken<Entity extends object, Type extends string>(
        token: string,
        type: Type,
        entity: Entity | ((payload: object) => Entity | Promise<Entity>),
    ): Promise<Entity> {
        const {
            type: tokenType,
            types,
            fields,
        }: Payload<Type, Entity> = await this.jwtService
            .verifyAsync(token)
            .catch((error) => {
                this.throwError(error);
                throw error;
            });

        if (tokenType !== type) {
            this.throwError('Неверный тип токена');
        }

        if (typeof entity === 'function') {
            entity = await entity(fields);
        }

        for (const field in fields) {
            switch (types[field]) {
                case 'hash': {
                    if (
                        fields[field]
                            ? this.hash(entity[field] as string) !==
                              fields[field]
                            : fields[field] !== entity[field]
                    ) {
                        this.throwError('Ошибка при валидации токена');
                    }
                    break;
                }
                case 'value': {
                    if (entity[field] !== fields[field]) {
                        this.throwError('Ошибка при валидации токена');
                    }
                    break;
                }
            }
        }
        return entity;
    }
}
