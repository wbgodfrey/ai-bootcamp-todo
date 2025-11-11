// In-memory storage (will reset on cold starts)
let tasks = [];

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { method, query, body } = req;

    try {
        // GET all tasks
        if (method === 'GET') {
            return res.status(200).json(tasks);
        }

        // POST - Add new task
        if (method === 'POST') {
            const newTask = {
                id: Date.now(),
                text: body.text,
                completed: false
            };
            tasks.push(newTask);
            return res.status(200).json(newTask);
        }

        // PUT - Update task
        if (method === 'PUT') {
            const taskId = parseInt(query.id);
            const taskIndex = tasks.findIndex(t => t.id === taskId);

            if (taskIndex === -1) {
                return res.status(404).json({ error: 'Task not found' });
            }

            if (body.text !== undefined) {
                tasks[taskIndex].text = body.text;
            }
            if (body.completed !== undefined) {
                tasks[taskIndex].completed = body.completed;
            }

            return res.status(200).json(tasks[taskIndex]);
        }

        // DELETE - Remove task
        if (method === 'DELETE') {
            const taskId = parseInt(query.id);
            const initialLength = tasks.length;
            tasks = tasks.filter(t => t.id !== taskId);

            if (tasks.length === initialLength) {
                return res.status(404).json({ error: 'Task not found' });
            }

            return res.status(200).json({ success: true });
        }

        // Method not allowed
        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
