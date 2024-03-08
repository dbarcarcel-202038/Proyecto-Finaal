import { Router } from 'express'
import { addProduct, test, updateProduct, delet3, searchProduct, outOfStockProducts, mostDemandProducts, byCategory, catalogueProducts } from './product.controller.js'
import { validateJwt, ifAdmin } from '../middleware/validate.js'

const api = Router()

api.get('/test', test)
api.post('/add', [validateJwt, ifAdmin], addProduct)
api.put('/update/:id', [validateJwt, ifAdmin], updateProduct)
api.delete('/delete/:id', [validateJwt, ifAdmin], delet3)
api.get('/search/:search', searchProduct)
api.get('/catalogue', catalogueProducts)
api.get('/outStock', [validateJwt, ifAdmin], outOfStockProducts)
api.get('/mostDemand', mostDemandProducts)
api.get('/byCategory/:id', byCategory)

export default api