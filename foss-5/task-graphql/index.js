const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const cors = require("cors");

let tasks = [
  {
    id: "1",
    title: "Complete Project",
    description: "Finish the task management API",
    status: "IN_PROGRESS",
    assignee: "Vishnu",
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
  {
    id: "2",
    title: "Review Code",
    description: "Review pull requests",
    status: "PENDING",
    assignee: "Kavin",
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
];

const typeDefs = `
  type Task {
    id: ID!
    title: String!
    description: String
    status: TaskStatus!
    assignee: String
    createdAt: String!
    updatedAt: String
  }

  enum TaskStatus {
    PENDING
    IN_PROGRESS
    COMPLETED
  }

  type Query {
    tasks: [Task!]!
    task(id: ID!): Task
    tasksByStatus(status: TaskStatus!): [Task!]!
  }

  type Mutation {
    createTask(title: String!, description: String, assignee: String): Task!
    updateTask(id: ID!, title: String, description: String, status: TaskStatus, assignee: String): Task
    deleteTask(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    tasks: () => tasks,
    task: (_, { id }) => tasks.find((task) => task.id === id),
    tasksByStatus: (_, { status }) =>
      tasks.filter((task) => task.status === status),
  },
  Mutation: {
    createTask: (_, { title, description, assignee }) => {
      const newTask = {
        id: String(tasks.length + 1),
        title,
        description,
        status: "PENDING",
        assignee,
        createdAt: new Date().toISOString(),
        updatedAt: null,
      };
      tasks.push(newTask);
      return newTask;
    },
    updateTask: (_, { id, ...updates }) => {
      const taskIndex = tasks.findIndex((task) => task.id === id);
      if (taskIndex === -1) return null;
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return tasks[taskIndex];
    },
    deleteTask: (_, { id }) => {
      const initialLength = tasks.length;
      tasks = tasks.filter((task) => task.id !== id);
      return tasks.length !== initialLength;
    },
  },
};

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

async function startServer() {
  await server.start();

  app.use(cors());
  app.use(express.json());
  app.use("/graphql", expressMiddleware(server));

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}/graphql`);
  });
}

startServer();
