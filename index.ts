import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import 'dotenv/config';
import './src/http_server/index.ts' 

export const httpServer = http.createServer(function (req, res) {
  const __dirname = path.resolve(path.dirname(''));
  const file_path = __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url);
  fs.readFile(file_path, function (err, data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
});

const staticPort = process.env.STATIC_PORT;

console.log(`Start static http server on the ${staticPort} port!`);
httpServer.listen(staticPort);
