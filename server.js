const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const taskRoutes = require('./routes/tasks');
const Task = require('./models/Task');
const cron = require('node-cron');
const notifier = require('node-notifier'); // For desktop notifications

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/todo-app');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Routes
app.use('/api', taskRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, 'frontend')));

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

// Cron job to check deadlines every minute
cron.schedule('* * * * *', async () => {
    const now = new Date();
    try {
        const overdueTasks = await Task.find({ deadline: { $lte: now }, completed: false });
        overdueTasks.forEach(task => {
            notifier.notify({
                title: 'Task Deadline Reached',
                message: `Task: ${task.description} is overdue!`,
                wait: true
            });
            console.log(`Notification sent for task: ${task.description}`);
        });
    } catch (error) {
        console.error('Error checking overdue tasks:', error);
    }
});
