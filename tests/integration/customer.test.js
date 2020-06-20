const request = require('supertest')
const {Customer} = require('../../models/customer');

let server;

describe('/api/customers', () => {
    
    beforeEach(async() => {
        server = require('../../index');
    })

    afterEach(async() => {
        await Customer.remove({});
        await server.close();
    })

    describe('POST /', () => {
        let name;
        let phone;

        const exec = async() => {
            return await request(server)
                .post('/api/customers')
                .send({
                    name,
                    isGold: false,
                    phone
                })
        }

        it('should return 400 if name is not provided', async() => {
            phone = '12345';
            name = '';
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if name is less then 5 characters', async() => {
            phone = '12345';
            name = '1234';
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if name is greater then 50 characters', async() => {
            phone = '12345';
            name = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if phone is not provided', async() => {
            name = '12345';
            phone = '';
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if phone is less then 5 characters', async() => {
            name = '12345';
            phone = '1234';
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if phone is greater then 50 characters', async() => {
            name = '12345';
            phone = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        })
    })

    describe('PUT /', () => {
        let customer;
        let name;
        let phone;
        let id;

        beforeEach(async() => {
            customer = new Customer({
                name: '12345',
                isGold: false,
                phone: '12345'
            })
            await customer.save();
            id = customer._id;
        })

        const exec = async() => {
            return await request(server)
                .put('/api/customers/' + id)
                .send({
                    name,
                    isGold: false,
                    phone
                })
        }

        it('should return 400 if name is not provided', async() => {
            phone = '12345';
            name = '';
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if name is less then 5 characters', async() => {
            phone = '12345';
            name = '1234';
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if name is greater then 50 characters', async() => {
            phone = '12345';
            name = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if phone is not provided', async() => {
            name = '12345';
            phone = '';
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if phone is less then 5 characters', async() => {
            name = '12345';
            phone = '1234';
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if phone is greater then 50 characters', async() => {
            name = '12345';
            phone = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        })
    })
})
