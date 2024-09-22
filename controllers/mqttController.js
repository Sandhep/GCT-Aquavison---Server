import { subscribe, onMessage, publish } from '../services/mqttService.js';
import { updateFirestoreDocument } from '../services/firestoreService.js';
import { autocontrol } from './deviceController.js';

export const initializeMqtt = (io) => {
    const topics = [
        'Pumphouse/LWT/Status',
        'Pumphouse/Sensor',
        'Pumphouse/Status',
        'Pumphouse/ManualSwitch/Pump_State'
    ];

    topics.forEach(topic => subscribe(topic));

    onMessage(async (topic, message) => {
        const data = message.toString();
        console.log(`Received message from ${topic}: ${data}`);

        switch (topic) {
            case 'Pumphouse/LWT/Status':
            case 'Pumphouse/Status':
                io.emit('Device_status', { device_status: data });
                await updateFirestoreDocument('plantdetails', 'plantdata', { Device_status:data });
                break;
            case 'Pumphouse/ManualSwitch/Pump_State':
                io.emit('Received_PumpState', { Pump_State: data });
                await updateFirestoreDocument('plantdetails', 'plantdata', { Pump_State: data });
                break;
            case 'Pumphouse/Sensor':
                const sensorData = JSON.parse(data);
                io.emit('Sensordata', sensorData);
                await updateFirestoreDocument('sensordata', 'sensorname', { OHT_Float: sensorData.OHT_Float });
                await updateFirestoreDocument('sensordata', 'sensorname', { UGT_Float: sensorData.UGT_Float });
                await autocontrol(io);
                break;
            case 'Pumphouse/Sensor/OHT_Float':
                const Data1 = await getFirestoreDocument('sensordata', 'sensorname');
                io.emit('Sensordata', {
                    OHT_Float:data,
                    UGT_Float:Data1.UGT_Float
                });
                await updateFirestoreDocument('sensordata', 'sensorname', { OHT_Float: sensorData.OHT_Float });
                await autocontrol(io);
                break;
            case 'Pumphouse/Sensor/UGT_Float':
                const Data2 = await getFirestoreDocument('sensordata', 'sensorname');
                io.emit('Sensordata', {
                    UGT_Float:data,
                    OHT_Float:Data2.OHT_Float
                });
                await updateFirestoreDocument('sensordata', 'sensorname', { UGT_Float: sensorData.UGT_Float });
                await autocontrol(io);
                break;
            default:
                break;
        }
    });
};
