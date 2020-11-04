import express from "express";
import body_parser from "body-parser";
import expressGraphQL from "express-graphql";
import compression from "compression";
import cors from "cors";
import depthLimit from "graphql-depth-limit";

import { create_models, create_schema } from "./models/index.js";
import { connect_db, get_db_connection_status } from "./db_utils.js";
import {
  convert_GET_with_compressed_query_to_POST,
  get_log_object_for_request,
} from "./server_utils.js";

create_models();

connect_db().catch((err) => {
  console.error(err);
  // just logging, not trying to recover here. DB connection is reattempted per-request below
});

const schema = create_schema();
const app = express();

app.use(body_parser.json({ limit: "50mb" }));
app.use(compression());
app.use(cors());

app.use("/", function (req, res, next) {
  res.header("cache-control", "public, max-age=31536000");
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With, encoded-compressed-query"
  );
  if (req.method === "OPTIONS") {
    console.log("Request type: CORS preflight");
    res.sendStatus(200);
  } else {
    // Often want to use GET to leverage http caching, but some of out longer queries are too long for a query parameter
    // Instead, the client makes a GET with a header containing a compressed and base 64 encoded copy of the query (the query parameter becomes a hash, for cache busting)
    // In that case, we mutate the request here to recover the query and let the server pretend it received a normal POST
    if (
      req.method === "GET" &&
      !_.isEmpty(req.headers["encoded-compressed-query"])
    ) {
      console.log(
        `Request type: ${req.originalUrl}, GET with compressed query`
      );
      convert_GET_with_compressed_query_to_POST(req); // mutates req, changes made persist to subsequent middleware
    } else {
      console.log(`Request type: ${req.originalUrl}, ${req.method}`);
    }

    // eslint-disable-next-line no-console
    process.env.USE_REMOTE_DB &&
      console.log(JSON.stringify(get_log_object_for_request(req)));

    next();
  }
});

// reassert DB connection
app.use("/", (req, res, next) => {
  if (!_.includes(["connected", "connecting"], get_db_connection_status())) {
    console.warn("Initial MongoDB connection lost, attempting reconnection");
    connect_db().catch(next);
  }

  next();
});

app.use(
  "/",
  expressGraphQL(() => ({
    graphiql: true,
    schema: schema,
    context: {},
    validationRules: [depthLimit(15)],
  }))
);

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Internal server error");
});

module.exports = app;
