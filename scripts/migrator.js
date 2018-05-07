const mysql = require('mysql');

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '1234',
    database : 'restaurant_recommender_db'
});
connection.connect();

function insertData(table, values) {
    return new Promise((resolve) => {
        try {
            const query = connection.query(`INSERT INTO ${table} SET ?`, values,
                (error, results, fields) => {
                    if (error) throw error;
                    console.log(query.sql);
                    return resolve();
                });
        } catch (e) {
            console.log('Error: ', e)
        }
    })
}

const menu11 = require('../data/menu/11.json');
const menu12 = require('../data/menu/12.json');

const descs11 = require('../data/restaurants/11.json');
const descs12 = require('../data/restaurants/12.json');

const restaurants = require('../data/restaurants-list.json');
const users = require('../data/users.json');

(async () => {
    for (user of users) {
        const { email, password, phone, address } = user
        const values = { email, password, phone, address }
        await insertData('users', values)
    }

    let c = 1;
    for (restaurant of restaurants.restaurantList) {
        const { name } = restaurant
        const values = { name }
        await insertData('restaurants', values)
        await insertData('restaurant_menu', { restaurant_id: c })
        c++;
    }

    let { name, workingHours: working_hours, address, cuisine, image, rating } = descs11

    await insertData('restaurant_descriptions', { restaurant_id: 1, name, working_hours, address, cuisine, image, rating })
    ({ name, workingHours: working_hours, address, cuisine, image, rating } = descs12)
    await insertData('restaurant_descriptions', { restaurant_id: 2, name, working_hours, address, cuisine, image, rating })

    for (menu of menu11.menuList) {
        const { nameFood: name, description, price } = menu
        await insertData('food', { menu_id: 1, name, description, price })
    }

    for (menu of menu12.menuList) {
        const { nameFood: name, description, price } = menu
        await insertData('food', { menu_id: 1, name, description, price })
    }

})()