require('dotenv').config('test')
const supertest = require('supertest')
const automationRouter = require('../src/routers/automationRouter')

let agent = supertest(automationRouter)

describe('Automations', () => {

    beforeAll(() => {
        const app = require('express')()
        app.use(automationRouter)
        agent = supertest(app)
    })

    it('Get all', async () => {
        const res = await agent.get('/')

        expect(res.statusCode).toEqual(200)
    })

    it('Get existing', async () => {
        const res = await agent.get('/1')

        expect(res.statusCode).toEqual(200)
    })

    it('Get nonexisting', async () => {
        const res = await agent.get('/-1')

        expect(res.statusCode).toEqual(404)
    })

    it('Start', async () => {
        const res = await agent.post('/1/start')

        expect(res.statusCode).toEqual(202)
    })

    it('Stop', async () => {
        await agent
            .post('/1/stop')
            .expect(202)
    })

    it('Insert invalid', async () => {
        const res = await agent.post('/')
            .send({})
            .set("Content-Type", "application/json")

        expect(res.statusCode).toEqual(400)
    })


    it('Update Automation', async () => {
        const res = await agent.patch('/1')
            .send({
                name: "Automação teste"
            })
            .set("Content-Type", "application/json")
    })
})
