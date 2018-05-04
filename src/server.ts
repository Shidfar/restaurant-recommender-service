import * as path from 'path'
import * as BodyParser from 'body-parser'
import * as Express from 'express'
import * as expressValidator from 'express-validator'
import * as Cors from 'cors'
import * as FS from 'fs'

import { Context, Config } from 'index'

const pkgPath = path.join(__dirname, '../package.json')
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
    // application specific logging, throwing an error, or other logic here
})

const configPath = path.join(__dirname, `../config/${process.env.NODE_ENV}.json`)
const dataPath = path.join(__dirname, `../data`)
export default async () => {
    try {
        const app = Express()
        app.use(BodyParser.json())
        app.use(expressValidator())

        const config = require(configPath)
        const context: Context = {
            config
        }
        // initialize services
        initializeServices(context)

        // initialize rotes
        initializeExpressRoutes(context, app)

    } catch (err) {
        console.error('Failed to start service...', err)
    }
}

const initializeServices = (context: Context) => {
    console.log(' >> initializing services.')
}

const initializeExpressRoutes = (context: Context, app = Express()) => {
    const { config } = context

    app.use(Cors({
        origin: config.cors.allowedOrigins,
        credentials: true
    }))
    app.use(BodyParser.text())
    app.disable('x-powered-by')

    app.get('/restaurants', (req, res) => {
        try {
            const obj = JSON.parse(FS.readFileSync(`${dataPath}/restaurants-list.json`, 'utf8'))
            res.send(obj)
        } catch (e) {
            console.log(' error while processing request.', e)
            res.sendStatus(404)
        }
    })

    app.get('/restaurants/description/:rId', (req, res) => {
        try {
            const { rId } = req.params
            const obj = JSON.parse(FS.readFileSync(`${dataPath}/restaurants/${rId}.json`, 'utf8'))
            res.send(obj)
        } catch (e) {
            console.log(' error while processing request.', e)
            res.sendStatus(404)
        }
    })

    app.get('/restaurants/menu/:mId', (req, res) => {
        try {
            const { mId } = req.params
            const obj = JSON.parse(FS.readFileSync(`${dataPath}/menu/${mId}.json`, 'utf8'))
            res.send(obj)
        } catch (e) {
            console.log(' error while processing request.', e)
            res.sendStatus(404)
        }
    })

    // Add a catchall handler, for 404
    app.all('*', (req, res) => {
        return res.sendStatus(404)
    })

    app.listen(config.app.port, config.app.host, (err: any) => {
        if (err) {
            throw err
        }

        console.info(`Server listening on ${config.app.host}:${config.app.port}`)
    })
}
