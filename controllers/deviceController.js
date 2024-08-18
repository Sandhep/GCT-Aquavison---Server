import { getFirestoreDocument, updateFirestoreDocument } from '../services/firestoreService.js';
import { publish } from '../services/mqttService.js';

export const controlPump = async (data,io) => {
    console.log("Received Pump_State:", data);
    io.emit("Received_PumpState", data);
    publish('Pumphouse/Switch/Pump_State', data.Pump_State, { retain: true });
    const state = data.Pump_State;
    await updateFirestoreDocument('plantdetails', 'plantdata', { Pump_State: state });
};

export const autocontrol = async (io)=>{

    const plantData = await getFirestoreDocument('plantdetails', 'plantdata');
    const timerData = await getFirestoreDocument('timerdata', 'sessionname');
    const sensorData = await getFirestoreDocument('sensordata', 'sensorname');

    const data = {
        Timer: plantData?.Timer,
        Plant_mode: plantData?.Plant_mode,
        starttime: timerData?.starttime,
        endtime: timerData?.endtime,
        timerout:timerData?.timerout,
        OHT_Float: sensorData?.OHT_Float,
        UGT_Float: sensorData?.UGT_Float
    };
    
    var autoout = "OFF";

    if(data.OHT_Float == "ON" && data.UGT_Float == "OFF"){
         autoout = "ON";
    }

    if(data.Timer=="ENABLED" && data.Plant_mode == "AUTO"){
        if(data.timerout == "ON" && autoout == "ON"){
            controlPump({Pump_State:"ON"},io);
        }else{
            controlPump({Pump_State:"OFF"},io);
        }
    }else if(data.Timer == "ENABLED" && data.Plant_mode == "MANUAL"){
        if(data.timerout == "ON"){
            controlPump({Pump_State:"ON"},io);
        }else{
            controlPump({Pump_State:"OFF"},io);
        }
    }else if(data.Plant_mode == "AUTO" && data.Timer == "DISABLED"){
        if(autoout == "ON"){
            controlPump({Pump_State:"ON"},io);
        }else{
            controlPump({Pump_State:"OFF"},io);
        }
    }
}