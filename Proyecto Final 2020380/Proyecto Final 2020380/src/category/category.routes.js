import {Router} from 'express'
import {addCategory, delet3, findCategory, test, updateCategory} from './category.controller.js'
import {validateJwt, ifAdmin} from '../middleware/validate.js'

const api = Router()

api.get('/test', test)
api.post('/add', [validateJwt, ifAdmin], addCategory)
api.put('/update/:id',[validateJwt, ifAdmin], updateCategory)
api.delete('/delete/:id',[validateJwt, ifAdmin], delet3)
api.get('/find', findCategory)
export default api