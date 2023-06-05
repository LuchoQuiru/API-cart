const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require("path");
const { auth } = require('express-oauth2-jwt-bearer');
const expressSanitizer = require('express-sanitizer');

const cors = require('cors')


//swagger
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerSpec = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Catalogo de productos y pedidos",
            version: "1.0.0"
        },
        servers: [
            {
                //url: "https://obscure-caverns-72816.herokuapp.com/"
                url: "http://localhost:5000"
            }
        ]
    },
    apis: [`${path.join(__dirname, "./routes/*.js")}`]
}

//settings
app.set('port', process.env.PORT || 5000); //Heroku probablemente nos asigne un puerto. Sino, port=5000;
app.set('json spaces' , 2); // para mejorar la visualizacion de los json


//middlewares
app.use(morgan('dev')); //o 'combined' proporciona mas informacion
app.use(express.json()) //recibo y entiendo formatos json 
app.use(express.urlencoded({extended:false})) //voy a tratar de entender datos recibidos en formularios. 
app.use("/api-doc",swaggerUI.serve, swaggerUI.setup(swaggerJsDoc(swaggerSpec)));

app.use(cors())

app.use(expressSanitizer());

//routes
app.use(require('./routes/users.js'));
app.use(require('./routes/productos.js'));
app.use(require('./routes/categorias.js'));
app.use(require('./routes/ofertas.js'));
app.use(require('./routes/pedidos.js'));
app.use(require('./routes/detalles.js'));

//starting server
app.listen(app.get('port'), () => {
    console.log(`server on port ${app.get('port')} je!`);
});