import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Set auth token for this request
    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { method, query, body } = req;

    try {
        // GET all tasks
        if (method === 'GET') {
            const { data, error } = await supabaseClient
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return res.status(200).json(data);
        }

        // POST - Add new task
        if (method === 'POST') {
            const { data, error } = await supabaseClient
                .from('tasks')
                .insert([
                    {
                        user_id: user.id,
                        text: body.text,
                        completed: false
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            return res.status(200).json(data);
        }

        // PUT - Update task
        if (method === 'PUT') {
            const taskId = query.id;
            const updateData = {};

            if (body.text !== undefined) {
                updateData.text = body.text;
            }
            if (body.completed !== undefined) {
                updateData.completed = body.completed;
            }

            const { data, error } = await supabaseClient
                .from('tasks')
                .update(updateData)
                .eq('id', taskId)
                .select()
                .single();

            if (error) throw error;
            if (!data) {
                return res.status(404).json({ error: 'Task not found' });
            }

            return res.status(200).json(data);
        }

        // DELETE - Remove task
        if (method === 'DELETE') {
            const taskId = query.id;

            const { error } = await supabaseClient
                .from('tasks')
                .delete()
                .eq('id', taskId);

            if (error) throw error;
            return res.status(200).json({ success: true });
        }

        // Method not allowed
        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
