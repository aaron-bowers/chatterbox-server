const _ = require('underscore');

const handler = require('../request-handler');
const expect = require('chai').expect;
const stubs = require('./Stubs');

describe('Node Server Request Listener Function', function() {
  it('Should answer GET requests for /classes/messages with a 200 status code', function() {
    // This is a fake server request. Normally, the server would provide this,
    // but we want to test our function's behavior totally independent of the server code
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(200);
    expect(res._ended).to.equal(true);
  });

  it('Should send back parsable stringified JSON', function() {
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(JSON.parse.bind(this, res._data)).to.not.throw();
    expect(res._ended).to.equal(true);
  });

  it('Should send back an array', function() {
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    var parsedBody = JSON.parse(res._data);
    expect(parsedBody).to.be.an('array');
    expect(res._ended).to.equal(true);
  });

  it('Should accept posts to /classes/messages', function() {
    var stubMsg = {
      username: 'Jono',
      text: 'Do my bidding!'
    };
    var req = new stubs.request('/classes/messages', 'POST', stubMsg);
    var res = new stubs.response();

    handler.requestHandler(req, res);

    // Expect 201 Created response status
    expect(res._responseCode).to.equal(201);

    // Testing for a newline isn't a valid test
    // TODO: Replace with with a valid test
    // expect(res._data).to.equal(JSON.stringify('\n'));
    expect(res._ended).to.equal(true);
  });

  it('Should respond with messages that were previously posted', function() {
    var stubMsg = {
      username: 'Jono',
      text: 'Do my bidding!'
    };
    var req = new stubs.request('/classes/messages', 'POST', stubMsg);
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(201);

    // Now if we request the log for that room the message we posted should be there:
    req = new stubs.request('/classes/messages', 'GET');
    res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(200);
    var messages = JSON.parse(res._data);
    expect(messages.length).to.be.above(0);
    expect(messages[0].username).to.equal('Jono');
    expect(messages[0].text).to.equal('Do my bidding!');
    expect(res._ended).to.equal(true);
  });

  it('Should 404 when asked for a nonexistent file', function() {
    var req = new stubs.request('/arglebargle', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(404);
    expect(res._ended).to.equal(true);
  });

  it('Should assign timestamp to message', function() {
    var stubMsg = {
      username: 'Jono',
      text: 'Do my bidding!'
    };
    var req = new stubs.request('/classes/messages', 'POST', stubMsg);
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(201);

    // Now if we request the log for that room the message we posted should be there:
    req = new stubs.request('/classes/messages', 'GET');
    res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(200);
    var messages = JSON.parse(res._data);
    expect(messages.length).to.be.above(0);
    expect(messages[0].createdAt.slice(0, 4)).to.equal('2022');
    expect(res._ended).to.equal(true);
  });

  it('Should assign unique id to each message', function() {
    var stubMsgA = {
      username: 'Jono',
      text: 'Do my bidding!'
    };
    var stubMsgB = {
      username: 'Skip',
      text: 'Rebecca Black is my life!'
    };

    var reqA = new stubs.request('/classes/messages', 'POST', stubMsgA);
    var resA = new stubs.response();
    handler.requestHandler(reqA, resA);

    var reqB = new stubs.request('/classes/messages', 'POST', stubMsgB);
    var resB = new stubs.response();
    handler.requestHandler(reqB, resB);

    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();
    handler.requestHandler(req, res);
    let messages = JSON.parse(res._data);
    let uniqueMessages = _.uniq(messages, (message) => {
      return message.id;
    });

    expect(messages).to.eql(uniqueMessages);
  });

  // it('Should 418 when using an invalid request method for /classes/messages', function() {
  //   var req = new stubs.request('/classes/messages', 'DELETE');
  //   var res = new stubs.response();

  //   handler.requestHandler(req, res);

  //   expect(res._responseCode).to.equal(418);
  //   expect(res._ended).to.equal(true);
  // });

});
