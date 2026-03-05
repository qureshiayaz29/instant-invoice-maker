/**
 * Test Suite: PWA - Offline / PWA Support
 * Covers test cases PWA-01 and PWA-02
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../../');

describe('PWA - Offline / PWA Support', () => {

    // PWA-01: Service Worker cache configuration
    it('PWA-01: vite.config.js should include VitePWA plugin (enables sw.js generation for offline cache)', () => {
        const viteConfig = readFileSync(resolve(PROJECT_ROOT, 'vite.config.js'), 'utf-8');

        expect(viteConfig).toContain('VitePWA');
        expect(viteConfig).toContain('registerType');
        // 'autoUpdate' ensures the service worker stays fresh
        expect(viteConfig).toContain('autoUpdate');
    });

    // PWA-01 (continued): package.json has vite-plugin-pwa as a dependency
    it('PWA-01b: package.json should list vite-plugin-pwa as a devDependency', () => {
        const pkg = JSON.parse(readFileSync(resolve(PROJECT_ROOT, 'package.json'), 'utf-8'));
        expect(pkg.devDependencies).toHaveProperty('vite-plugin-pwa');
    });

    // PWA-02: Web App Manifest is correctly declared (required for install prompt)
    it('PWA-02: VitePWA manifest in vite.config.js should declare name, short_name, icons and display:standalone', () => {
        const viteConfig = readFileSync(resolve(PROJECT_ROOT, 'vite.config.js'), 'utf-8');

        // Manifest fields needed for browser install prompt eligibility
        expect(viteConfig).toContain('Tez Billing');   // full name
        expect(viteConfig).toContain('Tez');            // short_name
        expect(viteConfig).toContain('standalone');         // display mode
        expect(viteConfig).toContain('icon.svg');           // at least one icon
        expect(viteConfig).toContain('theme_color');
    });

    // PWA-02 (continued): index.html should link to the icon / manifest
    it('PWA-02b: index.html should include a link tag or meta for the app icon', () => {
        const html = readFileSync(resolve(PROJECT_ROOT, 'index.html'), 'utf-8');
        // icon.svg is referenced either directly or injected by vite-plugin-pwa
        const hasIconRef = html.includes('icon.svg') || html.includes('apple-touch-icon') || html.includes('manifest');
        expect(hasIconRef).toBe(true);
    });
});
