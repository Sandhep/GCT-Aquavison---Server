import mqtt from 'mqtt';
import dotenv from 'dotenv';

dotenv.config();

const options = {
    host: process.env.MQTT_HOST,
    port: parseInt(process.env.MQTT_PORT, 10),
    protocol: process.env.MQTT_PROTOCOL,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    qos: parseInt(process.env.MQTT_QOS, 10)
};

const client = mqtt.connect(options);

client.on('connect', () => {
    console.log('Connected to the MQTT Broker');
});

client.on('error', (error) => {
    console.error(`MQTT connection error: ${error.message}`);
});

export const subscribe = (topic) => {
    client.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
            console.error(`Failed to subscribe to ${topic}: ${err.message}`);
        } else {
            console.log(`Subscribed to ${topic}`);
        }
    });
};

export const publish = (topic, message, options = {}) => {
    client.publish(topic, message, options, (err) => {
        if (err) {
            console.error(`Failed to publish message to ${topic}: ${err.message}`);
        } else {
            console.log(`Message published to ${topic}`);
        }
    });
};

export const onMessage = (callback) => {
    client.on('message', callback);
};
