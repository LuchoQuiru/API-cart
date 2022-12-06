const { Router } = require('express'); //requiero el modulo router de express
const { Client } = require('pg'); //requiero el modulo client de pg
const router = Router();
const client = require('../database/db_client.js');
const { body, validationResult, check } = require('express-validator');
const checkJwt = require('../middleware/auth0')
const escape = require('pg-escape');

//SWAGGER
/** 
 *  @swagger
 *  components:
 *      schemas:
 *           Categoria:
 *               type: object
 *               properties:
 *                      categoria:
 *                       type: string
 *                       description: El nombre de la categoria
 *               required:
 *                   -  categoria
 *               example:
 *                   nombre: Bebidas sin alcohol
*/

////////ROUTES

/**
 * @swagger
 * /categorias:
 *  get:
 *      security: 
 *          - bearerAuth: []
 *      summary: Retorna todas las categorias
 *      tags: [Categoria]
 *      responses:
 *          200:
 *              description: Todas las categorias registradas
 *              content:
 *                  aplicattion/json:
 *                      schema:
 *                          type: json
 *                          items:
 *                              $ref: '#/components/schemas/Categoria'
 *      
 */

//GET
router.get('/categorias', checkJwt, (req,res) => get_categorias(res));

function get_categorias(res) {
    client.query(escape('select * from categoria'), (cliente_err, cliente_res) => { 
            res.json(cliente_res.rows);  
    });
    
    
}

/**
 * @swagger
 * /categorias/{id}:
 *  get:
 *      security: 
 *          - bearerAuth: []
 *      summary: Retorna la categoria asociada al id
 *      tags: [Categoria]
 *      parameters:
 *          -   in: path
 *              name: id
 *              schema:
 *                  type: string
 *              required: true
 *              description: Id de la categoria
 *      responses:
 *          200:
 *              description: Todos las categorias registradas
 *              content:
 *                  aplicattion/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/Categoria'
 *          404:
 *              description: Categoria no encontrado
 *      
 */

//GET by id
router.get('/categorias/:id', checkJwt, (req,res) => get_categorias_byid(req,res));

function get_categorias_byid(req,res) {
    const id = req.params.id;
    client.query(escape(`select * from categoria where id = ${id}`), (cliente_err, cliente_res) => { 
            res.json(cliente_res.rows);  
    });
    
}

module.exports = router;