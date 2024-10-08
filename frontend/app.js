const form = document.getElementById('task-form');
const searchForm = document.getElementById('search-form');
const updateForm = document.getElementById('update-form');
const tasksList = document.getElementById('tasks');

const apiUrl = 'https://to-do-list-app-roum.onrender.com/api/tasks';

const fetchTasks = async (query = '') => {
    const response = await fetch(query ? `${apiUrl}/search/${query}` : apiUrl);
    const tasks = await response.json();
    
    tasksList.innerHTML = '';  // Clear the task list

    // Create list items for each task
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = `${task.description} (Deadline: ${new Date(task.deadline).toLocaleString()})`;
        li.style.textDecoration = task.completed ? 'line-through' : 'none';

        // Single click: Enable update form
        li.addEventListener('click', () => {
            document.getElementById('update-id').value = task._id;
            document.getElementById('update-description').value = task.description;
            
            // Convert the deadline from UTC to local time
            const deadlineUTC = new Date(task.deadline);
            const localDeadline = new Date(deadlineUTC.getTime() - deadlineUTC.getTimezoneOffset() * 60000);
            document.getElementById('update-deadline').value = localDeadline.toISOString().slice(0, 16);
            
            updateForm.style.display = 'block';
        });

        // Double click: Strike through to mark completed or uncompleted
        li.addEventListener('dblclick', async () => {
            await fetch(`${apiUrl}/${task._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ completed: !task.completed })
            });
            fetchTasks(); // Refresh the task list
        });

        // Add a delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.style.marginLeft = '10px'; // Add some space between the text and the button
        deleteButton.addEventListener('click', async (e) => {
            e.stopPropagation(); // Prevent triggering the single-click event
            if (confirm('Are you sure you want to delete this task?')) {
                await fetch(`${apiUrl}/${task._id}`, {
                    method: 'DELETE'
                });
                fetchTasks(); // Refresh the task list
            }
        });

        li.appendChild(deleteButton); // Add the delete button to the list item
        tasksList.appendChild(li);    // Add the list item to the task list
    });

    // Add "Delete All Tasks" button if there are tasks
    if (tasks.length > 0) {
        const deleteAllButton = document.createElement('button');
        deleteAllButton.textContent = 'Delete All Tasks';
        deleteAllButton.style.marginTop = '20px'; // Add some space above the button
        deleteAllButton.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete all tasks?')) {
                await fetch(apiUrl, {
                    method: 'DELETE'
                });
                fetchTasks(); // Refresh the task list
            }
        });

        tasksList.appendChild(deleteAllButton); // Add the "Delete All Tasks" button to the list
    }
};

// Add a new task
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('description').value;
    let deadline = new Date(document.getElementById('deadline').value);

    console.log("Original deadline input:", document.getElementById('deadline').value);
    console.log("Original deadline as Date object:", deadline);

    // Convert the deadline to UTC
    const utcDeadline = deadline.toISOString(); // Convert to ISO string which is UTC by default

    console.log("Converted to UTC:", utcDeadline);

    await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description, deadline: utcDeadline })
    });

    form.reset();
    fetchTasks();
});

// Search for tasks
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.getElementById('search-query').value;
    fetchTasks(query);
});

// Update a task
updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('update-id').value;
    const description = document.getElementById('update-description').value;
    let deadline = new Date(document.getElementById('update-deadline').value);

    console.log("Updating task with ID:", id);
    console.log("New deadline input:", deadline);

    // Convert the deadline to UTC
    const utcDeadline = deadline.toISOString(); // Convert to ISO string which is UTC by default

    console.log("Converted to UTC for update:", utcDeadline);

    await fetch(`${apiUrl}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description, deadline: utcDeadline })
    });
    updateForm.style.display = 'none';
    fetchTasks();
});

// Initial fetch
fetchTasks();
