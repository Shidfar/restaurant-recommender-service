import * as path from 'path'
import * as BodyParser from 'body-parser'
import * as Express from 'express'
import * as expressValidator from 'express-validator'
import * as Cors from 'cors'
import * as FS from 'fs'

import Injector from './lib/dependency-injector'
import * as DB from './lib/db-wrapper'
import { Context, DbWrapper } from 'index'

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
        const userBase = require(`${dataPath}/users.json`)
        const context: Context = {
            config,
            userBase
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
    console.log(' Initializing services.')
    Injector.current.registerAsSingleton(DB.name, () => {
        return DB.Client(context)
    })
}

const initializeExpressRoutes = (context: Context, app = Express()) => {
    const { config, userBase } = context

    app.use(Cors({
        origin: config.cors.allowedOrigins,
        credentials: true
    }))
    app.use(BodyParser.text())
    app.disable('x-powered-by')

    const db = Injector.current.retrieve<DbWrapper>(DB.name)

    app.get('/restaurants', async (req, res) => {
        try {
            const result = await db.getRestaurants()
            if (!result.length || result.length < 1) {
                return res.sendStatus(404)
            }
            const restaurantList = result.map((x: any) => { return { idRestaurant: x.id, name: x.name } })
            return res.send({ restaurantList })
        } catch (e) {
            console.log(' error while processing request.', e)
            return res.sendStatus(404)
        }
    })

    app.get('/restaurants/description/:restaurantId', async (req, res) => {
        try {
            const { restaurantId } = req.params
            const result = await db.getRestaurantDescriptionById(restaurantId)
            if (!result.length || result.length < 1 || result.length > 1) {
                return res.sendStatus(404)
            }
            const desc = result[0]
            const obj = {
                ...desc,
                workingHours: desc.working_hours,
                idRestaurant: desc.restaurant_id,
                working_hours: undefined,
                id: undefined,
                restaurant_id: undefined
            }
            return res.send(obj)
        } catch (e) {
            console.log(' error while processing request.', e)
            return res.sendStatus(404)
        }
    })

    app.get('/restaurants/menu/:restaurantId', async (req, res) => {
        try {
            const { restaurantId } = req.params
            const result = await db.getRestaurantMenu(restaurantId)
            const menuId = result[0] && result[0].menu_id
            const menuList = result.map((m: any) => {
                return {
                    idFood: m.id,
                    nameFood: m.name,
                    description: m.description,
                    price: m.price
                }
            })
            const obj = {
                idRestaurant: restaurantId,
                idMenu: menuId,
                menuList
            }
            return res.send(obj)
        } catch (e) {
            console.log(' error while processing request.', e)
            return res.sendStatus(404)
        }
    })

    app.post('/user/login', (req, res) => {
        try {
            const { email, password } = req.body
            const match = userBase.filter(obj => obj.email === email && obj.password === password)
            if (match.length !== 1) {
                return res.sendStatus(404)
            }
            return res.send({ 'accountId': match[0].userId })
        } catch (e) {
            console.log(' error while processing request.', e)
            return res.sendStatus(500)
        }
    })

    app.post('/user/register', (req, res) => {
        try {
            const { email, password, phone, address } = req.body

            const match = userBase.filter(obj => obj.email === email)
            if (match.length === 1) {
                return res.sendStatus(409)
            }

            const len = userBase.length
            const userId = userBase[len - 1].userId + 1
            const obj = { userId, email, password, phone, address }
            userBase.push(obj)
            const json = JSON.stringify(userBase, undefined, 2)
            FS.writeFile(`${dataPath}/users.json`, json, 'utf8', () => {
                console.log('Write successful.')
                return res.send({ 'accountId': userId })
            })
        } catch (e) {
            console.log(' error while processing request.', e)
            return res.sendStatus(500)
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
