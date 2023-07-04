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
          "GET /lists": "lists.getLists", // Get all tasks
          "POST /list": "lists.createList", // Create a new task
       
        }
      }
    ]
  }
});

// Create the broker instance for node-2
const brokerNode2 = new ServiceBroker({
  nodeID: "node-2",
  transporter: "NATS"
});

// Create an empty array to store todos
const lists = [];

// Create the "todos" service
brokerNode2.createService({
  name: "lists",

  actions: {
    getLists() {
      // Return the array of todos
      return lists;
    },

    createList(ctx) {
      // Create a new todo
      const { listName } = ctx.params;
      const newList = { id: generateListId(), listName};
      // Save the new list to the array
      lists.push(newList);
      return newList;
    },

  //    {
  //   "listName": "test",
  //   
  // }


  }
});

// Create an empty array to store todos
const tasks = [];

const brokerNode3 = new ServiceBroker({
  nodeID: "node-3",
  transporter: "NATS"
});

brokerNode3.createService({
  name: "tasks",

  actions: {
    listTasks() {
      // Return the array of todos
      return tasks;
    },

    createTask(ctx) {
      // Create a new todo
      const { text } = ctx.params;
      const newTask = { id: generateTaskId(), text, completed: false };
      // Save the new todo to the array
      tasks.push(newTask);
      return newTask;
    },

  //    {
  //   "text": "test",
  //   "completed": false
  // }


  }
});

// Start both brokers
Promise.all([brokerNode1.start(), brokerNode2.start(), brokerNode3.start()]);

// Helper function to generate a unique ID for a new todo
function generateTaskId() {

  const uniqueId = uuidv4();
  return uniqueId;
}

function generateListId() {

  const uniqueId = uuidv4();
  return uniqueId;
}
