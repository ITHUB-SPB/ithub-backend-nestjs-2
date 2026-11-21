import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

const AuthToken = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.headers.authorization;
    },
);

export default AuthToken