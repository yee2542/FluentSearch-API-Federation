import { ApolloServer } from "apollo-server";
import { ApolloGateway } from "@apollo/gateway";

const gateway = new ApolloGateway({
  serviceList: [
    {
      name: "bff",
      url: process.env.BFF_ENDPOINT || "http://localhost:5000/graphql",
    },
  ],
});

const server = new ApolloServer({
  gateway,
  subscriptions: false,
  cors: {
    origin: new RegExp(process.env.ORIGIN || ".*"),
    credentials: true,
  },
  context: ({ req, res, connection }) => ({
    req,
    res,
    connection,
  }),
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
