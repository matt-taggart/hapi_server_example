'use strict';

const Hapi = require('hapi');
const Boom = require('boom');
const Joi = require('joi');

const server = new Hapi.Server();

const data = require('./data/instructors');

server.connection({
  host: 'localhost',
  port: 3001
});

const checkIfEmailExists = (request, reply) => {
  const filteredUsers = data.filter(x => x.email === request.payload.email);

  if (filteredUsers.length) {
    return reply(Boom.badRequest('user already exists'));
  }

  reply();
};

const createInstructorSlug = (request, reply) => {
  const slug = request.payload.name.split(' ').join('_');
  reply(slug.toLowerCase());
};

server.route({
  method: 'POST',
  path: '/api/instructors',
  config: {
    pre: [
      { method: checkIfEmailExists },
      { method: createInstructorSlug, assign: 'slug' }
    ],
    handler: (request, reply) => {
      let submittedData = request.payload;
      submittedData.id = data.length + 1;
      submittedData.slug = request.pre.slug;
      data.push(submittedData);
      reply(data.filter(x => x.email === submittedData.email));
    }
  }
});

server.start(err => {
  if (err) throw err;

  console.log(`Server running at ${server.info.uri}`);
});
