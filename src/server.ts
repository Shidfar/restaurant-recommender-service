import * as path from 'path'
import * as BodyParser from 'body-parser'
import * as Express from 'express'
import * as expressValidator from 'express-validator'
import * as Cors from 'cors'

import Injector from './lib/dependency-injector'
import * as DB from './lib/db-wrapper'
import * as RatingAgent from './lib/rating-agent'

import { Context, DbWrapper, RatingAgentInterface } from 'index'

const pkgPath = path.join(__dirname, '../package.json')
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
    // application specific logging, throwing an error, or other logic here
})

const configPath = path.join(__dirname, `../config/${process.env.NODE_ENV}.json`)
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
    console.log(' Initializing services.')
    Injector.current.registerAsSingleton(DB.name, () => {
        return DB.Client(context)
    })
    Injector.current.register(RatingAgent.name, () => {
        return RatingAgent.Client(context, Injector.current.retrieve<DbWrapper>(DB.name))
    })

}

const initializeExpressRoutes = (context: Context, app = Express()) => {
    const { config } = context

    app.use(Cors({
        origin: config.cors.allowedOrigins,
        credentials: true
    }))
    app.use(BodyParser.text())
    app.disable('x-powered-by')

    const db = Injector.current.retrieve<DbWrapper>(DB.name)
    const ratingAgent = Injector.current.retrieve<RatingAgentInterface>(RatingAgent.name)

    app.get('/restaurants', async (req, res) => {
        try {
            const result = await db.getRestaurants()
            if (!result.length || result.length < 1) {
                return res.sendStatus(404)
            }
            const restaurantList = result.map((x: any) => {
                return {
                    idRestaurant: x.id,
                    name: x.name,
                    rating: Math.round(x.rating * 10) / 10 } })
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
                rating: (Math.round(desc.rating * 10) / 10),
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

    app.get('/restaurants/reviews/:restaurantId', async (req, res) => {
        try {
            const { restaurantId } = req.params
            const result = await db.getRestaurantReviewsById(restaurantId)
            const reviewList = result.map((r: any) => {
                return {
                    idReview: r.id,
                    userEmail: r.email,
                    review: r.review
                }
            })

            return res.send({ reviewList })
        } catch (e) {
            console.log(' error while processing request.', e)
            return res.sendStatus(404)
        }
    })

    app.post('/user/login', async (req, res) => {
        try {
            const { email, password } = req.body
            const lcEmail = email.toLowerCase()
            const lcPassword = password.toLowerCase()
            const match = await db.getUser(lcEmail, lcPassword)
            if (match.length != 1) {
                return res.sendStatus(404)
            }
            return res.send({ 'accountId': match[0].id })
        } catch (e) {
            console.log(' error while processing request.', e)
            return res.sendStatus(500)
        }
    })

    app.post('/user/register', async (req, res) => {
        try {
            const { email, password, phoneNumber, address } = req.body
            const lcEmail = email.toLowerCase()
            const lcPassword = password.toLowerCase()
            const result = await db.getUser(lcEmail, lcPassword)
            if (result.length > 0) {
                return res.sendStatus(409)
            }
            const obj = { email: lcEmail, password: lcPassword, phone: phoneNumber, address }
            await db.insertInto('users', obj)
            const match = await db.getUser(lcEmail, lcPassword)
            if (match.length != 1) {
                return res.sendStatus(404)
            }
            return res.send({ 'accountId': match[0].id })
        } catch (e) {
            console.log(' error while processing request.', e)
            return res.sendStatus(500)
        }

    })

    app.post('/user/restaurant/review/submit', async (req, res) => {
        try {
            const { restaurantId, accountId, review } = req.body
            const obj = {
                restaurant_id: restaurantId,
                user_id: accountId,
                review
            }
            await db.insertInto('reviews', obj)
            res.sendStatus(200)
        } catch (e) {
            console.log('Could not insert review')
            res.sendStatus(500)
        }
    })

    app.post('/user/restaurant/rate', async (req, res) => {
        try {
            const { restaurantId, accountId, rating } = req.body
            const obj = {
                restaurant_id: restaurantId,
                user_id: accountId,
                rating
            }
            await db.insertInto('ratings', obj)
            ratingAgent.rateRestaurant(restaurantId)
            return res.sendStatus(200)
        } catch (e) {
            console.log('Could not insert review')
            res.sendStatus(500)
        }
    })

    app.post('/user/order/submit', async (req, res) => {
        try {
            res.sendStatus(200)
        } catch (e) {
            console.log('Could not process the order')
            res.sendStatus(500)
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
