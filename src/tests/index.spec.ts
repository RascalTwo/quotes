import request from 'supertest';
import assert from 'assert';

import app, { errorHandler } from '../server';
import setup, { setDatabaseData } from './setup';

import type { Request, Response } from 'express';

setup(app);


it('index.html returned', () => {
  return request(app)
    .get('/')
    .expect(200)
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect(/<option>AtLeastOneMediaRequried<\/option>/);
});

describe('/search', () => {
  before(() => setDatabaseData({
    medias: [
      { _id: 'mid', title: 'Movie' },
      { _id: 'tv1', title: 'Show', season: 1, episode: '2' },
    ],
    quotes: [
      { media: 'tv1', text: 'One', timeStamp: 1.0 },
      { media: 'mid', text: 'Two', timeStamp: 1.0 },
    ]
  }))
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
      .expect(302)
      .expect('Location', '/search')
  })
  it('returns quote', () => {
    return request(app)
      .get('/search?query=One')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/1 quotes found/)
  })
  it('title filters out quote', () => {
    return request(app)
      .get('/search?query=Test&title=None')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/No quotes found/)
  })
});

describe('global error handler', () => {
  it('passes along normal errors', (done) => {
    const error = new Error('my error')
    errorHandler(error, {} as Request, {} as Response, err => {
      assert.deepEqual(err, error)
      done()
    });
  })
  it('display API errors', (done) => {
    const error = { status: 123, errors: ['abc'] }
    errorHandler(error, {} as Request, {
      status: (code) => {
        assert.deepEqual(code, error.status)
        return {
          send: (body) => {
            assert.deepEqual(body, error.errors);
            done();
          }
        }
      }
    } as Response, () => undefined);
  })
});