const { Router } = require('express'); //requiero el modulo router de express
const { Client } = require('pg'); //requiero el modulo client de pg
const router = Router();
const client = require('../database/db_client.js');
const checkJwt = require('../middleware/auth0')
const { body, validationResult } = require('express-validator');

const escape = require('pg-escape');

//SWAGGER
/** 
 *  @swagger
 *  components:
 *      schemas:
 *           Detalle:
 *               type: object
 *               properties:
 *                   id_pedido:
 *                       type: number
 *                       description: El id del pedido al que pertenece
 *                   id_producto:
 *                       type: number
 *                       description: El id del producto al que pertenece
 *                   cantidad:
 *                       type: number
 *                       description: La cantidad de productos
 *                   total:
 *                       type: number
 *                       description: El precio total (cantidad*precio)
 *               required:
 *                   - id_pedido
 *                   - id_producto
 *                   - cantidad
 *                   - total
 *               example:
 *                   id_pedido: 1
 *                   id_producto: 1
 *                   cantidad: 20 
 *                   total: 6400
*/

//ROUTES

//GET

/**
 * @swagger
 * /detalle/{id_pedido}:
 *  get:
 *      security: 
 *          - bearerAuth: []
 *      summary: Retorna todos los detalles asociado a un pedido
 *      tags: [Detalle]
 *      parameters:
 *          -   in: path
 *              name: id_pedido
 *              schema:
 *                  type: string
 *              required: true
 *              description: Id del detalle
 *      responses:
 *          200:
 *              description: Todos los detalles registrados sobre el pedido
 *              content:
 *                  aplicattion/json:
 *                      schema:
 *                          type: json
 *                          items:
 *                              $ref: '#/components/schemas/Detalle'
 *      
 */
router.get('/detalle/:id_pedido', checkJwt , (req,res) => get_detalle(req,res));

function get_detalle(req,res) {
    const id_pedido = req.params.id_pedido;
    client.query(escape(`select d.id_pedido, p.nombre_producto as nombre, d.cantidad, d.total from detalles d inner join productos p on p.id = d.id_producto where id_pedido = ${id_pedido}`) , (cliente_err, cliente_res) => { 
            res.json(cliente_res.rows); 
    });   
}

//POST
/**
 * @swagger
 * /detalle:
 *  post:
 *      security: 
 *          - bearerAuth: []
 *      summary: Crea un nuevo detalle
 *      tags: [Detalle]
 *      requestBody: 
 *          required: true
 *          content: 
 *              application/json:
 *                  schema:
 *                      type: object
 *                      $ref: '#/components/schemas/Detalle'
 *      responses:
 *          200:
 *              description: Nuevo detalle agregado!
 *      
 */

router.post('/detalle',
    body('id_pedido').isNumeric(), 
    body('id_producto').isNumeric(), 
    body('cantidad').isNumeric(), 
    body('total').isNumeric(), 
(req,res) => post_detalle(req,res));

function post_detalle(req,resdet) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    text = escape('INSERT INTO detalles(id_pedido, id_producto, cantidad , total) VALUES($1, $2, $3, $4) RETURNING *')
    values = [req.body.id_pedido, req.body.id_producto, req.body.cantidad, req.body.total]


    client.query(text, values, (err, res) => {
        if (err){
            console.log(err.stack)
            resdet.send("Error en el registro!");
        }
        else{
            console.log(res.rows[0])
            resdet.send("Detalle registrado!");
        }
    })
}

//PUT
/**
 * @swagger
 * /detalle/{id}:
 *  put:
 *      security: 
 *          - bearerAuth: []
 *      summary: Actualiza el detalle
 *      tags: [Detalle]
 *      parameters:
 *          -   in: path
 *              name: id
 *              schema:
 *                  type: string
 *              required: true
 *              description: Id del detalle
 *      requestBody: 
 *          required: true
 *          content: 
 *              application/json:
 *                  schema:
 *                      type: object
 *                      $ref: '#/components/schemas/Detalle'
 *      responses:
 *          200:
 *              description: Detalle editado!
 *          404:
 *              description: Detalle no encontrado
 *      
 */

router.put('/detalle/:id', checkJwt,
    body('id_pedido').isNumeric(), 
    body('id_producto').isNumeric(),
    body('cantidad').isNumeric(), 
    body('total').isNumeric(), 
(req,res) => put_detalle(req,res));

function put_detalle(req,resdet){
    const id = req.params.id;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const text = escape(`UPDATE detalles SET id_pedido = $1, id_producto = $2, cantidad = $3, total = $4 where id=${id} RETURNING *`); 
    const values = [req.body.id_pedido, req.body.id_producto, req.body.cantidad, req.body.total]

    client.query(text, values, (err, res) => {
        if (err){
            console.log(err.stack)
            resdet.send("Error en el edit del detalle");
        }
        else{
            console.log(res.rows[0])
            resdet.send("Detalle editado!");
        }
    })

}

//DELETE
/**
 * @swagger
 * /detalle/{id}:
 *  delete:
 *      security: 
 *          - bearerAuth: []
 *      summary: Elimina al detalle referenciado por el id
 *      tags: [Detalle]
 *      parameters:
 *          -   in: path
 *              name: id
 *              schema:
 *                  type: string
 *              required: true
 *              description: id del detalle
 *      responses:
 *          200:
 *              description: Detalle elimiando!
 *          404:
 *              description: Detalle no encontrado
 *      
 */

router.delete('/detalle/:id', checkJwt, (req,res) => delete_detalle(req,res));

function delete_detalle(req,resdet){
    const id = req.params.id;
    const text = escape(`DELETE FROM DETALLES WHERE ID = ${id}`) 
    
    client.query(text, (err, res) => {
        if (err){
            console.log(err.stack)
            resdet.send("Error en el delete detalle")
        }
        else{
            console.log(res.rows[0])
            resdet.send("Detalle eliminado!")
        }
    })
}

module.exports = router;