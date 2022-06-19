import request from 'supertest';
import assert from 'assert';

import app, { errorHandler } from '../server.js';
import setup from './setup.js';

setup(app);


it('index.html returned', () => {
  return request(app)
    .get('/')
    .expect(200)
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect(/<option>Test Show<\/option>/);
});

describe('/search', () => {
  it('returns nothing', () => {
    return request(app)
      .get('/search')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/No quotes found/)
  })
  it('empty query returns nothing', () => {
    return request(app)
      .get('/search?query=')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/No quotes found/)
  })
  it('returns quote', () => {
    return request(app)
      .get('/search?query=Test')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/1\+ quotes found/)
  })
  it('show filters out quote', () => {
    return request(app)
      .get('/search?query=Test&show=None')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/No quotes found/)
  })
});

describe('global error handler', () => {
  it('passes along normal errors', (done) => {
    const error = new Error('my error')
    errorHandler(error, {}, {}, err => {
      assert.deepEqual(err, error)
      done()
    });
  })
  it('display API errors', (done) => {
    const error = { status: 123, errors: ['abc'] }
    errorHandler(error, {}, {
      status: (code) => {
        assert.deepEqual(code, error.status)
        return {
          send: (body) => {
            assert.deepEqual(body, error.errors);
            done();
          }
        }
      }
    });
  })
});