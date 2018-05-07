# restaurant-recommender-service
Back-end for Karina's Final Year Project

`ssh username@host.com`


To run the server:
```
    . ~/.bashrc
    cd ~/judge-13/Node.js/restaurant-recommender-service
    git pull origin master
    npm run build
    npm start
```

To stop the service:
```
    whosonport 8044 (should give you the process id that using the port)
    kill -9 {PID}   (kill the process by ID)
    whosonport 8044 (should say that nothing is using the port)
```

To look into the database:
```
    mysql -uroot -p
    use restaurant_recommender_db;
    show tables;
    SELECT * etc...
```
