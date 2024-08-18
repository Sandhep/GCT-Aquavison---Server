import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = {
    "type": "service_account",
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": process.env.FIREBASE_AUTH_URI,
    "token_uri": process.env.FIREBASE_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL
};

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

// Firestore Schemas
const plantDetails = {
    Pump_State: 'OFF',
    Device_status: 'ACTIVE',
    Timer: 'DISABLED',
    Plant_mode: 'AUTO',
    bt_state: 'DISCONNECTED',
};

const sensorData = [
    { sensor_name: 'OHT_Float', sensor_data: 'OFF' }, // Updated to ON/OFF states
    { sensor_name: 'UGT_Float', sensor_data: 'OFF' }  // Updated to ON/OFF states
];

const timerData = [
    { session_name: 'starttime', session_time: '00:00' },
    { session_name: 'endtime', session_time: '23:59' }  // Assuming endtime should be present
];

//utility functions 

export const updateFirestoreDocument = async (collection, doc, data) => {
    try {
        await db.collection(collection).doc(doc).update(data);
        console.log(`Document ${doc} in collection ${collection} updated successfully`);
    } catch (error) {
        console.error(`Error updating Firestore document: ${error.message}`);
    }
};

export const getFirestoreDocument = async (collection, doc) => {
    try {
        const document = await db.collection(collection).doc(doc).get();
        return document.data();
    } catch (error) {
        console.error(`Error reading Firestore document: ${error.message}`);
        return null;
    }
};

// Check and Create Documents
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

// Initialize Firestore Data
export const initializeFirestoreData = async () => {
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

export default db;
