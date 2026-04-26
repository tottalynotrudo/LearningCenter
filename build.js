import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🚀 Building for Vercel...\n');

// Create public directories for dependencies
const dirs = [
    'public/scram',
    'public/baremux',
    'public/libcurl'
];

dirs.forEach(dir => {
    const fullPath = join(__dirname, dir);
    if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
    }
});

// Helper function to copy directory recursively
function copyDir(src, dest) {
    if (!existsSync(dest)) {
        mkdirSync(dest, { recursive: true });
    }
    
    const entries = readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            copyFileSync(srcPath, destPath);
        }
    }
}

// Copy Scramjet files
console.log('\n📦 Copying Scramjet files...');
const scramjetSrc = join(__dirname, 'node_modules/@mercuryworkshop/scramjet');
const scramjetDest = join(__dirname, 'public/scram');

try {
    if (existsSync(scramjetSrc)) {
        const files = readdirSync(scramjetSrc);
        files.forEach(file => {
            if (file.endsWith('.js') || file.endsWith('.wasm') || file.endsWith('.mjs')) {
                copyFileSync(join(scramjetSrc, file), join(scramjetDest, file));
                console.log(`  ✓ ${file}`);
            }
        });
    } else {
        console.error('  ✗ Scramjet source not found');
    }
} catch (err) {
    console.error('  ✗ Failed to copy Scramjet:', err.message);
}

// Copy BareMux files
console.log('\n📦 Copying BareMux files...');
const baremuxSrc = join(__dirname, 'node_modules/@mercuryworkshop/bare-mux/dist');
const baremuxDest = join(__dirname, 'public/baremux');

try {
    if (existsSync(baremuxSrc)) {
        copyDir(baremuxSrc, baremuxDest);
        console.log('  ✓ All BareMux files copied');
    } else {
        console.error('  ✗ BareMux source not found');
    }
} catch (err) {
    console.error('  ✗ Failed to copy BareMux:', err.message);
}

// Copy libcurl files
console.log('\n📦 Copying libcurl-transport files...');
const libcurlSrc = join(__dirname, 'node_modules/@mercuryworkshop/libcurl-transport/dist');
const libcurlDest = join(__dirname, 'public/libcurl');

try {
    if (existsSync(libcurlSrc)) {
        copyDir(libcurlSrc, libcurlDest);
        console.log('  ✓ All libcurl files copied');
    } else {
        console.error('  ✗ libcurl source not found');
    }
} catch (err) {
    console.error('  ✗ Failed to copy libcurl:', err.message);
}

console.log('\n✅ Build complete! Ready for Vercel deployment.\n');
console.log('⚠️  Note: You need to configure an external Wisp server in app.js');
console.log('   since Vercel does not support WebSocket servers.\n');

