'use strict'

const mongoose = require('mongoose');
const app = require('./app');
const port = process.env.PORT || 3000;

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
mongoose.connect(`mongodb://localhost:27017/forum`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('La conexión a la base de dato se ha realizado correctamente');

        app.listen(port, () => {
            console.log(`El servidor se ha iniciado correctamente en la url http://localhost:${port}`);
        });
    })
    .catch(error => console.log('No se ha pdido conectar a la base de datos. Error: ', error));

