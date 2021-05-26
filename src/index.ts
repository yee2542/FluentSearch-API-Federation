import { ApolloGateway, RemoteGraphQLDataSource } from "@apollo/gateway";
import { ApolloServer } from "apollo-server";
class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    request.http.headers.set("cookie", context.cookie);
  }
  didReceiveResponse({ response, request, context }) {
    const responseHeder = response.http.headers;
    if (responseHeder.has("set-cookie")) {
      // hotfix
      const cookie = responseHeder.get("set-cookie");
      const setCookies = cookie.split(",") as string[];
      context.res.setHeader("set-cookie", setCookies);
    }

    return response;
  }
}

const gateway = new ApolloGateway({
  serviceList: [
    {
      name: "bff",
      url: process.env.BFF_ENDPOINT || "http://localhost:5000/graphql",
    },
    {
      name: "admission",
      url: process.env.ADMISSION_ENDPOINT || "http://localhost:3000/graphql",
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
    const { req, res, connection } = ctx;
    return {
      req,
      res,
      cookie: ctx.req.headers.cookie,
      connection,
    };
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
