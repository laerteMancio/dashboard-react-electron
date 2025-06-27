const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const waitOn = require('wait-on');

let backendProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Carrega o frontend buildado com Vite (React)
  win.loadFile(path.join(__dirname, 'build', 'index.html'));

  // Comente para produção
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  // Caminho para o backend empacotado
  const backendPath = path.join(__dirname, 'backend-dist', 'backend.exe');

  // Spawna o backend .exe
  backendProcess = spawn(backendPath, {
    cwd: __dirname,
    shell: true,
  });

  // Logs para debug
  backendProcess.stdout.on('data', (data) => {
    console.log(`BACKEND: ${data.toString()}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`BACKEND ERRO: ${data.toString()}`);
  });

  backendProcess.on('exit', (code) => {
    console.log(`Backend saiu com código ${code}`);
  });

  // Aguarda o backend estar pronto (respondendo em localhost:3001)
  waitOn(
    {
      resources: ['http://localhost:3001'],
      timeout: 15000,
      interval: 500,
    },
    (err) => {
      if (err) {
        console.error('Erro ao aguardar backend:', err);
        createWindow(); // abre a janela mesmo com erro para debug
      } else {
        console.log('Backend está pronto. Abrindo janela.');
        createWindow();
      }
    }
  );
});

// Fecha backend junto com o app
app.on('window-all-closed', () => {
  if (backendProcess) {
    console.log('Encerrando backend...');
    backendProcess.kill('SIGINT'); // envio de sinal mais seguro no Windows
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
