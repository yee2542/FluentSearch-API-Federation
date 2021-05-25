import { ApolloServer } from "apollo-server";
import { ApolloGateway, RemoteGraphQLDataSource } from "@apollo/gateway";

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    request.http.headers.set("cookie", context.cookie);
  }
}

const gateway = new ApolloGateway({
  serviceList: [
    {
      name: "bff",
      url: process.env.BFF_ENDPOINT || "http://localhost:5000/graphql",
    },
  ],
  buildService: ({ url }) => {
    return new AuthenticatedDataSource({ url });
  },
});

const server = new ApolloServer({
  gateway,
  subscriptions: false,
  introspection: true,
  playground: {
    settings: {
      "request.credentials": "include",
    },
  },
  engine: { sendHeaders: { all: true } },
  cors: {
    origin: new RegExp(process.env.ORIGIN || ".*"),
    credentials: true,
  },
  context: (ctx) => {
    return {
      ...ctx,
      cookie: ctx.req.headers.cookie,
    };
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
