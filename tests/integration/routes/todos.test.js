const request = require('supertest');
const { Todo } = require('../../../models/todo');
const { User } = require('../../../models/user');
const { Priority } = require('../../../models/priority');
const mongoose = require('mongoose');
const { after } = require('lodash');

describe('/api/todos', () => {
  let server;
  let token;
  let user;
  let todo;
  let todoName;
  let priority;

  beforeEach(async () => {
    server = require('../../../index');
    user = new User({
      name: '12345',
      username: '12345',
      email: 'a@gmail.com',
      password: '12345',
    });

    todoName = 'clean';
    priority = new Priority({ name: 'low', importance: 1 });
    priorityId = priority._id;
    token = user.generateAuthToken();

    await priority.save();
    await user.save();
    // todos will be saved in describe
    // because they need to be modified
    // before saved in the db
  });

  afterEach(async () => {
    await server.close();
    await User.remove({});
    await Priority.remove({});
  });

  describe('GET /', () => {
    beforeEach(async () => {
      todo = {
        name: todoName,
        priority: {
          _id: priority._id,
          name: priority.name,
          importance: priority.importance,
        },
      };

      user.todos.push(todo);
      await user.save();
    });

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
    beforeEach(async () => {
      todo = new Todo({
        name: todoName,
        priority: {
          _id: priority._id,
          name: priority.name,
          importance: priority.importance,
        },
      });

      user.todos.push(todo);
      await user.save();
    });

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

    test('should return the todo if id is valid', async () => {
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
    beforeEach(() => {
      todo = { name: todoName, priorityId };
    });

    const exec = () => {
      return request(server)
        .post('/api/todos')
        .set('x-auth-token', token)
        .send(todo);
    };

    test('should return 401 if user is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    test('should return 400 if todo name is less than 5 char', async () => {
      todo.name = '1234';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    test('should return 400 if todo name is more than 250 char', async () => {
      todo.name = new Array(252).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    test('should return 400 if priorityId does not exist with valid ID', async () => {
      todo.priorityId = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(400);
    });

    test('should return 400 if priorityId is invalid ID', async () => {
      todo.priorityId = 1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    test('should return the todo if its saved in the DB', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', todoName);
      expect(res.body).toHaveProperty('priority');
      expect(res.body).toHaveProperty('_id');
    });
  });

  describe('PUT/ id', () => {
    let savedTodoDb;
    let updatedName;
    let id;

    beforeEach(async () => {
      updatedName = 'updated';
      savedTodoDb = new Todo({
        name: 'clean',
        priority: {
          _id: priority._id,
          name: priority.name,
          importance: priority.importance,
        },
      });
      user.todos.push(savedTodoDb);
      await user.save();
      id = savedTodoDb._id;
    });

    const exec = () => {
      todo = { name: updatedName, priorityId };

      return request(server)
        .put(`/api/todos/${id}`)
        .set('x-auth-token', token)
        .send(todo);
    };

    test('should return 401 if user is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    test('should return 404 if valid id is passed but todo is not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    test('should return 404 if invalid id is passed', async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });
    test('should return 400 if todo name is less than 5 char', async () => {
      updatedName = 'a';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    test('should return 400 if todo name is more than 250 char', async () => {
      updatedName = new Array(252).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    test('should return 400 if priorityId is valid but does not exist', async () => {
      updatedName = 'updated';
      priorityId = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(400);
    });

    test('should return 400 if priorityId is invalid', async () => {
      updatedName = 'updated';
      priorityId = 1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    test('should save and return the updated todo', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', updatedName);
      expect(res.body).toHaveProperty('_id', todo._id);
      expect(res.body).toHaveProperty('priority');
    });
  });

  describe('DELETE/ id', () => {
    let id;

    beforeEach(async () => {
      todo = new Todo({
        name: 'clean',
        priority: {
          _id: priority._id,
          name: priority.name,
          importance: priority.importance,
        },
      });
      user.todos.push(todo);
      await user.save();
      id = todo._id;
    });

    const exec = () => {
      return request(server)
        .delete(`/api/todos/${id}`)
        .set('x-auth-token', token);
    };

    test('should return 401 if user is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    test('should return 404 if valid id is passed but todo does not exist', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    test('should return 404 if invalid id is passed', async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    test('should return the todo if its deleted', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', todo.name);
      expect(res.body).toHaveProperty('_id', todo._id.toHexString());
      expect(res.body).toHaveProperty('priority');
    });
  });
});
