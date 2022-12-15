import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as RequestIp from '@supercharge/request-ip';

export const IP = createParamDecorator((opt, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const ip = RequestIp.getClientIp(request);

    return (
        ip.match(/((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}/)?.[0] ??
        request.ip
    );
});
