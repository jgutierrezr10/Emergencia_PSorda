const https = require('https');

const data = JSON.stringify({
  latitudLongitud: "SIN_GPS",
  disponibleTriage: true,
  estado: "TEST",
  incidente: "Test desde script",
  modoCamuflaje: false,
  personaSorda: { id: 1 }
});

const options = {
  hostname: 'emergenciapsorda-production.up.railway.app',
  path: '/api/alertas',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log(`BODY: ${body}`));
});

req.on('error', (e) => console.error(`ERROR: ${e.message}`));
req.write(data);
req.end();
