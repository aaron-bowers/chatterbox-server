const { nanoid } = require('nanoid');
const { messages } = require('./classes/messages.js');

const defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': '*', // 'content-type, accept, authorization',
  'access-control-max-age': 10 // Seconds.
};

var counter = 0;

const requestHandler = function(request, response) {
  const headers = defaultCorsHeaders;
  // headers['Content-Type'] = 'text/plain';

  headers['Content-Type'] = 'application/JSON';


  if (request.url === '/classes/messages') {
    if (request.method === 'OPTIONS') {
      delete headers['Content-Type'];
      response.writeHead(200, headers);
      response.end();
    }
    if (request.method === 'GET') {
      response.writeHead(200, headers);
      response.end(JSON.stringify(messages));
    } else if (request.method === 'POST') {
      let data = '';
      request.on('data', chunk => {
        data += chunk;
      });
      request.on('end', () => {
        // if (data === '') { data = '{}'; }
        let message = JSON.parse(data);
        if (message.username === undefined && message.text === undefined) {
          response.writeHead(418, headers);
          response.end('I\'m a little teapot, short and stout!');
        } else {
          message.createdAt = new Date();
          message['message_id'] = nanoid();
          // message.id = nanoid(); // create a unique id for each msg
          messages.push(message);
          response.writeHead(201, headers);
          response.end(JSON.stringify([{ 'message_id': message['message_id'] }]));
        }
      });
    }
    // else {
    //   response.writeHead(418, headers);
    //   response.end('Not a valid request from /classes/messages');
    // }
  } else {
    response.writeHead(404, headers);
    response.end('Please make a request from a valid directory (hint: try /classes/messages ;) )');
  }
};

module.exports.defaultCorsHeaders = defaultCorsHeaders;
module.exports.requestHandler = requestHandler;