// Utility to load config.json at runtime
import fs from 'fs';
import path from 'path';

export function getConfig() {
    const configPath = path.resolve(process.cwd(), 'config.json');
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw);
}
