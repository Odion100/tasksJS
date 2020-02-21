const TasksJSServerManager = require("../ServerManager/ServerManager");

module.exports = function TasksJSServerModule() {
  const ServerManager = TasksJSServerManager();

  function ServerModuleFactory(name, constructor) {
    const ServerModule =
      typeof constructor === "object" && constructor instanceof Object ? constructor : {};

    const reserved_methods = Object.getOwnPropertyNames(ServerModule);

    if (typeof constructor === "function") {
      if (constructor.constructor.name === "AsyncFunction")
        throw `(ServerModule Error): ServerModule(name, constructor) function requires a non-async function as the constructor`;
      else constructor.apply(ServerModule, []);
    }

    ServerManager.addModule(name, ServerModule, reserved_methods);

    return ServerModule;
  }

  ServerModuleFactory.startService = ServerManager.startService;
  return ServerModuleFactory;
};
