const { Router } = require('express'); //requiero el modulo router de express
const { Client } = require('pg'); //requiero el modulo client de pg
const router = Router();
const client = require('../database/db_client.js');
const { body, validationResult } = require('express-validator');
const escape = require('pg-escape');

const checkJwt = require('../middleware/auth0')

/**
*  @swagger
* 
*  components:
*      securitySchemes:
*          bearerAuth:
*              type: http
*              scheme: bearer
*              bearerformat: JWT
*/



//SWAGGER
/** 
 *  @swagger
 * 
 *  components: 
 *      schemas:
 *           Usuario:
 *               type: object
 *               properties:
 *                   name:
 *                       type: string
 *                       description: El nombre del usuario
 *                   email:
 *                       type: string
 *                       format: email 
 *                       description: Email asociado al usuario
 *                   password:
 *                       type: string
 *                       description: Pass asociada al usuario
 *               required:
 *                   - name
 *                   - email
 *                   - password
 *               example:
 *                   name: Chester J Lampwick
 *                   email: ChesterJL@millionarie.com
 *                   password: chesterjl2020 
 *     
*/

//////////////////ROUTES

//GET
/**
 * @swagger
 * /usuarios:
 *  get:
 *      security: 
 *          - bearerAuth: []
 *      summary: Retorna todos los usuarios
 *      tags: [Usuario]
 *      responses:
 *          200:
 *              description: Todos los usuarios registrados
 *              content:
 *                  aplicattion/json:
 *                      schema:
 *                          type: json
 *                          items:
 *                              $ref: '#/components/schemas/Usuario'
 *      
 */
router.get('/usuarios', checkJwt, (req, res) => get_usuarios(req, res));

function get_usuarios(req, res) {
    client.query('select * from users', (cliente_req, cliente_res) => {
        res.json(cliente_res.rows);
    });
}

//GET by id
/**
 * @swagger
 * /usuarios/{email}:
 *  get:
 *      security: 
 *          - bearerAuth: []
 *      summary: Retorna el usuario asociado al email
 *      tags: [Usuario]
 *      parameters:
 *          -   in: path
 *              name: email
 *              schema:
 *                  type: string
 *              required: true
 *              description: email del usuario
 *      responses:
 *          200:
 *              description: Usuario asociado al email
 *              content:
 *                  aplicattion/json:
 *                      schema:
 *                          type: json
 *                          items:
 *                              $ref: '#/components/schemas/Usuario'
 *      
 */
router.get('/usuarios/:email', (req, res) => get_usuarios_byid(req, res));

function get_usuarios_byid(req, res) {
    const email = req.params.email;
    client.query(escape(`select * from users where email = ${"'"+email+"'"}`), (cliente_err, cliente_res) => { 
        res.json(cliente_res.rows);
    });
}

//POST
/**
 * @swagger
 * /usuarios: 
 *  post:
 *      security: 
 *          - bearerAuth: []
 *      summary: Crea un nuevo usuario
 *      tags: [Usuario]
 *      requestBody: 
 *          required: true
 *          content: 
 *              application/json:
 *                  schema:
 *                      type: object
 *                      $ref: '#/components/schemas/Usuario'
 *      responses:
 *          200:
 *              description: Nuevo usuario agregado!
 *          400:
 *              description: Error al agregar usuario!
 *      
 */
router.post('/usuarios', checkJwt,
    body('email').isEmail(),
    (req, res) => post_usuario(req, res));

function post_usuario(req, resuser) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resuser.status(400).json({ errors: errors.array() });
    }
    const text = 'INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING *'
    const values = [req.body.email,req.body.email,'admin']

    client.query(text, values, (err, res) => {
        if (err) {
            resuser.send("Error intentado registrar el usuario")
        }
        else {
            console.log(res.rows)
            resuser.send(res.rows)
        }
    })


}

module.exports = router;