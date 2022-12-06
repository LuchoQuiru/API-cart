const { Router } = require('express'); //requiero el modulo router de express
const { Client } = require('pg'); //requiero el modulo client de pg
const router = Router();
const client = require('../database/db_client.js');
const { body, validationResult } = require('express-validator');
const checkJwt = require('../middleware/auth0')
const escape = require('pg-escape');
const expressSanitizer = require('express-sanitizer');



//SWAGGER
/** 
 *  @swagger
 *  components:
 *      schemas:
 *           Producto:
 *               type: object
 *               properties:
 *                   nombre_producto:
 *                       type: string
 *                       description: El nombre del producto
 *                   img:
 *                       type: string
 *                       description: La imagen del producto
 *                       nullable: true
 *                       default: null
 *                       example: null
 *                   stock:
 *                       type: number
 *                       description: La cantidad de stock disponible
 *                   precio:
 *                       type: number
 *                       description: El precio del producto
 *                   id_categoria:
 *                       type: number
 *                       description: El identificador de la categoria
 *               required:
 *                   - nombre_producto
 *                   - stock
 *                   - precio
 *                   - id_categoria
 *               example:
 *                   nombre_producto: Cerveza IPA 1L
 *                   stock: 100
 *                   precio: 250 
 *                   id_categoria: 1
*/

//------------------------------ROUTES-----------------------------------------
/**
 * @swagger
 * /productos:
 *  get:
 *      security: 
 *          - bearerAuth: []
 *      summary: Retorna todos los productos
 *      tags: [Producto]
 *      responses:
 *          200:
 *              description: Todos los productos registrados
 *              content:
 *                  aplicattion/json:
 *                      schema:
 *                          type: json
 *                          items:
 *                              $ref: '#/components/schemas/Producto'
 *      
 */
//LOGIN

//GET
router.get('/productos' /*, checkJwt*/, (req, res) => get_productos(res));

function get_productos(res) {
    client.query(escape('select p.id, p.nombre_producto, p.precio, p.stock, c.nombre as categoria from productos p inner join categoria c on p.id_categoria = c.id where stock > 0'), (cliente_err, cliente_res) => {
        
        for (var i = 0; i < cliente_res.rows.length; i++) {
            //TODO -Hardcodeado- - - -> http://localhost:5000/productos/image/
            cliente_res.rows[i].imagen = process.env.HOSTNAME + 'productos/image/' + cliente_res.rows[i].id 
            
        }
        res.json(cliente_res.rows)
    });
}

/**
 * @swagger
 * /productos/{id}:
 *  get:
 *      security: 
 *          - bearerAuth: []
 *      summary: Retorna el producto asociado al id
 *      tags: [Producto]
 *      parameters:
 *          -   in: path
 *              name: id
 *              schema:
 *                  type: string
 *              required: true
 *              description: Id del producto
 *      responses:
 *          200:
 *              description: Todos los productos registrados
 *              content:
 *                  aplicattion/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/Producto'
 *          404:
 *              description: Producto no encontrado
 *      
 */
router.get('/productos/:id'/*, checkJwt,*/, (req, res) => get_productos_by_id(req, res));

function get_productos_by_id(req, res) {
    const id = req.params.id;
    client.query(escape(`select id,nombre_producto,precio,stock from productos where id = ${id}`), (cliente_err, cliente_res) => {
        res.json(cliente_res.rows);
    });
}

/**
 * @swagger
 * /productos/image/{id}:
 *  get:
 *      security: 
 *          - bearerAuth: []
 *      summary: Retorna la imagen asociado al producto
 *      tags: [Producto]
 *      parameters:
 *          -   in: path
 *              name: id
 *              schema:
 *                  type: string
 *              required: true
 *              description: Imagen del producto
 *      responses:
 *          200:
 *              description: Imagen del producto
 *              content:
 *                  aplicattion/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/Producto'
 *          404:
 *              description: Imagen no encontrada
 *      
 */

//GET
router.get('/productos/image/:id', (req, res) => get_image(req, res));

function get_image(req, res) {
    const id = req.params.id;
    client.query(escape(`select id,img from productos where id = ${id}`), (cliente_err, cliente_res) => {
        if (cliente_res.rows.length < 1)
            res.status(404).send("not found")
        else {
            var fs = require('fs');

            var img = "data:image/jpg;base64," + cliente_res.rows[0].img
            var data = img.replace(/^data:image\/\w+;base64,/, "");
            var buf = Buffer.from(data, 'base64');
            fs.writeFile(cliente_res.rows[0].id + ".jpg", buf, function (err, data) {
                if (err) {
                    res.status(404).send('Not found');
                }

                var path = require('path');

                var options = {
                    root: path.join(__dirname + '/../../')
                };
                var fileName = cliente_res.rows[0].id + '.jpg';
                res.status(200).sendFile(fileName, options, function (err) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log('Sent:', fileName)
                    }
                });
            });
        }
    });


}

/**
 * @swagger
 * /productos/{id}:
 *  put:
 *      summary: Actualiza el producto
 *      tags: [Producto]
 *      parameters:
 *          -   in: path
 *              name: id
 *              schema:
 *                  type: string
 *              required: true
 *              description: Id del producto
 *      requestBody: 
 *          required: true
 *          content: 
 *              application/json:
 *                  schema:
 *                      type: object
 *                      $ref: '#/components/schemas/Producto'
 *      responses:
 *          200:
 *              description: Producto editado!
 *          404:
 *              description: Producto no encontrado
 *      
 */

//PUT
router.put('/productos/:id',
    body('cantidad').isNumeric(),
    (req, res) => put_producto(req, res));

function put_producto(req, resprod) {
    const id = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resprod.status(400).json({ errors: errors.array() });
    }

    const text = `UPDATE PRODUCTOS SET stock = stock - ${req.body.cantidad} where id = ${id} RETURNING *`;

    client.query(text, (err, res) => {
        if (err) {
            console.log("EStoy aca" + err)
            resprod.send(err)
        }
        else {
            console.log(res)
            resprod.send("Producto descontado exitosamente!")
        }
    })
}



module.exports = router;