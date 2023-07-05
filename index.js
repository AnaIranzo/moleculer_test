const { ServiceBroker } = require("moleculer");
const HTTPServer = require("moleculer-web");
const { v4: uuidv4 } = require('uuid');

// Create the broker for node-1
const brokerNode1 = new ServiceBroker({
  nodeID: "node-1",
  transporter: "NATS"
});

// Create the "gateway" service
brokerNode1.createService({
  name: "gateway",
  mixins: [HTTPServer],

  settings: {
    routes: [
      {
        aliases: {
          "GET /tasks": "tasks.listTasks", // Get all tasks
          "POST /task": "tasks.createTask", // Create a new task
          "GET /lists": "lists.getLists", // Get all lists
          "POST /list": "lists.createList", // Create a new list
        }
      }
    ],

    cors: {
      origin: "*", // Set this to your desired origin or list of origins
      methods: ["GET", "POST"], // Set the allowed HTTP methods
      allowedHeaders: ["Content-Type"], // Set the allowed HTTP headers
      exposedHeaders: [], // Set the exposed HTTP headers
      credentials: false, // Set to true if you want to allow credentials (cookies, authorization headers, etc.)
      maxAge: 3600 // Set the max age value (in seconds) for preflight requests
    }
  }
});

// Create the broker instance for node-2
const brokerNode2 = new ServiceBroker({
  nodeID: "node-2",
  transporter: "NATS"
});

// Create an empty array to store lists
const lists = [];

// Create the "lists" service
brokerNode2.createService({
  name: "lists",

  actions: {
    getLists() {
      // Return the array of lists
      return lists;
    },

    createList(ctx) {
      // Create a new list
      const { listName } = ctx.params;
      const newList = { id: generateListId(), listName };
      // Save the new list to the array
      lists.push(newList);
      return newList;
    },
  }
});

// Create an empty array to store tasks
const tasks = [];

const brokerNode3 = new ServiceBroker({
  nodeID: "node-3",
  transporter: "NATS"
});

brokerNode3.createService({
  name: "tasks",

  actions: {
    listTasks() {
      // Return the array of tasks
      return tasks;
    },

    createTask(ctx) {
      // Create a new task
      const { taskName, listId } = ctx.params;
      const newList = lists.find((list) => list.id === listId);

      if (!newList) {
        throw new Error(`List with ID ${listId} not found.`);
      }

      const newTask = { id: generateTaskId(), taskName:taskName, completed: false, listId:listId };
      // Save the new task to the array
      tasks.push(newTask);
      return newTask;
    },
  }
});

// Start both brokers
Promise.all([brokerNode1.start(), brokerNode2.start(), brokerNode3.start()]);

// Helper function to generate a unique ID for a new task
function generateTaskId() {
  const uniqueId = uuidv4();
  return uniqueId;
}

function generateListId() {
  const uniqueId = uuidv4();
  return uniqueId;
}
