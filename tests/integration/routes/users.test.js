const request = require('supertest');
const { User } = require('../../../models/user');
const jwt = require('jsonwebtoken');
const config = require('config');

describe('/api/users', () => {
  let server;
  let registeredUser;
  let user;

  beforeEach(async () => {
    server = require('../../../index');
    registeredUser = new User({
      name: 'John', // 3 - 50
      username: 'john96', // 5 - 50
      email: 'john@gmail.com', // 5 - 250 email
      password: '12345', // 5 - 250
    });

    user = {
      name: 'Anna',
      username: 'anna96',
      email: 'anna@gmail.com',
      password: '12345',
    };

    await registeredUser.save();
  });

  afterEach(async () => {
    await server.close();
    await User.remove({});
  });

  const exec = () => {
    return request(server).post('/api/users').send(user);
  };

  test('should return the user if its registered', async () => {
    const res = await exec();

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', user.name);
    expect(res.body).toHaveProperty('email', user.email);
    expect(res.body).toHaveProperty('username', user.username);
    expect(res.body).toHaveProperty('_id');
  });

  test('should return the token from the header if user is registered', async () => {
    const res = await exec();

    expect(res.header).toHaveProperty('x-auth-token');
  });

  test('the returned token should have _id, name, username, email, isAdmin', async () => {
    const res = await exec();

    const token = res.header['x-auth-token'];
    const decode = jwt.verify(token, config.get('jwtPrivateKey'));

    expect(decode).toHaveProperty('_id');
    expect(decode).toHaveProperty('name', user.name);
    expect(decode).toHaveProperty('email', user.email);
    expect(decode).toHaveProperty('username', user.username);
    expect(decode).toHaveProperty('isAdmin', false);
  });

  test('should return 400 if user is already registered with this email', async () => {
    user.email = registeredUser.email;

    const res = await exec();

    expect(res.status).toBe(400);
  });

  test('should return 400 if user is already registered with this username', async () => {
    user.username = registeredUser.username;

    const res = await exec();

    expect(res.status).toBe(400);
  });

  test('should return 400 if name is less than 3 char', async () => {
    user.name = 'a';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  test('should return 400 if name is more than 50 char', async () => {
    user.name = new Array(52).join('a');

    const res = await exec();

    expect(res.status).toBe(400);
  });

  test('should return 400 if username is less than 5 char', async () => {
    user.username = 'a';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  test('should return 400 if username is less more than 50 char', async () => {
    user.username = new Array(52).join('a');

    const res = await exec();

    expect(res.status).toBe(400);
  });

  test('should return 400 if email is less than 5 char', async () => {
    user.email = 'a';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  test('should return 400 if email is more than 250 char', async () => {
    user.email = new Array(52).join('a');

    const res = await exec();

    expect(res.status).toBe(400);
  });

  test('should return 400 if email is not in valid email format', async () => {
    user.email = new Array(10).join('a');

    const res = await exec();

    expect(res.status).toBe(400);
  });

  test('should return 400 if password is less than 5 char', async () => {
    user.password = 'a';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  test('should return 400 if password is more than 250 char', async () => {
    user.password = new Array(252).join('a');

    const res = await exec();

    expect(res.status).toBe(400);
  });
});
