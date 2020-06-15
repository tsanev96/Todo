const request = require('supertest');
const { Todo } = require('../../../models/user');
const { User } = require('../../../models/user');
const { Priority } = require('../../../models/priority');
const mongoose = require('mongoose');

describe('/api/todos', () => {
  let server;
  let token;
  let user;
  let todo;
  let priority;

  beforeEach(async () => {
    server = require('../../../index');
    user = new User({
      name: '12345',
      username: '12345',
      email: 'a@gmail.com',
      password: '12345',
    });
    priority = new Priority({ name: 'low', importance: 1 });
    (todo = {
      name: 'clean',
      priority: {
        _id: priority._id,
        name: priority.name,
        importance: priority.importance,
      },
    }),
      (token = user.generateAuthToken());
    user.todos.push(todo);

    await user.save();
    await priority.save();
  });
  afterEach(async () => {
    server.close();
    await User.remove({});
    await Priority.remove({});
  });

  describe('auth - repeated tests', () => {
    test('should return 401 if user is not logged in', async () => {
      const res = await request(server).get('/api/todos');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /', () => {
    test('should return 401 if user is not logged in', async () => {
      const res = await request(server).get('/api/todos');

      expect(res.status).toBe(401);
    });

    test('should return all todos of the user', async () => {
      // adding one more to check array
      user.todos.push({
        name: 'train',
        priority: {
          _id: priority._id,
          name: priority.name,
          importance: priority.importance,
        },
      });
      await user.save();

      const res = await request(server)
        .get('/api/todos')
        .set('x-auth-token', token);

      expect(res.status).toBe(200);
      expect(res.body.some((t) => t.name === 'clean')).toBeTruthy();
      expect(res.body.some((t) => t.name === 'train')).toBeTruthy();
    });
  });

  describe('GET /id', () => {
    test('should return 401 if user is not logged in', async () => {
      const res = await request(server).get('/api/todos');

      expect(res.status).toBe(401);
    });

    test('should return 404 if valid id is passed but no todo', async () => {
      const id = mongoose.Types.ObjectId();

      const res = await request(server).get(`/api/todo/${id}`);

      expect(res.status).toBe(404);
    });

    test('should return 404 if invalid id is passed', async () => {
      const res = await request(server).get(`/api/todo/1`);

      expect(res.status).toBe(404);
    });

    test('should return the todo', async () => {
      const id = user.todos[0]._id;

      const res = await request(server)
        .get(`/api/todos/${id}`)
        .set('x-auth-token', token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', todo.name);
      expect(res.body).toHaveProperty('_id'); //TODO:
      expect(res.body).toHaveProperty('priority');
    });
  });

  describe('POST /', () => {
    // 5 cases
  });
});
