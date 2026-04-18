import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export const GET: RequestHandler = async () => {
    const configPath = path.resolve(process.cwd(), 'config.json');
    let config: Record<string, unknown>;
    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } else {
        config = {
            API_BASE_URL: process.env.API_BASE_URL ?? 'http://localhost:8000',
            INCLUDE_CREDENTIALS: process.env.INCLUDE_CREDENTIALS === 'true',
            AUTH_MODE: process.env.AUTH_MODE ?? 'token'
        };
    }
    return new Response(JSON.stringify(config), {
        headers: { 'Content-Type': 'application/json' }
    });
};
