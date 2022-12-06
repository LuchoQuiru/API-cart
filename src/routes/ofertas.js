const { Router } = require('express'); //requiero el modulo router de express
const { Client } = require('pg'); //requiero el modulo client de pg
const router = Router();
const client = require('../database/db_client.js');
const { body, validationResult } = require('express-validator');
const checkJwt = require('../middleware/auth0')
const escape = require('pg-escape');

const send = require('../webpush');

//SWAGGER
/** 
 *  @swagger
 *  components:
 *      schemas:
 *           Oferta:
 *               type: object
 *               properties:
 *                   fecha_inicio:
 *                       type: date
 *                       pattern: '([0-9]{4})-(?:[0-9]{2})-([0-9]{2})'
 *                       description: Fecha de inicio de la oferta
 *                   fecha_fin:
 *                       type: date
 *                       pattern: '([0-9]{4})-(?:[0-9]{2})-([0-9]{2})'
 *                       description: Fecha de fin de la oferta
 *                   descuento:
 *                       type: number
 *                       description: El descuento que ofrece la oferta
 *                   id_producto:
 *                       type: number
 *                       description: El identificador del producto asociado
 *               required:
 *                   - fecha_inicio
 *                   - fecha_fin
 *                   - descuento
 *                   - id_producto
 *               example:
 *                   fecha_inicio: "2022-06-30"
 *                   fecha_fin: "2022-07-30"
 *                   descuento: 35 
 *                   id_producto: 1
*/

//------------------------------ROUTES-----------------------------------------
/**
 * @swagger
 * /ofertas:
 *  get:
 *      security: 
 *          - bearerAuth: [] 
 *      summary: Retorna todas las ofertas
 *      tags: [Oferta]
 *      responses:
 *          200:
 *              description: Todos las ofertas registradas
 *              content:
 *                  aplicattion/json:
 *                      schema:
 *                          type: json
 *                          items:
 *                              $ref: '#/components/schemas/Oferta'
 *      
 */

//////////ROUTES

router.get('/subscripcion', async (req,res) => {
    console.log("previo a la subscripcion en la api")
    
    res.status(200).json()
    send()
    
    console.log("post-subscripcion api")
})

//GETby id
router.get('/ofertas', (req,res) => get_ofertas(res));

function get_ofertas(res) {
    client.query(escape('select o.id, o.fecha_inicio, o.fecha_fin, o.descuento, p.nombre_producto from ofertas o inner join productos p on o.id_producto = p.id where fecha_fin > current_date'), (cliente_err, cliente_res) => { 
        for (var i = 0; i < cliente_res.rows.length; i++) {
            //TODO -Hardcodeado- - - -> http://localhost:5000/productos/image/
            cliente_res.rows[i].imagen = process.env.HOSTNAME + 'productos/image/' + cliente_res.rows[i].id 
        }
        res.json(cliente_res.rows); 
    });
    
}


/**
 * @swagger
 * /ofertas/{id_producto}:
 *  get:
 *      security: 
 *          - bearerAuth: []
 *      summary: Retorna la oferta asociada al id del producto
 *      tags: [Oferta]
 *      parameters:
 *          -   in: path
 *              name: id_producto
 *              schema:
 *                  type: string
 *              required: true
 *              description: Id de la oferta asociada al producto
 *      responses:
 *          200:
 *              description: La oferta registrada asociada al producto
 *              content:
 *                  aplicattion/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/Oferta'
 *          404:
 *              description: No existe la oferta
 *      
 */
 router.get('/ofertas/:id_producto',  (req,res) => get_ofertas_by_id(req,res));

 function get_ofertas_by_id(req,res) {
    const id_producto = req.params.id_producto;
    var text = escape('select id,descuento from ofertas where fecha_fin > current_date and id_producto = '+id_producto) 
    client.query(text, (err,cliente_res) => {
        res.json(cliente_res.rows)
    })
 }
module.exports = router;