import { createServer } from "http";
import { Server } from "socket.io";
import app from './app.js';
import { initializeMqtt } from './controllers/mqttController.js';
import { handleSocketConnection } from './controllers/socketController.js';
import {startTimerJobs} from './services/timerService.js';
import {autocontrol} from './controllers/deviceController.js'
import dotenv from 'dotenv';

dotenv.config();

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.ORIGIN
    }
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Initialize MQTT
initializeMqtt(io);

//Handle Timer Jobs
await startTimerJobs(io);

//Handle Auto Control
await autocontrol(io);

// Handle Socket connections
io.on('connection', (socket) => {
    handleSocketConnection(socket, io);
});
