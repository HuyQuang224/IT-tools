import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createUser, pool } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Thêm CORS để cho phép kết nối từ frontend
app.use(bodyParser.json());
app.use(express.json()); // Sử dụng middleware để parse JSON

// Endpoint đăng ký người dùng
app.post('/api/signup', async (req, res) => {
    console.log('Incoming request to /api/signup:', req.body); // Log dữ liệu nhận được

    const { username, password } = req.body;

    if (!username || !password) {
        console.error('Validation error: Username and password are required');
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const newUser = await createUser(username, password);
        console.log('User created successfully:', newUser); // Log kết quả thành công
        res.status(201).json(newUser);
    } catch (err) {
        console.error('Error during sign up:', err); // Log lỗi chi tiết
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Endpoint đăng nhập người dùng
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    console.log('Login request received:', { username }); // Log dữ liệu nhận được

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const query = `SELECT id, username, is_admin, is_premium FROM ITtool.users WHERE username = $1 AND password = $2`; // Updated query to include is_premium
        const values = [username, password];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = result.rows[0];
        console.log('User logged in successfully:', user); // Log kết quả thành công

        // Generate JWT token
        const token = jwt.sign({ id: user.id, username: user.username }, 'your_secret_key', {
            expiresIn: '1h',
        });

        res.status(200).json({ user, token });
    } catch (err) {
        console.error('Error during login:', err); // Log lỗi chi tiết
        res.status(500).json({ error: 'Failed to log in' });
    }
});

// Endpoint to fetch categories and tools
app.get('/api/categories-with-tools', async (req, res) => {
    try {
        const categoriesRes = await pool.query('SELECT id, name FROM ITtool.categories');
        const categories = categoriesRes.rows;

        // Ensure `route_path` is included in the SELECT query
        const toolsRes = await pool.query('SELECT id, name, category_id, description, route_path, is_premium, is_active FROM ITtool.tools');
        const tools = toolsRes.rows;

        const categoriesWithTools = categories.map((category) => ({
            ...category,
            tools: tools.filter((tool) => tool.category_id === category.id),
        }));

        console.log('Categories with tools:', categoriesWithTools); // Log dữ liệu
        res.status(200).json(categoriesWithTools);
    } catch (err) {
        console.error('Error fetching categories and tools:', err);
        res.status(500).json({ error: 'Failed to fetch categories and tools' });
    }
});

// Endpoint to fetch categories
app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name FROM ITtool.categories');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Endpoint to add a new tool
app.post('/api/add-tool', async (req, res) => {
    const { name, category_id, description, route_path, file_code } = req.body;

    if (!name || !category_id || !description || !route_path || !file_code) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Ensure `route_path` is inserted into the database
        const query = `INSERT INTO ITtool.tools (name, category_id, description, route_path, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        const values = [name, category_id, description, route_path, true];
        const result = await pool.query(query, values);

        // Dynamically create the tool's route using the provided file_code
        const filePath = path.join(__dirname, 'src', 'pages', `${name.replace(/\s+/g, '')}.tsx`);
        fs.writeFileSync(filePath, file_code);

        // Removed JSX from the backend. The backend will only handle database operations and file creation.
        // The frontend will handle dynamic route addition.

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding tool:', err);
        res.status(500).json({ error: 'Failed to add tool' });
    }
});

// Endpoint to fetch tool details
app.get('/api/tool-details', async (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ error: 'Tool name is required' });
    }

    try {
        console.log('Fetching tool details for name:', name); // Log tên tool được gửi
        const query = `SELECT name, description FROM ITtool.tools WHERE LOWER(name) = LOWER($1)`;
        const values = [name];
        const result = await pool.query(query, values);

        console.log('Query result:', result.rows); // Log kết quả truy vấn

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tool not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching tool details:', err);
        res.status(500).json({ error: 'Failed to fetch tool details' });
    }
});

// Endpoint to fetch favorite tools for a specific user
app.get('/api/favorites', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, 'your_secret_key'); // Replace 'your_secret_key' with your actual secret key
        const userId = decoded.id;

        const result = await pool.query(
            `SELECT t.id, t.name, t.description, t.route_path FROM ITtool.favorites f
             JOIN ITtool.tools t ON f.tool_id = t.id
             WHERE f.user_id = $1`,
            [userId]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            console.error('JWT Error:', err.message);
            return res.status(401).json({ error: 'Invalid or malformed token' });
        }
        console.error('Error fetching favorites:', err);
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

// Endpoint to add a tool to favorites
app.post('/api/favorites/:toolId', async (req, res) => {
    const { toolId } = req.params;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, 'your_secret_key'); // Replace 'your_secret_key' with your actual secret key
        const userId = decoded.id;

        await pool.query(
            `INSERT INTO ITtool.favorites (user_id, tool_id) VALUES ($1, $2)`,
            [userId, toolId]
        );
        res.status(201).json({ message: 'Tool added to favorites' });
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            console.error('JWT Error:', err.message);
            return res.status(401).json({ error: 'Invalid or malformed token' });
        }
        console.error('Error adding to favorites:', err);
        res.status(500).json({ error: 'Failed to add to favorites' });
    }
});

// Endpoint to remove a tool from favorites
app.delete('/api/favorites/:toolId', async (req, res) => {
    const { toolId } = req.params;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, 'your_secret_key'); // Replace 'your_secret_key' with your actual secret key
        const userId = decoded.id;

        await pool.query(
            `DELETE FROM ITtool.favorites WHERE user_id = $1 AND tool_id = $2`,
            [userId, toolId]
        );
        res.status(200).json({ message: 'Tool removed from favorites' });
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            console.error('JWT Error:', err.message);
            return res.status(401).json({ error: 'Invalid or malformed token' });
        }
        console.error('Error removing from favorites:', err);
        res.status(500).json({ error: 'Failed to remove from favorites' });
    }
});

app.patch('/api/tools/:toolId/toggle-is_premium', async (req, res) => {
    const { toolId } = req.params;

    try {
        const query = `UPDATE ITtool.tools SET is_premium = NOT is_premium WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [toolId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tool not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error toggling is_premium:', err);
        res.status(500).json({ error: 'Failed to toggle is_premium' });
    }
});

