const express = require('express');
const { createClient } = require('redis');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server);

const client = createClient({ url: 'redis://localhost:6379' });

client.connect().catch((err) => {
    console.error('Error connecting to Redis:', err);
    process.exit(1);
});

const pubsub = client.duplicate();

pubsub.connect().catch((err) => {
    console.error('Error connecting to Redis pubsub:', err);
    process.exit(1);
});

function messageHandler(message) {
    const data = JSON.parse(message);
    console.log(`Received message from ${data.user}: ${data.text}`);
    
    io.emit('notification', data);
}

const channelName = 'chat_room';
pubsub.subscribe(channelName, (message) => {
    messageHandler(message);
}).catch((err) => {
    console.error('Error subscribing to channel:', err);
});

app.post('/notify', async (req, res) => {
    const { user, text, type } = req.body; 

    if (!user || !text || !type) {
        return res.status(400).json({ error: 'User, text, and type are required' });
    }

    const message = { user, text, type };
    await client.publish(channelName, JSON.stringify(message));

    res.status(200).json({ success: true, message: 'Notification sent' });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html'); 
});

server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});


process.on('SIGINT', async () => {
    await pubsub.unsubscribe(channelName);
    await pubsub.disconnect();
    await client.disconnect();
    process.exit();
});
