const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const taskRoutes = require('./routes/tasks');
const Task = require('./models/Task');
const cron = require('node-cron');
const notifier = require('node-notifier'); // For desktop notifications

// Initialize Express app
const app = express();

// Define the port, use the environment variable PORT or default to 3000
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
mongoose.connect('mongodb+srv://DhahiraShreenAdmin:aO2rqlDce5P1t0Lb@cluster0.jkn23.mongodb.net/TodoList?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));


// Routes
app.use('/api', taskRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, 'frontend')));

// Default route to serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start the server
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