app.patch('/api/tools/:toolId/toggle-is_active', async (req, res) => {
    const { toolId } = req.params;

    try {
        const query = `UPDATE ITtool.tools SET is_active = NOT is_active WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [toolId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tool not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error toggling is_active:', err);
        res.status(500).json({ error: 'Failed to toggle is_active' });
    }
});

app.get('/api/tools/:toolId', async (req, res) => {
    const { toolId } = req.params;

    try {
        const query = `SELECT is_active FROM ITtool.tools WHERE id = $1`;
        const result = await pool.query(query, [toolId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tool not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching tool status:', err);
        res.status(500).json({ error: 'Failed to fetch tool status' });
    }
});

app.get('/api/user', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, 'your_secret_key'); // Replace 'your_secret_key' with your actual secret key
        const userId = decoded.id;

        const query = `SELECT id, username, is_premium FROM ITtool.users WHERE id = $1`;
        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            console.error('JWT Error:', err.message);
            return res.status(401).json({ error: 'Invalid or malformed token' });
        }
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.post('/api/upgrade-request', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, 'your_secret_key'); // Replace 'your_secret_key' with your actual secret key
        const userId = decoded.id;

        // Check if a request already exists for this user
        const existingRequest = await pool.query(
            'SELECT * FROM ITtool.upgrade_requests WHERE user_id = $1',
            [userId]
        );

        if (existingRequest.rows.length > 0) {
            return res.status(409).json({ error: 'Upgrade request already exists' });
        }

        // Insert a new upgrade request
        await pool.query(
            'INSERT INTO ITtool.upgrade_requests (user_id, status) VALUES ($1, $2)',
            [userId, 'pending']
        );

        res.status(201).json({ message: 'Upgrade request submitted successfully' });
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            console.error('JWT Error:', err.message);
            return res.status(401).json({ error: 'Invalid or malformed token' });
        }
        console.error('Error handling upgrade request:', err);
        res.status(500).json({ error: 'Failed to handle upgrade request' });
    }
});

// Endpoint to fetch all upgrade requests
app.get('/api/upgrade-requests', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT ur.user_id, u.username FROM ITtool.upgrade_requests ur
            JOIN ITtool.users u ON ur.user_id = u.id
        `);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching upgrade requests:', err);
        res.status(500).json({ error: 'Failed to fetch upgrade requests' });
    }
});

// Endpoint to approve an upgrade request
app.post('/api/approve-request/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Update the user's is_premium status
        await pool.query('UPDATE ITtool.users SET is_premium = true WHERE id = $1', [userId]);

        // Remove the request from the upgrade_requests table
        await pool.query('DELETE FROM ITtool.upgrade_requests WHERE user_id = $1', [userId]);

        res.status(200).json({ message: 'Request approved successfully' });
    } catch (err) {
        console.error('Error approving request:', err);
        res.status(500).json({ error: 'Failed to approve request' });
    }
});

// Endpoint to reject an upgrade request
app.post('/api/reject-request/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Remove the request from the upgrade_requests table
        await pool.query('DELETE FROM ITtool.upgrade_requests WHERE user_id = $1', [userId]);

        res.status(200).json({ message: 'Request rejected successfully' });
    } catch (err) {
        console.error('Error rejecting request:', err);
        res.status(500).json({ error: 'Failed to reject request' });
    }
});

// Endpoint to delete a tool
app.delete('/api/delete-tool/:toolId', async (req, res) => {
    const { toolId } = req.params;

    try {
        // Delete the tool from the favorites table
        await pool.query('DELETE FROM ITtool.favorites WHERE tool_id = $1', [toolId]);

        // Delete the tool from the tools table
        await pool.query('DELETE FROM ITtool.tools WHERE id = $1', [toolId]);

        res.status(200).json({ message: 'Tool deleted successfully' });
    } catch (err) {
        console.error('Error deleting tool:', err);
        res.status(500).json({ error: 'Failed to delete tool' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});