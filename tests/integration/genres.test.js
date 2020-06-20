const request = require('supertest');
const {Genre} = require('../../models/genre');
const {User} = require('../../models/user');
const mongoose = require('mongoose');
let server;

describe('/api/genres', () => {
    beforeEach(() => {
        server = require('../../index'); 
    });
    
    afterEach(async() => {
        await Genre.remove({});
        await server.close();
    })

    describe('GET /', () => {
        it('should return all genres', async() => {
            await Genre.collection.insertMany([
                {name: 'Genre1'},
                {name: 'Genre2'}
            ])
            
            const res = await request(server).get('/api/genres');
            
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'Genre1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'Genre2')).toBeTruthy();

        });
    });

    describe('GET /:id', () => {
        it('should return a genre if valid id is passed', async() => {
            const genre = new Genre({name: 'genre1'});
            await genre.save();

            const res = await request(server).get('/api/genres/' + genre._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);
        })

        it('should return a 404 if invalid id is passed', async() => {
            const res = await request(server).get('/api/genres/1');

            expect(res.status).toBe(404);
        })

        it('should return a 404 if no genre with the given id exist', async() => {
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get('/api/genres/' + id);

            expect(res.status).toBe(404);
        })

    })

    describe('POST /', () => {

        let token;
        let name ;

        const exec = async () => {
            return await request(server)
              .post('/api/genres')
              .set('x-auth-token', token)
              .send({ name });
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genre1';
        })

        it('should return 401 if client is not logged in', async() => {
            token = '';
            
            const res = await exec();

            expect(res.status).toBe(401);
        })

        it('should return 400 if genere is less then 5 character', async() => {

            name = '1234'

            const res = await exec();

            expect(res.status).toBe(400);
        })

        it('should return 400 if genere is more then 50 character', async() => {

            name = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        })

        it('should save the genre if it is valid', async() => {
            await exec();

            const genre = await Genre.find({name: 'genre1'});

            expect(genre).not.toBeNull();
        })

        it('should return the genre if it is valid', async() => {
            const res = await exec()

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre1');
        })
    })

    describe('PUT /', () => {

        let id;
        let token;
        let newName;
        let genre;

        const exec = async() => {
            return await request(server)
                .put('/api/genres/' + id)
                .set('x-auth-token', token)
                .send({ name: newName });
        }
        
        beforeEach(async() => {
            genre = new Genre({name: 'genre1'});
            await genre.save();

            token = new User().generateAuthToken();
            id = genre._id;
            newName = 'updateName'
        })

        it('should return 401 if client is not logged in', async() => {
            token = ''
            const res = await exec();
            expect(res.status).toBe(401);
        })

        it('should return 400 if genre is more than 50 characters', async() => {
            newName = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if genre is less then 5 character', async() => {
            newName = '1234';
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 404 id id is invalid', async() => {
            id = 1;
            const res = await exec();
            expect(res.status).toBe(404);
        })

        it('should return 404 if genre with the given id was not found', async() => {
            id = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        })

        it('should update the genre if input is valid', async() => {
            await exec();
            const updateGenre = await Genre.findById(genre._id);
            expect(updateGenre.name).toBe(newName);
        })

        it('should update the genre if valid name and id is passed', async() => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id')
            expect(res.body).toHaveProperty('name', newName);
        })


    })

    describe('DELETE /', () => {

        let id;
        let token;
        let genre;

        const exec = async() => {
            return await request(server)
                .delete('/api/genres/' + id)
                .set('x-auth-token', token)
                .send();
        }

        beforeEach(async() => {
            // Before each test we need to create a genre and 
            // put it in the database.   
            genre = new Genre({name: 'genre1'})
            await genre.save();
            
            id = genre._id;
            token = new User({isAdmin: true}).generateAuthToken();
        })

        it('should return 401 if the user is not logged in', async() => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        })

        it('should return 403 if user is not an admin', async() => {
            token = new User({isAdmin: false}).generateAuthToken();
            const res = await exec();
            expect(res.status).toBe(403);
        })

        it('should return 404 is id is invalid', async() => {
            id = 1;
            const res = await exec();
            expect(res.status).toBe(404);
        })

        it('should return 404 if no genre with the given id was found', async() => {
            id = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        })

        it('should delete the genre if input is valid', async() => {
            await exec();
            const genreInDb = await Genre.findById(id);
            expect(genreInDb).toBeNull();
        })

        it('should return the removed genre', async() => {
            const res = await exec();
            expect(res.body).toHaveProperty('_id', genre._id.toHexString());
            expect(res.body).toHaveProperty('name', genre.name);
        })
    })
});

