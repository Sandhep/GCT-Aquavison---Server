import express from 'express';
import { getFirestoreDocument } from '../services/firestoreService.js';

const router = express.Router();

router.get('/plantdetails', async (req, res) => {
    const data = await getFirestoreDocument('plantdetails', 'plantdata');
    res.json(data);
});

router.get('/timerdata', async (req, res) => {
    const data = await getFirestoreDocument('timerdata', 'sessionname');
    res.json(data);
});

router.get('/sensordata', async (req, res) => {
    const data = await getFirestoreDocument('sensordata', 'sensorname');
    res.json(data);
});

router.get('/ping',async(req, res)=>{
   const data = "This is to monitor the server Uptime !";
   res.send(data);
})

export default router;
