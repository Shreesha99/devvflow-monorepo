const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to websocket:", socket.id);
});

socket.on("task.updated", (data) => {
  console.log("TASK UPDATED");
  console.log(data);
});

socket.on("activity.created", (data) => {
  console.log("ACTIVITY CREATED");
  console.log(data);
});
