import * as http from 'http';
import {IncomingMessage, ServerResponse} from 'http';
import * as fs from 'fs';
import * as p from 'path';
import * as url from 'url';

const server = http.createServer();
const publicDir = p.resolve(__dirname, 'public');
let cacheAge = 3600*24*365;

server.on('request', (request: IncomingMessage, response: ServerResponse) => {
    const {method, url: path, headers} = request;

    const {pathname, search} = url.parse(path);

    if (method != 'GET') {
        response.statusCode = 405;
        response.end();
    }


    let filename = pathname.substr(1);
    if (filename === '') {
        filename = 'index.html';
    }
    response.setHeader('Content-type', `${filename}; charset=utf-8`);
    fs.readFile(p.resolve(publicDir, filename), (error, data) => {
        if (error) {
            console.log(error);
            if (pathname.endsWith('.html')) {
                response.statusCode = 404;
                fs.readFile(p.resolve(publicDir, '404.html'), (error, data) => {
                    response.end(data);
                });
            } else {
                response.statusCode = 500;
                const string = "Server is busy"
                response.end(string);
            }
        } else {
            response.setHeader('Cache-Control',`public, max-age=${cacheAge}`)
            response.end(data);
        }
    });
});

server.listen(8888);