import { HttpException } from '@nestjs/common';

export enum RecaptchaResponse {
    'missing-input-secret' = 'The secret parameter is missing.',
    'invalid-input-secret' = 'The secret parameter is invalid or malformed.',
    'missing-input-response' = 'The response parameter is missing.',
    'invalid-input-response' = 'The response parameter is invalid or malformed.',
    'bad-request' = 'The request is invalid or malformed.',
    'timeout-or-duplicate' = 'The response is no longer valid: either is too old or has been used previously.',
    'invalid-keys' = 'The secret parameter is wrong.',
    'invalid-hostname' = 'User hostname is invalid',
}

export class RecaptchaException extends HttpException {
    constructor(codes: (keyof RecaptchaResponse)[]) {
        super(
            codes.map((code) => ({
                code,
                error: RecaptchaResponse[code],
            })),
            500,
        );
    }
}
