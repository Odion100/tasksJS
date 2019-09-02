const {
  //Import these pre-created objects for convenient object destructuring
  //These are the main utilities for app development
  App,
  Client,
  LoadBalancer,
  ServerModule,
  Service,
  //Import all factory functions themselves
  TasksJSApp,
  TasksJSLoadBalancer,
  TasksJSServerModule,
  TasksJSServer,
  TasksJSService,
  TasksJSClient,
  TasksJSModule,
  TasksJSServerManager
} = require("../index")();

//import tests all wrapped in functions that take test data as
//parameters and return the tests as an executable function
const ClientServerTest = require("./units/ClientServer");
const ModuleTest = require("./units/Module");
const ServerManagerTest = require("./units/ServerManager");
const ServiceServerModuleTest = require("./units/ServerModuleService");

/* describe(
  "TasksJSClient && TasksJSServer Tests",
  ClientServerTest(TasksJSClient, TasksJSServer)
);

describe("TasksJSModule", ModuleTest(TasksJSModule));

describe(
  "TasksJSServerManager",
  ServerManagerTest(TasksJSServerManager, Client)
); */

describe(
  "TasksJSServerModule && TasksJSService Tests",
  ServiceServerModuleTest(TasksJSServerModule, TasksJSService, Client)
);
