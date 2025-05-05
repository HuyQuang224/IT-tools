import { Pool } from 'pg';

// Cấu hình kết nối cơ sở dữ liệu PostgreSQL
export const pool = new Pool({
    user: 'postgres', // Thay bằng tên người dùng PostgreSQL của bạn
    host: 'localhost',     // Địa chỉ máy chủ
    database: 'postgres', // Thay bằng tên cơ sở dữ liệu của bạn
    password: 'huy123', // Thay bằng mật khẩu của bạn
    port: 5432,            // Cổng mặc định của PostgreSQL
});

// Kiểm tra kết nối
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Lỗi kết nối cơ sở dữ liệu:', err.stack);
    }
    console.log('Kết nối cơ sở dữ liệu thành công!');
    release();
});

// Model cho bảng users
export async function createUser(username, password, isPremium = false, isAdmin = false) {
    const query = `INSERT INTO ITtool.users (username, password, is_premium, is_admin) VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [username, password, isPremium, isAdmin];
    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (err) {
        console.error('Lỗi khi tạo người dùng:', err);
        throw err;
    }
}

// Model cho bảng categories
export async function createCategory(name) {
    const query = `INSERT INTO ITtool.categories (name) VALUES ($1) RETURNING *`;
    try {
        const result = await pool.query(query, [name]);
        return result.rows[0];
    } catch (err) {
        console.error('Lỗi khi tạo loại công cụ:', err);
        throw err;
    }
}

// Model cho bảng tools
export async function createTool(name, categoryId, description, isPremium = false, isActive = true, routePath, icon) {
    const query = `INSERT INTO ITtool.tools (name, category_id, description, is_premium, is_active, route_path, icon) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    const values = [name, categoryId, description, isPremium, isActive, routePath, icon];
    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (err) {
        console.error('Lỗi khi tạo công cụ:', err);
        throw err;
    }
}

// Model cho bảng favorites
export async function addFavorite(userId, toolId) {
    const query = `INSERT INTO ITtool.favorites (user_id, tool_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`;
    try {
        const result = await pool.query(query, [userId, toolId]);
        return result.rows[0];
    } catch (err) {
        console.error('Lỗi khi thêm công cụ yêu thích:', err);
        throw err;
    }
}

// Model cho bảng upgrade_requests
export async function createUpgradeRequest(userId, status = 'pending') {
    const query = `INSERT INTO ITtool.upgrade_requests (user_id, status) VALUES ($1, $2) RETURNING *`;
    try {
        const result = await pool.query(query, [userId, status]);
        return result.rows[0];
    } catch (err) {
        console.error('Lỗi khi tạo yêu cầu nâng cấp:', err);
        throw err;
    }
}