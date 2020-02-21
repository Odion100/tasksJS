"use strict";
const loadConnectionData = require("./components/loadConnectionData");
const SocketDispatcher = require("./components/SocketDispatcher");
const ServiceModule = require("./components/ServiceModule");

module.exports = function TasksJSService() {
  const loadedServices = {};
  return async function ServiceFactory(url, options = {}) {
    if (loadedServices[url] && !options.forceReload) return loadedServices[url];

    const connData = await loadConnectionData(url, options);
    const Service = SocketDispatcher.apply(this || {}, [connData.namespace]);

    Service.resetConnection = async cb => {
      const { modules, host, port, namespace } = await loadConnectionData(url, options);

      SocketDispatcher.apply(Service, [namespace]);

      modules.forEach(({ namespace, route, name }) =>
        Service[name].__setConnection(host, port, route, namespace)
      );

      if (typeof cb === "function") cb();
    };

    connData.modules.forEach(
      mod => (Service[mod.name] = ServiceModule(mod, connData, Service.resetConnection))
    );

    Service.on("disconnect", Service.resetConnection);
    loadedServices[url] = Service;
    return Service;
  };
};
