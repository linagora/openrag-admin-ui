// Mock OpenRAG backend for testing the non-admin dashboard flow.
// Simulates: OIDC-mode backend, valid session, user.is_admin = false.
// Run with: node tests/mock-backend.mjs

import http from 'node:http';

const PORT = 8001;
const ORIGIN = 'http://localhost:5173';

const USER_INFO = {
    id: 'non-admin-1',
    display_name: 'Non Admin',
    is_admin: false,
    memberships: [],
    file_count: 0,
    pending_files: 0,
    total_files: 0,
    file_quota: -1
};

function cors(res) {
    res.setHeader('Access-Control-Allow-Origin', ORIGIN);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
}

const server = http.createServer((req, res) => {
    cors(res);
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const path = url.pathname;
    console.log(`[mock] ${req.method} ${path}${url.search}`);

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Simulated OIDC re-auth: always succeeds, bounces back to `next`.
    // If the 403 fix is broken, the frontend will keep hitting this in a loop.
    if (path === '/auth/login') {
        const next = url.searchParams.get('next') ?? ORIGIN;
        res.writeHead(302, { Location: next });
        res.end();
        return;
    }

    if (path === '/users/info') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(USER_INFO));
        return;
    }

    if (path === '/actors/') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ detail: 'Admin rights required' }));
        return;
    }

    if (path === '/partition/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ partitions: [] }));
        return;
    }

    if (path === '/health_check') {
        res.writeHead(200);
        res.end('ok');
        return;
    }

    res.writeHead(404);
    res.end();
});

server.listen(PORT, () => {
    console.log(`[mock] OpenRAG mock backend on http://localhost:${PORT}`);
    console.log(`[mock] CORS origin: ${ORIGIN}`);
    console.log(`[mock] User: ${USER_INFO.display_name} (is_admin=${USER_INFO.is_admin})`);
});
