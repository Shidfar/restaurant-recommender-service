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

    return { insertInto, getRestaurants, getRestaurantDescriptionById }
}
