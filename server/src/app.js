import { ApolloServer } from "apollo-server-express";
import body_parser from "body-parser";
import compression from "compression";
import cors from "cors";
import express from "express";
import expressGraphQL from "express-graphql";
import depthLimit from "graphql-depth-limit";

import { connect_db, get_db_connection_status } from "./db_utils.js";
import { create_models, getSchemaDeps } from "./models/index.js";
import {
  convert_GET_with_query_to_POST,
  get_log_objects_for_request,
} from "./server_utils.js";

create_models();

connect_db().catch((err) => {
  console.error(err);
  // just logging, not trying to recover here. DB connection is reattempted per-request below
});

const app = express();

//TODO: figure out if we need this anymore, since apollo seems to work without it?
// app.use(body_parser.json({ limit: "50mb" }));
app.use(compression());
app.use(
  cors({
    origin: "*",
    methods: ["POST", "GET"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Content-Length",
      "X-Requested-With",
      "gql-query",
    ],
  })
);

app.use(function (req, res, next) {
  res.header("cache-control", "public, max-age=31536000");

  // Often want to use GET to leverage http caching, but query batching is not supported by GET parameters
  // Instead, the client makes a GET with a header containing the query
  // For caching, we also add a hash of the query as a GET parameter
  // Since apollo isn't expecting this type of request, we mutate it to make it look like a normal POST request
  if (req.method === "GET" && !_.isEmpty(req.headers["gql-query"])) {
    console.log(`Request type: ${req.originalUrl}, GET with query header`);
    convert_GET_with_query_to_POST(req); // mutates req, changes made persist to subsequent middleware
  } else {
    console.log(`Request type: ${req.originalUrl}, ${req.method}`);
  }

  if (process.env.USE_REMOTE_DB) {
    get_log_objects_for_request(req).forEach((obj) => {
      console.log(JSON.stringify());
    });
  }

  next();
});

// reassert DB connection
app.use((req, res, next) => {
  if (!_.includes(["connected", "connecting"], get_db_connection_status())) {
    console.warn("Initial MongoDB connection lost, attempting reconnection");
    connect_db().catch(next);
  }

  next();
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Internal server error");
});

async function startApollo() {
  const { typeDefs, resolvers } = getSchemaDeps();
  const server = new ApolloServer({ typeDefs, resolvers });
  //todo: re-implement the following rules
  // graphiql: true,
  // context: {},
  // validationRules: [depthLimit(15)],
  await server.start();
  server.applyMiddleware({ app });
  return server;
}

module.exports = { app, startApollo };
