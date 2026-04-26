const urlForm = document.getElementById('urlForm');
const urlInput = document.getElementById('urlInput');
const errorContainer = document.getElementById('errorContainer');
const errorText = document.getElementById('errorText');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettings = document.getElementById('closeSettings');
const searchEngine = document.getElementById('searchEngine');
const addressBar = document.getElementById('addressBar');
const addressInput = document.getElementById('addressInput');
const backBtn = document.getElementById('backBtn');
const forwardBtn = document.getElementById('forwardBtn');
const refreshBtn = document.getElementById('refreshBtn');
const homeBtn = document.getElementById('homeBtn');

const { ScramjetController } = $scramjetLoadController();

const scramjet = new ScramjetController({
    files: {
        wasm: "/scram/scramjet.wasm.wasm",
        all: "/scram/scramjet.all.js",
        sync: "/scram/scramjet.sync.js",
    },
});

scramjet.init();

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

let currentFrame = null;

// Settings
settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.add('open');
});

closeSettings.addEventListener('click', () => {
    settingsPanel.classList.remove('open');
});

// Error handling
function showError(message) {
    errorText.textContent = message;
    errorContainer.classList.add('show');
    setTimeout(() => {
        errorContainer.classList.remove('show');
    }, 5000);
}

async function loadURL(url) {
    try {
        await registerSW();
    } catch (err) {
        showError('Failed to register service worker');
        console.error(err);
        return;
    }

    const wispUrl = (location.protocol === 'https:' ? 'wss' : 'ws') + '://' + location.host + '/wisp/';
    
    try {
        if ((await connection.getTransport()) !== '/libcurl/index.mjs') {
            await connection.setTransport('/libcurl/index.mjs', [{ websocket: wispUrl }]);
        }
        
        if (currentFrame) {
            currentFrame.go(url);
        } else {
            const frame = scramjet.createFrame();
            frame.frame.id = 'sj-frame';
            document.body.appendChild(frame.frame);
            frame.go(url);
            currentFrame = frame;
            addressBar.classList.add('active');
        }
        
        addressInput.value = url;
    } catch (err) {
        showError('Failed to load page');
        console.error(err);
    }
}

// Form submission
urlForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const input = urlInput.value.trim();
    if (!input) return;

    const url = search(input, searchEngine.value);
    await loadURL(url);
});

// Address bar
addressInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const input = addressInput.value.trim();
        if (!input) return;
        
        const url = search(input, searchEngine.value);
        await loadURL(url);
    }
});

backBtn.addEventListener('click', () => {
    if (currentFrame) {
        window.history.back();
    }
});

forwardBtn.addEventListener('click', () => {
    if (currentFrame) {
        window.history.forward();
    }
});

refreshBtn.addEventListener('click', () => {
    if (currentFrame && addressInput.value) {
        loadURL(addressInput.value);
    }
});

homeBtn.addEventListener('click', () => {
    if (currentFrame) {
        currentFrame.frame.remove();
        currentFrame = null;
        addressBar.classList.remove('active');
        addressInput.value = '';
    }
});

// Dock items
document.querySelectorAll('.dock-item[data-url]').forEach(item => {
    item.addEventListener('click', async () => {
        const url = item.dataset.url;
        if (!url) return;
        await loadURL(url);
    });
});

urlInput.focus();
