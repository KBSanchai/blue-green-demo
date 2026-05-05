const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const htmlPage = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Blue — Production</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      background: #020817;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }

    /* Blue orbs */
    .orb {
      position: fixed;
      border-radius: 50%;
      pointer-events: none;
      filter: blur(80px);
    }
    .orb-1 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%);
      top: -150px; left: -100px;
      animation: drift1 10s ease-in-out infinite;
    }
    .orb-2 {
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%);
      bottom: -100px; right: -100px;
      animation: drift2 12s ease-in-out infinite;
    }
    .orb-3 {
      width: 300px; height: 300px;
      background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%);
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      animation: drift3 8s ease-in-out infinite;
    }

    @keyframes drift1 {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(50px, 40px); }
    }
    @keyframes drift2 {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(-40px, -50px); }
    }
    @keyframes drift3 {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.2); }
    }

    .container {
      width: 100%;
      max-width: 820px;
      padding: 24px;
      position: relative;
      z-index: 1;
    }

    /* Top bar */
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 48px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      letter-spacing: 0.05em;
    }
    .logo-dot {
      width: 8px; height: 8px;
      background: #3b82f6;
      border-radius: 50%;
    }

    .env-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(37,99,235,0.12);
      border: 1px solid rgba(59,130,246,0.35);
      color: #60a5fa;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 6px 16px;
      border-radius: 100px;
    }
    .live-dot {
      width: 7px; height: 7px;
      background: #3b82f6;
      border-radius: 50%;
      animation: blink 2s ease-in-out infinite;
      box-shadow: 0 0 6px #3b82f6;
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    /* Hero */
    .hero {
      margin-bottom: 44px;
    }

    .version-tag {
      display: inline-block;
      background: rgba(59,130,246,0.1);
      border: 1px solid rgba(59,130,246,0.2);
      color: #93c5fd;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 6px;
      margin-bottom: 20px;
      letter-spacing: 0.05em;
    }

    h1 {
      font-size: clamp(36px, 6vw, 58px);
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 16px;
      letter-spacing: -0.02em;
    }
    h1 .word-blue {
      background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 40%, #1d4ed8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    h1 .word-white {
      color: #f1f5f9;
    }

    .hero-sub {
      font-size: 15px;
      color: #475569;
      font-weight: 400;
      max-width: 480px;
    }

    /* Info cards */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 14px;
      margin-bottom: 16px;
    }

    .card {
      background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 14px;
      padding: 20px;
      transition: all 0.25s ease;
      position: relative;
      overflow: hidden;
    }
    .card::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(59,130,246,0.05) 0%, transparent 60%);
      opacity: 0;
      transition: opacity 0.25s ease;
    }
    .card:hover {
      transform: translateY(-4px);
      border-color: rgba(59,130,246,0.25);
      box-shadow: 0 8px 32px rgba(37,99,235,0.15);
    }
    .card:hover::after { opacity: 1; }

    .card-icon {
      font-size: 20px;
      margin-bottom: 14px;
      display: block;
    }
    .card-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #334155;
      margin-bottom: 8px;
    }
    .card-value {
      font-size: 14px;
      font-weight: 600;
      color: #cbd5e1;
      word-break: break-all;
      line-height: 1.4;
    }
    .card-value.blue {
      background: linear-gradient(135deg, #93c5fd, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-size: 17px;
    }

    /* Status bar */
    .statusbar {
      background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 14px;
      padding: 18px 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .status-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .status-icon {
      width: 36px; height: 36px;
      background: rgba(37,99,235,0.15);
      border: 1px solid rgba(59,130,246,0.3);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px;
    }
    .status-text {
      font-size: 13px;
      font-weight: 600;
      color: #e2e8f0;
    }
    .status-sub {
      font-size: 11px;
      color: #475569;
      margin-top: 2px;
    }
    .traffic-pill {
      background: rgba(37,99,235,0.12);
      border: 1px solid rgba(59,130,246,0.3);
      color: #60a5fa;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 16px;
      border-radius: 100px;
      letter-spacing: 0.05em;
    }
  </style>
</head>
<body>

  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>

  <div class="container">

    <!-- Top bar -->
    <div class="topbar">
      <div class="logo">
        <div class="logo-dot"></div>
        BLUE-GREEN DEPLOYMENT
      </div>
      <div class="env-badge">
        <span class="live-dot"></span>
        Production Live
      </div>
    </div>

    <!-- Hero -->
    <div class="hero">
      <div class="version-tag">v1.0.0</div>
      <h1>
        <span class="word-blue">Blue</span><br/>
        <span class="word-white">Environment</span>
      </h1>
      <p class="hero-sub">Current production environment serving 100% of live traffic. Deployed via Jenkins + Kubernetes.</p>
    </div>

    <!-- Cards -->
    <div class="grid">
      <div class="card">
        <span class="card-icon">🔵</span>
        <div class="card-label">Active Slot</div>
        <div class="card-value blue">BLUE</div>
      </div>
      <div class="card">
        <span class="card-icon">🏷️</span>
        <div class="card-label">Version</div>
        <div class="card-value">1.0.0</div>
      </div>
      <div class="card">
        <span class="card-icon">🖥️</span>
        <div class="card-label">Pod Hostname</div>
        <div class="card-value">${require('os').hostname()}</div>
      </div>
      <div class="card">
        <span class="card-icon">🕐</span>
        <div class="card-label">Server Time</div>
        <div class="card-value">${new Date().toLocaleString()}</div>
      </div>
    </div>

    <!-- Status bar -->
    <div class="statusbar">
      <div class="status-left">
        <div class="status-icon">⚡</div>
        <div>
          <div class="status-text">All systems operational</div>
          <div class="status-sub">Health checks passing · Zero downtime active</div>
        </div>
      </div>
      <div class="traffic-pill">100% Traffic →  BLUE</div>
    </div>

  </div>
</body>
</html>
`;

app.get('/', (req, res) => {
  res.send(htmlPage());
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', color: 'blue', version: '1.0.0' });
});

app.listen(PORT, () => console.log(`Blue app on port ${PORT}`));