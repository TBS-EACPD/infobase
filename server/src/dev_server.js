import { execSync } from "child_process";

import { app, start_apollo } from "./app.js";

const DEV_PORT = 1337;
app.set("port", DEV_PORT);

const start_server = () =>
  app.listen(DEV_PORT, async () => {
    await start_apollo();
    console.log(`GraphQL Server Running at http://127.0.0.1:${DEV_PORT}`);
  });

const is_dev_port_free = () => {
  try {
    execSync(`lsof -i :${DEV_PORT}`);
    return false;
  } catch {
    return true;
  }
};

const start_server_when_port_is_free = (retries = 4) => {
  if (is_dev_port_free()) {
    start_server();
  } else if (retries > 0) {
    setTimeout(() => start_server_when_port_is_free(retries - 1), 500);
  } else {
    throw new Error(`Port :${DEV_PORT} already in use!`);
  }
};

start_server_when_port_is_free();
