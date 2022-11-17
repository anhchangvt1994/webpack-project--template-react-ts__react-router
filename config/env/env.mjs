import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import ObjToEnvConverter from "../libs/object-to-env-converter.js";
import API_ENV, { PREFIX as API_PREFIX } from "../../env/env.api.mjs";
import PROJECT_ENV, {
  PREFIX as PROJECT_PREFIX,
} from "../../env/env.project.mjs";
import ROUTER_ENV, { PREFIX as ROUTER_PREFIX } from "../../env/env.router.mjs";
import ASSETS_ENV from "../../env/env.assets.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_PATH = __dirname.replace(/\\/g, "/");

const ENV_OBJECT_DEFAULT = {
  PORT: Number(),
  IO_PORT: Number(),
  LOCAL_ADDRESS: String(),
  LOCAL_HOST: String(),
  IPV4_ADDRESS: String(),
  IPV4_HOST: String(),
  IO_HOST: String(),
};
const ENV_OBJ_WITH_JSON_STRINGIFY_VALUE = { ...ENV_OBJECT_DEFAULT };

const generateObjectFormatted = (obj, prefix) => {
  if (!obj || typeof obj !== "object") return {};
  for (const key in obj) {
    let tmpKey = `${prefix ? prefix + "_" : ""}${key.toUpperCase()}`;

    if (typeof obj[key] === "object" && !obj[key].length) {
      for (const childKey in obj[key]) {
        setValueForObject(
          ENV_OBJECT_DEFAULT,
          tmpKey + "_" + childKey.toUpperCase(),
          obj[key][childKey]
        );
        setValueForObject(
          ENV_OBJ_WITH_JSON_STRINGIFY_VALUE,
          tmpKey + "_" + childKey.toUpperCase(),
          JSON.stringify(obj[key][childKey])
        );
      }

      delete obj[key];
    } else {
      setValueForObject(ENV_OBJECT_DEFAULT, tmpKey, obj[key]);
      setValueForObject(
        ENV_OBJ_WITH_JSON_STRINGIFY_VALUE,
        tmpKey,
        JSON.stringify(obj[key])
      );
      delete obj[key];
    }
  }
}; // getObjectWithPrefix()

const setValueForObject = (obj, key, value) => {
  if (!typeof obj === "object" || !key) return;
  obj[key] = value;
}; // setValueForObject()

// NOTE - First step is generate object formatted
generateObjectFormatted(API_ENV, API_PREFIX);
generateObjectFormatted(PROJECT_ENV, PROJECT_PREFIX);
generateObjectFormatted(ROUTER_ENV, ROUTER_PREFIX);
generateObjectFormatted(ASSETS_ENV);
// End Region

const promiseENVWriteFileSync = new Promise(function (resolve) {
  try {
    fs.writeFileSync(
      `${PROJECT_PATH}/.env`,
      ObjToEnvConverter(ENV_OBJECT_DEFAULT)
    );
    fs.writeFileSync(
      `${PROJECT_PATH}/env.json`,
      JSON.stringify(ENV_OBJ_WITH_JSON_STRINGIFY_VALUE)
    );

    resolve("done");
  } catch {}
});

export {
  ENV_OBJECT_DEFAULT,
  ENV_OBJ_WITH_JSON_STRINGIFY_VALUE,
  promiseENVWriteFileSync,
};
