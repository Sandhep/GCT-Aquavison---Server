import schedule from 'node-schedule';
import { getFirestoreDocument, updateFirestoreDocument } from './firestoreService.js';
import { autocontrol } from '../controllers/deviceController.js';

export const startTimerJobs = async (io) => {

    const TimeDoc = await getFirestoreDocument('timerdata', 'sessionname');
    const startTime = TimeDoc?.starttime;
    const endTime = TimeDoc?.endtime;

    const plantData = await getFirestoreDocument('plantdetails', 'plantdata');
    if(plantData?.Timer == 'DISABLED'){
        updateFirestoreDocument('timerdata', 'sessionname',{timerout:"OFF"});
        await autocontrol(io);
    } 
    if (startTime && endTime) {
        scheduleJobs(startTime, endTime,io);
    }
};

const scheduleJobs = (starttime, endtime, io) => {
    let [startHour, startMinute] = starttime.split(":");
    let [endHour, endMinute] = endtime.split(':');

    schedule.scheduleJob({ hour: startHour, minute: startMinute, tz: 'Asia/Kolkata' }, async () => {
        const plantData = await getFirestoreDocument('plantdetails', 'plantdata');
        if (plantData?.Timer === 'ENABLED') {
            updateFirestoreDocument('timerdata', 'sessionname',{timerout:"ON"});
            await autocontrol(io);
        }
    });

    schedule.scheduleJob({ hour: endHour, minute: endMinute, tz: 'Asia/Kolkata' }, async () => {
        const plantData = await getFirestoreDocument('plantdetails', 'plantdata');
        if (plantData?.Timer === 'ENABLED') {
            updateFirestoreDocument('timerdata', 'sessionname',{timerout:"OFF"});
            await autocontrol(io);
        }
    });
};
