import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export const GET: RequestHandler = async () => {
    const configPath = path.resolve(process.cwd(), 'config.json');
    const raw = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(raw);
    return new Response(JSON.stringify(config), {
        headers: { 'Content-Type': 'application/json' }
    });
};
