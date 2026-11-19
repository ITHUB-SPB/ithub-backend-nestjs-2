import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import type { App } from "supertest/types.js";

export const registerHelper = async (
    app: INestApplication<App>,
    uid: number
) => {
    return await request(app.getHttpServer())
        .post("/api/users")
        .send({
            user: {
                username: `auth_${uid}`,
                email: `auth_${uid}@test.com`,
                password: `password123`
            }
        })
}

export const loginHelper = async (
    app: INestApplication<App>,
    uid: number
) => {
    return await request(app.getHttpServer())
        .post("/api/users/login")
        .send({
            user: {
                email: `auth_${uid}@test.com`,
                password: `password123`
            }
        })
}
