//App.js provides an interface and lifecycle for loading and creating modules
const Service = require("./Service");
const tjsModule = require("./Module");
const ServerModule = require("./ServerModule");
const LoadBalancer = require("./LoadBalancer");

module.exports = async function App() {
  const app = {};
  const sysObjs = { services: {}, modules: {}, serverMods: {} }; //hash for all loaded Services and modules
  const serviceQueue = [];
  const moduleQueue = [];
  const serverModuleQueue = [];
  const currentService = "";
  const initializer_set = false;
  const configHandler = null;
  const onCompleteHandlers = [];

  //modules need to be initialized only after services have been loaded
  //so we're collect modules, services, and config init functions to be run in
  //a paricular sequence. this is done in the initApp function
  const setInititializer = () => {
    //setTimeout will send the initApp function to the end of the call stack
    if (!initializer_set) {
      initializer_set = true;
      setTimeout(initApp, 1);
    }
  };

  const initApp = async () => {
    //load all services
    await loadServices(serviceQueue);
    //load all modules and serverMods

    if (configHandler) {
      configHandler(() => {
        loadModules();
        //call onCompleteHandlers
        initializationComplete();
      });
    } else {
      loadModules();
      initializationComplete();
    }
  };

  const loadServices = services => {
    const getServices = services.map(service =>
      Promise((resolve, reject) => {
        try {
          //get service
          service.modules = Service(service.url);
          resolve();
        } catch (err) {
          service.connection_error = err;
          service.connection_attemps++;
          //attempt to connect to a service up to ten times
          if (service.connection_attemps < 10)
            return setTimeout(
              () => loadServices[service],
              service.connection_attemps * 1500
            );

          reject(err);

          console.log(
            `(${service.name} Service): Failed To connect after ${
              service.connection_attemps
            } attempts.`
          );
        }
      })
    );
    return Promise.all(getServices);
  };

  const loadModules = () => {
    //first load modules
    moduleQueue.forEach(
      mod => (mod.module = tjsModule(mod.name, mod.constructor, sysObjs))
    );
    //then load each ServerModule
    serverModuleQueue.forEach(ServerModule(mod.name, mod.constructor, sysObjs));
  };

  const initializationComplete = () => {
    onCompleteHandlers.forEach(handler => handler());
  };
  //use ServerManager to initialize the express server that will handle routing
  app.initService = ({ host, port, route, middlewear }) => {
    host = host || "localhost";
    app.route = route;
    app.host = host || "localhost";

    app.server = ServerModule.startServer({ route, port, host, middlewear });
    return app;
  };
  //register a service to be loaded later or load a service and return a service immediately
  app.loadService = (name, { host, port, route, url }) => {
    const url = url || `http://${host}:${port}${route}`;

    sysObjs.services[name] = {
      name,
      url,
      modules: {},
      connection_attemps: 0
    };

    //add the service to the serviceQueue to be loaded later
    serviceQueue.push(sysObjs.services[name]);
    //setup modules to be loaded later
    setInititializer();
    //so that you can chain onLoad behind a loadService method
    currentService = name;
    return app;
  };

  app.onLoad = handler => {
    sysObjs.services[currentService].onLoad = handler;
    return app;
  };

  app.module = (name, constructor) => {
    //register the module to be created later
    sysObjs.modules[name] = {
      name,
      constructor
    };
    //use unshift to ensure modules are placed before serverModules
    moduleQueue.unshift(sysObjs.modules[name]);
    //set initalizer
    setInititializer();
  };

  app.serverModule = (name, constructor) => {
    sysObjs.serverMods[name] = {
      name,
      constructor
    };
    serverModuleQueue.push(sysObjs.serverMods[name]);
    //set initializer
    setInititializer();
  };

  app.config = handler => {
    if (typeof config === "function") configHandler = handler;
  };
  //register onComplete handlers
  app.initComplete = handler => {
    if (typeof handler === "function") onComplete.push(handler);

    return app;
  };

  return app;
};
