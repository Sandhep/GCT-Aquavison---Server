import db from '../services/firestoreService'; 

const plantDetails = {
    Pump_State: 'OFF',
    Device_status: 'Offline',
    Timer: 'DISABLED',
    Plant_mode: 'AUTO',
    bt_state: 'SAVED',
};

const sensorData = [
    { sensor_name: 'OHT_Float', sensor_data: 'OFF' },
    { sensor_name: 'UGT_Float', sensor_data: 'OFF' }  
];

const timerData = [
    { session_name: 'starttime', session_time: '00:00' },
    { session_name: 'endtime', session_time: '00:00' }  
];

const checkAndCreateDocument = async (collection, docId, data) => {
    try {
        const docRef = db.collection(collection).doc(docId);
        const doc = await docRef.get();

        if (!doc.exists) {
            // Document does not exist, create it
            await docRef.set(data);
            console.log(`Document ${docId} created in collection ${collection}.`);
        } else {
            console.log(`Document ${docId} already exists in collection ${collection}.`);
        }
    } catch (error) {
        console.error(`Error checking or creating document in ${collection}:`, error);
    }
};

const initializeFirestoreData = async () => {
    try {
        // Check and create plant details document
        await checkAndCreateDocument('plantdetails', 'plantdata', plantDetails);

        // Check and create sensor data documents
        for (const sensor of sensorData) {
            await checkAndCreateDocument('sensordata', sensor.sensor_name, sensor);
        }

        // Check and create timer data documents
        for (const timer of timerData) {
            await checkAndCreateDocument('timerdata', timer.session_name, timer);
        }

    } catch (error) {
        console.error('Error initializing Firestore data:', error);
    }
};

// Export the initialization function
export default initializeFirestoreData;
