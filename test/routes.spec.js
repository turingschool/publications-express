const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

chai.use(chaiHttp);

describe('Client Routes', () => {
  it('should return the homepage with text', done => {
    chai.request(server)
      .get('/')
      .end((err, response) => {
        response.should.have.status(200);
        response.should.be.html;
        response.res.text.should.equal('Hello, Publications!');
        done();
      });
  });

  it('should return a 404 for a route that does not exist', done => {
    chai.request(server)
      .get('/sad')
      .end((err, response) => {
        response.should.have.status(404);
        done();
      });
  });

});

describe('API Routes', () => {

  before((done) => {
    database.migrate.latest()
      .then( () => done())
      .catch(error => {
        throw error;
      });
  });

  beforeEach((done) => {
    database.seed.run()
      .then(() => done())
      .catch(error => {
        throw error;
      });
  });

  describe('GET /api/v1/papers', () => {
  it('should return all of the papers', done => {
    chai.request(server)
      .get('/api/v1/papers')
      .end((err, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');
        response.body.length.should.equal(1);
        response.body[0].should.have.property('title');
        response.body[0].title.should.equal('Fooo');
        response.body[0].should.have.property('author');
        response.body[0].author.should.equal('Bob');
        response.body[0].should.have.property('publisher');
        response.body[0].publisher.should.equal('Minnesota');
        done();
      });
    });
  });


  describe('POST /api/v1/papers', () => {
    it('should create a new paper', done => {
      chai.request(server)
      // Notice the change in the verb
        .post('/api/v1/papers')
        // Here is the information sent in the body or the request
        .send({
          title: 'Waterfall Wow',
          author: 'Amy'
        })
        .end((err, response) => {
          // Different status here
          response.should.have.status(201);
          response.body.should.be.a('object');
          response.body.should.have.property('id');
          done();
        });
    });

    it('should not create a record with missing data', done => {
      chai.request(server)
        .post('/api/v1/papers')
        .send({
          title: 'Waterfall Wow' //missing author property
        })
        .end((err, response) => {
          response.should.have.status(422);
          response.body.error.should.equal(`Expected format: { title: <String>, author: <String> }. You're missing a "author" property.`);
          done();
        });

      });
    });

});
