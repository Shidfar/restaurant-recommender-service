import * as MySQL from 'mysql'

import { Context, DbWrapper } from 'index'

export const name = 'db-wrapper'

export function Client(context: Context): DbWrapper {
    const pool  = MySQL.createPool({
        host     : 'localhost',
        user     : 'root',
        password : '1234',
        database : 'restaurant_recommender_db'
    })

    function insertInto(table: string, values: any): Promise<any> {
        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if (err) {
                    console.log('Could not get connection from the pool.', err)
                    return reject(err)
                }
                connection.query(`INSERT INTO ${table} SET ?`, values, (error, results, fields) => {
                    connection.release()
                    if (error) {
                        console.log('Could not query.', error, results)
                        return reject(error)
                    }
                    return resolve(results)
                })
            })
        })
    }

    function updateRestaurantRating(restaurantId: number, rating: number): Promise<any> {
        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if (err) {
                    console.log('Could not get connection from the pool.', err)
                    return reject(err)
                }
                const q = `UPDATE restaurant_descriptions SET rating=${rating} WHERE id=${restaurantId};
                           UPDATE restaurants SET rating=${rating} WHERE id=${restaurantId}`
                connection.query(q, (error, results, fields) => {
                    connection.release()
                    if (error) {
                        console.log('Could not query.', error, results)
                        return reject(error)
                    }
                    return resolve(results)
                })
            })
        })
    }

    function getRestaurants(): Promise<any> {
        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if (err) {
                    console.log('Could not get connection from the pool.', err)
                    return reject(err)
                }
                connection.query(`SELECT * FROM restaurants`, (error, results, fields) => {
                    connection.release()
                    if (error) {
                        console.log('Could not query.', error, results)
                        return reject(error)
                    }
                    return resolve(results)
                })
            })
        })
    }

    function getRestaurantReviewsById(restaurantId: number): Promise<any> {
        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if (err) {
                    console.log('Could not get connection from the pool.', err)
                    return reject(err)
                }
                const q = `SELECT r.id, r.review, u.email FROM reviews r
                            INNER JOIN users u ON (u.id = r.user_id)
                            WHERE r.restaurant_id = ${restaurantId}`
                connection.query(q, (error, results, fields) => {
                    connection.release()
                    if (error) {
                        console.log('Could not query.', error, results)
                        return reject(error)
                    }
                    return resolve(results)
                })
            })
        })
    }

    function getRestaurantDescriptionById(restaurantId: number): Promise<any> {
        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if (err) {
                    console.log('Could not get connection from the pool.', err)
                    return reject(err)
                }
                connection.query(`SELECT * FROM restaurant_descriptions WHERE restaurant_id = ${restaurantId}`, (error, results, fields) => {
                    connection.release()
                    if (error) {
                        console.log('Could not query.', error, results)
                        return reject(error)
                    }
                    return resolve(results)
                })
            })
        })
    }

    function getRestaurantMenu(restaurantId: number): Promise<any> {
        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if (err) {
                    console.log('Could not get connection from the pool.', err)
                    return reject(err)
                }
                const q = `SELECT * FROM food
                            WHERE menu_id
                            IN ( SELECT id FROM restaurant_menu WHERE restaurant_id = ${restaurantId} )`
                connection.query(q, (error, results, fields) => {
                    connection.release()
                    if (error) {
                        console.log('Could not query.', error, results)
                        return reject(error)
                    }
                    return resolve(results)
                })
            })
        })
    }

    function getUser(email: string, password: string): Promise<any> {
        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if (err) {
                    console.log('Could not get connection from the pool.', err)
                    return reject(err)
                }
                const q = `SELECT id FROM users WHERE email = "${email}" AND password = "${password}"`
                connection.query(q, (error, results, fields) => {
                    connection.release()
                    if (error) {
                        console.log('Could not query.', error, results)
                        return reject(error)
                    }
                    return resolve(results)
                })
            })
        })
    }

    function getRestaurantRatingById(restaurantId: number): Promise<any> {
        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if (err) {
                    console.log('Could not get connection from the pool.', err)
                    return reject(err)
                }
                const q = `SELECT AVG(rating) AS rating FROM ratings WHERE restaurant_id=${restaurantId}`
                connection.query(q, (error, results, fields) => {
                    connection.release()
                    if (error) {
                        console.log('Could not query.', error, results)
                        return reject(error)
                    }
                    return resolve(results)
                })
            })
        })
    }

    return {
        insertInto, getRestaurants,
        getRestaurantDescriptionById,
        getRestaurantMenu, getUser,
        updateRestaurantRating, getRestaurantRatingById,
        getRestaurantReviewsById
    }
}
