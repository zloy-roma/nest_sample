import { applyDecorators, SerializeOptions } from '@nestjs/common';

export const SerializeGroups = (...groups) =>
    applyDecorators(
        SerializeOptions({
            groups,
        }),
    );
