const http = require('http');
const fs = require('fs').promises;

const host = 'localhost';
const port = 8080;

let readPage = (req, res) => {
    path = req.url;
    if (path === '/') path = '/index.html';
    fs.readFile(__dirname + path)
        .then(contents => {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(contents);
        });
}

const server = http.createServer(readPage);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
