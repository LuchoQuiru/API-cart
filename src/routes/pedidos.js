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
 *           Pedido:
 *               type: object
 *               properties:
 *                   total:
 *                       type: number
 *                       description: El total del pedido
 *                   id_usuario:
 *                       type: number
 *                       description: El identificador asociado al usuario
 *               required:
 *                   - total
 *                   - id_usuario
 *               example:
 *                   total: 1500
 *                   id_usuario: 5
*/

//routes

//GET by id
/**
 * @swagger
 * /pedidos/{id}:
 *  get:
 *      security: 
 *          - bearerAuth: []
 *      summary: Retorna el pedido asociado al id
 *      tags: [Pedido]
 *      parameters:
 *          -   in: path
 *              name: id
 *              schema:
 *                  type: string
 *              required: true
 *              description: Id del pedido
 *      responses:
 *          200:
 *              description: El pedido asociado al id
 *              content:
 *                  aplicattion/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/Pedido'
 *          404:
 *              description: Pedido no encontrado
 *      
 */

 router.get('/pedidos/:id',checkJwt, (req,res) => get_pedidos_byid(req,res));

 function get_pedidos_byid(req,res) {
     const id = req.params.id;
     client.query(escape(`select * from pedidos where id_usuario = ${id}`), (cliente_err, cliente_res) => { 
             res.json(cliente_res.rows); 
     });
     
 }

 //POST
 /**
 * @swagger
 * /pedidos:
 *  post:
 *      security: 
 *          - bearerAuth: []
 *      summary: Crea un nuevo pedido
 *      tags: [Pedido]
 *      requestBody: 
 *          required: true
 *          content: 
 *              application/json:
 *                  schema:
 *                      type: object
 *                      $ref: '#/components/schemas/Pedido'
 *      responses:
 *          200:
 *              description: Nuevo pedido agregado!
 *          400:
 *              description: Error al registrar el pedido!     
 *      
 */
router.post('/pedidos', checkJwt,
    body('total').isNumeric().optional({nullable:true}), 
    body('id_usuario').isNumeric(),
(req,res) => post_pedido(req,res));

  

function post_pedido(req,resped) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Error en la validacion")
        return res.status(400).json({errors: errors.array()});
    }

    const text = escape('INSERT INTO pedidos(total,id_usuario) VALUES($1, $2) RETURNING *')
    const values = [req.body.total, req.body.id_usuario]

    client.query(text, values, (err, res) => {
        if (err){
            console.log(err.stack)
            resped.send("Error al registrar pedido!");
        }
        else{
            console.log("El nuevo id pedido es : " + res.rows[0].id)
            resped.send(res.rows[0].id); //La respuesta es el nuevo id
        }
    })

    
}

//PUT
/**
 * @swagger
 * /pedidos/{id}:
 *  put:
 *      security: 
 *          - bearerAuth: []
 *      summary: Actualiza el pedido
 *      tags: [Pedido]
 *      parameters:
 *          -   in: path
 *              name: id
 *              schema:
 *                  type: string
 *              required: true
 *              description: Id del pedido
 *      requestBody: 
 *          required: true
 *          content: 
 *              application/json:
 *                  schema:
 *                      type: object
 *                      $ref: '#/components/schemas/Pedido'
 *      responses:
 *          200:
 *              description: Pedido editado!
 *          404:
 *              description: Pedido no encontrado
 *      
 */

router.put('/pedidos/:id', 
    body('total').isNumeric(), 
    body('id_usuario').isNumeric().optional({nullable:true}),
(req,res) => put_pedido(req,res));

function put_pedido(req,resped){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const id = req.params.id;

    const text = escape(`UPDATE pedidos SET total=$1, id_usuario=$2 where id=${id} RETURNING *`); 
    const values = [req.body.total, req.body.id_usuario]

    client.query(text, values, (err, res) => {
        if (err){
            console.log(err.stack)
            resped.send("Error en el edit del pedido");
        }
        else{
            console.log(res.rows[0])
            resped.send("Pedido editado!");
        }
    })
 
}

//DELETE
/**
 * @swagger
 * /pedidos/{id}:
 *  delete:
 *      security: 
 *          - bearerAuth: []
 *      summary: Elimina al pedido referenciado por el id
 *      tags: [Pedido]
 *      parameters:
 *          -   in: path
 *              name: id
 *              schema:
 *                  type: string
 *              required: true
 *              description: id del pedido
 *      responses:
 *          200:
 *              description: Pedido elimiando!
 *          404:
 *              description: Pedido no encontrado
 *      
 */
router.delete('/pedidos/:id', (req,res) => delete_pedido(req,res));
  
function delete_pedido(req,resped){
    const id = req.params.id;

    const text = escape(`DELETE FROM pedidos WHERE ID=${id}`)
    client.query(text, (err, res) => {
        if (err){
            console.log(err.stack)
            resped.send("Error al eliminar el pedido")
        }
        else{
            console.log(res.rows[0])
            resped.send("Pedido eliminado!")
        }
    }) 
}

module.exports = router;