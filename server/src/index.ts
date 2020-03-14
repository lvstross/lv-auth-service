import "dotenv/config";
import "reflect-metadata";
import {createConnection} from "typeorm";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { UserResolver } from "./UserResolver";


(async () => {
    const app = express();

    app.get('/', (_, res) => res.send('hello'));

    await createConnection();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver]
        }),
        context: ({ req, res }) => ({ req, res })
    });

    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log('express server started');
    });
})()
