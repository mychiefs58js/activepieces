import fastify from 'fastify';
import { User } from 'shared';
import { databaseModule } from './database/database-module';
import { authenticationModule } from './authentication/authentication.module';
import {collectionModule} from "./collections/collection.module";
import {StatusCodes} from "http-status-codes";
import {ActivepiecesError} from "./helper/activepieces-error";
import {projectModule} from "./project/project.module";
import {componentsController} from "./components/components.controller";
import {flowModule} from "./flows/flow.module";
import {fileModule} from "./file/file.module";
import {redisClient} from "./database/redis-connection";

declare module 'fastify' {
    export interface FastifyRequest {
        user: User;
    }
}

const app = fastify({
    logger: true
});

app.register(projectModule);
app.register(componentsController);
app.register(collectionModule);
app.register(fileModule);
app.register(flowModule);
app.register(databaseModule);
app.register(authenticationModule);

app.setErrorHandler(function (error, request, reply) {
    if (error instanceof ActivepiecesError) {
        let apError = error as ActivepiecesError;
        reply.status(StatusCodes.BAD_REQUEST).send({
            code: apError.error.code
        })
    }else {
        reply.status(error.statusCode).send(error)
    }
})

const start = async () => {
    try {
        await redisClient.connect();
        await app.listen({ port: 3000 });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

start();