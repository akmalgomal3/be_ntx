import { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../server.js';

chai.use(chaiHttp);

describe('API Tests', () => {
    let token;

    before(done => {
        chai.request(app)
            .post('/api/login')
            .send({ username: 'testuser', password: 'testpassword' })
            .end((err, res) => {
                if (err) return done(err);
                token = res.body.token;
                done();
            });
    });

    describe('GET /api/data', () => {
        it('should return 200 OK when valid token and role', done => {
            chai.request(app)
                .get('/api/data')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    describe('POST /api/survey', () => {
        it('should return 200 OK when valid token', done => {
            chai.request(app)
                .post('/api/survey')
                .set('Authorization', `Bearer ${token}`)
                .send({ surveyData: 'example data' })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    describe('GET /api/survey-stats', () => {
        it('should return 200 OK when valid token', done => {
            chai.request(app)
                .get('/api/survey-stats')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    describe('POST /api/login', () => {
        it('should return 200 OK and a token', done => {
            chai.request(app)
                .post('/api/login')
                .send({ username: 'testuser', password: 'testpassword' })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('token');
                    done();
                });
        });
    });
});
