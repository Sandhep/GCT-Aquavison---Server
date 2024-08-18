import { getFirestoreDocument, updateFirestoreDocument } from '../services/firestoreService.js';
import { publish } from '../services/mqttService.js';
import { startTimerJobs } from '../services/timerService.js';
import { autocontrol, controlPump } from './deviceController.js';

export const handleSocketConnection = (socket, io) => {
    fetchData(socket);

    socket.on("PumpState", async (data) => {
        await controlPump(data,io);
    });

    socket.on("Mode", async (data) => {
        io.emit("Received_Mode", data);
        publish('Pumphouse/Mode', data.Plant_mode, { retain: true });
        await updateFirestoreDocument('plantdetails', 'plantdata', { Plant_mode: data.Plant_mode });
        await autocontrol(io);
    });

    socket.on("Timermode", async (data) => {
        io.emit("Received_Timermode", data);
        await updateFirestoreDocument('plantdetails', 'plantdata', { Timer: data.Timer });
        await startTimerJobs(io);
    });

    socket.on("Timerdata", async (data) => {
        io.emit("Received_Timerdata", data);
        await updateFirestoreDocument('timerdata', 'sessionname', { starttime: data.starttime });
        await updateFirestoreDocument('timerdata', 'sessionname', { endtime: data.endtime });
        await updateFirestoreDocument('plantdetails', 'plantdata', { bt_state: data.bt_state });
        await startTimerJobs(io);
        });
    };
    
    const fetchData = async (socket) => {
        try {
            const plantData = await getFirestoreDocument('plantdetails', 'plantdata');
            const timerData = await getFirestoreDocument('timerdata', 'sessionname');
            const sensorData = await getFirestoreDocument('sensordata', 'sensorname');
    
            const data = {
                Pump_State: plantData?.Pump_State,
                device_status: plantData?.Device_status,
                Timer: plantData?.Timer,
                Plant_mode: plantData?.Plant_mode,
                bt_state: plantData?.bt_state,
                starttime: timerData?.starttime,
                endtime: timerData?.endtime,
                OHT_Float: sensorData?.OHT_Float,
                UGT_Float: sensorData?.UGT_Float
            };
    
            socket.emit("connected", data);
        } catch (err) {
            console.error('Error starting socket connection', err);
        }
    };