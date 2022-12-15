import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';
import { AppException } from './app.exception';
import { RuErrors } from './ru-errors.translate';

@Catch()
export class ErrorsFilter implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse();

        if (exception instanceof AppException) {
            return response
                .status(exception.getStatus())
                .json(exception.getResponse());
        }

        console.log(exception);

        if (exception instanceof HttpException) {
            const status = exception.getStatus() ?? 500;
            return response
                .status(status)
                .json(new AppException(RuErrors[status], status).getResponse());
        }

        if (exception['status']) {
            return response
                .status(exception['status'])
                .json(
                    new AppException(
                        RuErrors[exception['status']],
                        exception['status'],
                    ),
                );
        }

        return response
            .status(500)
            .json(new AppException(RuErrors[500], 500).getResponse());
    }
}
