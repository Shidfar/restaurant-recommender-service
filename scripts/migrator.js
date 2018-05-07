const mysql = require('mysql');

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '1234',
    database : 'restaurant_recommender_db'
});

function insertData(table, values) {
    try {
        return new Promise((resolve) => {
            connection.connect();
            const query = connection.query(`INSERT INTO ${table} SET ?`, values,
                (error, results, fields) => {
                    if (error) throw error;
                });
            connection.end(() => {
                console.log(query.sql);
                return resolve()
            });
        })
    } catch (e) {
        console.log('Error: ', e)
    }
}

const menu11 = require('../data/menu/11.json');
const menu12 = require('../data/menu/12.json');

const descs11 = require('../data/restaurants/11.json');
const descs12 = require('../data/restaurants/12.json');

const restaurants = require('../data/restaurants-list.json');
const users = require('../data/users.json');

(async () => {
    for (user of users) {
        const values = { ...user, userId: undefined }
        await insertData('users', values)
    }

    for (restaurant of restaurants) {
        const values = { ...restaurant, idRestaurant: undefined }
        await insertData('restaurants', values)
        await insertData('restaurant_menu', { restaurant_id: restaurant.idRestaurant })
    }

    for (restaurant of restaurants) {
        const values = { ...restaurant, idRestaurant: undefined }
        await insertData('restaurants', values)
    }
    await insertData('restaurant_menu', { restaurant_id: 1 })
    await insertData('restaurant_menu', { restaurant_id: 2 })
    await insertData('restaurant_descriptions', { ...descs11,
        restaurant_id: 1,
        workingHours: undefined,
        working_hours: descs11.workingHours,
        idRestaurant: undefined
    })

    await insertData('restaurant_descriptions', { ...descs12,
        restaurant_id: 2,
        workingHours: undefined,
        working_hours: descs11.workingHours,
        idRestaurant: undefined
    })

    for (menu of menu11.menuList) {
        await insertData('food', { ...menu,
            menu_id: 1,
            idFood: undefined,
            nameFood: undefined,
            name: menu.nameFood
        })
    }

    for (menu of menu12.menuList) {
        await insertData('food', { ...menu,
            menu_id: 2,
            idFood: undefined,
            nameFood: undefined,
            name: menu.nameFood
        })
    }

})()