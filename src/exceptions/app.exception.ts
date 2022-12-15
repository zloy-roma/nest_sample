import { HttpException } from '@nestjs/common';

export enum ErrorCodes {
    Not_Authorized = 'notAuthorized',
}

export class AppException extends HttpException {
    constructor(
        error: string = 'Неизвестная ошибка',
        status: number = 500,
        code?: ErrorCodes,
    ) {
        super(
            {
                error,
                status,
                code,
            },
            status,
        );
    }
}
