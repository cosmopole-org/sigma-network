
const express = require('express')
const https = require('https');
const fs = require('fs');

const app = express()
app.use(express.static('files'))

const httpsServer = https.createServer({
  key: fs.readFileSync('cert.key'),
  cert: fs.readFileSync('cert.pem'),
}, app);

httpsServer.listen(8443, () => {
    console.log('HTTPS Server running on port 8443');
});
