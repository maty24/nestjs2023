import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';



export const RawHeaders = createParamDecorator(
    ( data: string, ctx: ExecutionContext ) => {
       

        //estoy obteneindo los rawheaders
        const req = ctx.switchToHttp().getRequest();
        return req.rawHeaders;
    }
);