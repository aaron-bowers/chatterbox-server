const { nanoid } = require('nanoid');
const { messages } = require('./classes/messages.js');

const defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': '*', // 'content-type, accept, authorization',
  'access-control-max-age': 10 // Seconds.
};

var counter = 0;

const headers = defaultCorsHeaders;

const requestHandler = function(request, response) {
  if (request.url === '/classes/messages') {
    if (request.method === 'OPTIONS') {
      response.writeHead(200, {'Content-Type': 'application/JSON'});
      response.end();
    }
    if (request.method === 'GET') {
      response.writeHead(200, {'Content-Type': 'application/JSON'});
      response.end(JSON.stringify(messages));
    } else if (request.method === 'POST') {
      let data = '';
      request.on('data', chunk => {
        data += chunk;
      });
      request.on('end', () => {
        let message = JSON.parse(data);
        if (message.username === undefined && message.text === undefined) {
          response.writeHead(418, {'Content-Type': 'text/plain'});
          response.end('I\'m a little teapot, short and stout!');
        } else {
          message.createdAt = new Date();
          message['message_id'] = nanoid();
          messages.push(message);
          response.writeHead(201, {'Content-Type': 'text/plain'});
          response.end(JSON.stringify([{ 'message_id': message['message_id'] }]));
        }
      });
    }
  } else {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.end('Please make a request from a valid directory (hint: try /classes/messages ;) )');
  }
};

module.exports.defaultCorsHeaders = defaultCorsHeaders;
module.exports.requestHandler = requestHandler;