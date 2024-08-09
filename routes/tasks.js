const express = require('express');
const Task = require('../models/Task');
const router = express.Router();

// Create a new task
router.post('/tasks', async (req, res) => {
    try {
        const task = new Task(req.body);
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get all tasks
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.status(200).send(tasks);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get a task by ID
router.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findById(_id);
        if (!task) {
            return res.status(404).send();
        }
        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a task by ID
router.patch('/tasks/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'deadline', 'completed'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }



    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).send();
        }

        updates.forEach(update => (task[update] = req.body[update]));
        await task.save();
        res.status(200).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a task by ID
router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).send();
        }

        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});
// Delete all tasks
router.delete('/tasks', async (req, res) => {
    try {
        await Task.deleteMany({});
        res.status(200).send({ message: 'All tasks deleted' });
    } catch (error) {
        res.status(500).send(error);
    }
});
// Search for tasks by description
router.get('/tasks/search/:query', async (req, res) => {
    const query = req.params.query;
    try {
        const tasks = await Task.find({ description: new RegExp(query, 'i') });
        res.status(200).send(tasks);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
