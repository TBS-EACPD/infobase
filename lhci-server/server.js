/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
"use strict";

const { createServer } = require("@lhci/server");
const port = process.env.PORT || 3338;
const db_url =
  process.env.DATABASE_URL ||
  "postgres://euxyxgbbklroqe:9225c557b0c00c15d0c780a86d96dae157261f5ec600a4d7eaea967b31e44248@ec2-52-202-146-43.compute-1.amazonaws.com:5432/dd9g3q7ldv93et";

createServer({
  port: port,
  storage: {
    storageMethod: "sql",
    sqlDialect: "postgres",
    sqlConnectionSsl: true,
    sqlConnectionUrl: db_url,
  },
}).then(({ port }) => console.log("Listening on port", port));
