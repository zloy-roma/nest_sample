import { HttpException } from '@nestjs/common';

export class JwtTokensException extends HttpException {
    constructor(code: string) {
        super(code, 500);
    }
}
