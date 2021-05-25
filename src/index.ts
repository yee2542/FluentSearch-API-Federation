import { ApolloServer } from "apollo-server";
import { ApolloGateway } from "@apollo/gateway";

const gateway = new ApolloGateway({
  serviceList: [{ name: "bff", url: "http://localhost:5000/graphql" }],
});

const server = new ApolloServer({
  gateway,
  subscriptions: false,
  cors: {
    origin: "*",
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
