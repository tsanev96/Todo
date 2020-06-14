const request = require('supertest');
const { Priority } = require('../../../models/priority');
const { User } = require('../../../models/user');
const mongoose = require('mongoose');
const { before } = require('lodash');

describe('/api/priorities', () => {
  let server;

  beforeEach(() => (server = require('../../../index')));
  afterEach(async () => {
    await Priority.remove({});
    server.close();
  });

  describe('GET /', () => {
    test('should return all priorities', async () => {
      await Priority.insertMany([
        { name: 'low', importance: 1 },
        { name: 'high', importance: 1 },
      ]);

      const res = await request(server).get('/api/priorities');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((p) => p.name === 'low')).toBeTruthy();
      expect(res.body.some((p) => p.name === 'high')).toBeTruthy();
    });
  });

  describe('GET/:id', () => {
    test('should return a priority if valid is passed', async () => {
      const priority = new Priority({ name: 'low', importance: 1 });
      await priority.save();

      const res = await request(server).get(`/api/priorities/${priority._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', priority.name);
    });

    test('should return 404 if valid id is passed but priority does not exist', async () => {
      const id = mongoose.Types.ObjectId();

      const res = await request(server).get(`/api/priorities/${id}`);

      expect(res.status).toBe(404);
    });

    test('should return 404 if invalid id is passed and priority does not exist', async () => {
      const res = await request(server).get('/api/priorities/1');

      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let token;
    let name;
    let importance;

    beforeEach(() => {
      token = new User({ isAdmin: true }).generateAuthToken();
      name = 'low';
      importance = 1;
    });

    const exec = () => {
      return request(server)
        .post('/api/priorities')
        .set('x-auth-token', token)
        .send({ name, importance });
    };

    test('should return 401 if user is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    test('should return 403 if user is logged but not an admin', async () => {
      token = new User().generateAuthToken();

      const res = await exec();

      expect(res.status).toBe(403);
    });

    test('should return 400 if priority is less than 3 char', async () => {
      name = 'a';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    test('should return 400 if priority is more than 50 char', async () => {
      name = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    test('should return 400 if importance property is not provided', async () => {
      importance = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    test('should save and return the priority if its saved in the db', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', name);
      expect(res.body).toHaveProperty('importance', importance);
      expect(res.body).toHaveProperty('_id');
    });
  });

  describe('PUT/:id', () => {
    let priority;
    let token;
    let updatedName;
    let updatedImportance;
    let id;

    beforeEach(async () => {
      priority = new Priority({ name: 'low', importance: 0 });
      await priority.save();

      id = priority._id;
      token = new User({ isAdmin: true }).generateAuthToken();
      updatedName = 'updated';
      updatedImportance = 1;
    });

    const exec = () => {
      return request(server)
        .put(`/api/priorities/${id}`)
        .set('x-auth-token', token)
        .send({ name: updatedName, importance: updatedImportance });
    };

    test('should return 401 if user is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    test('should return 403 if user is logged but not an admin', async () => {
      token = new User().generateAuthToken();

      const res = await exec();

      expect(res.status).toBe(403);
    });

    test('should return 400 if priority name is less than 3 char', async () => {
      updatedName = 'a';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    test('should return 400 if priority name is more than 50 char', async () => {
      updatedName = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    test('should return 400 if priority importance is not a number', async () => {
      updatedImportance = 'a';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    test('should return 404 if valid id but not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    test('should return 404 if invalid id is passed', async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    test('should save and return the priority if req.body is valid', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', updatedName);
      expect(res.body).toHaveProperty('importance', updatedImportance);
      expect(res.body).toHaveProperty('_id');
    });
  });

  describe('DELETE/:id', () => {
    let token;
    let priority;
    let id;

    beforeEach(async () => {
      priority = new Priority({ name: 'low', importance: 1 });
      await priority.save();

      id = priority._id;
      token = new User({ isAdmin: true }).generateAuthToken();
    });

    const exec = () => {
      return request(server)
        .delete(`/api/priorities/${id}`)
        .set('x-auth-token', token)
        .send(priority);
    };

    test('should return 401 if user is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    test('should return 403 if user is logged but not an admin', async () => {
      token = new User().generateAuthToken();

      const res = await exec();

      expect(res.status).toBe(403);
    });

    test('should return 404 if valid id but not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    test('should return 404 if invalid id is passed', async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    test('should delete the genre if valid id is passed', async () => {
      await exec();

      const priorityFound = await Priority.findById(id);

      expect(priorityFound).toBeNull();
    });

    test('should return the deleted priority', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', priority.name);
      expect(res.body).toHaveProperty('importance', priority.importance);
    });
  });
});
