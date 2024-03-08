import {Router} from 'express'
import {test,login, sign, signAdmin, update, delet3, purchaseHystory, } from './user.controller.js'
import { ifAdmin,ifClient, validateJwt } from '../middleware/validate.js'

const api = Router()

api.get('/test', test)
api.post('/sign',[ifClient], sign)
api.post('/signAdmin', [validateJwt, ifAdmin], signAdmin)
api.post('/login', login)
api.put('/update/:id', [validateJwt], update)
api.delete('/delete/:id', [validateJwt], delet3)
api.get('/history', [validateJwt], purchaseHystory)
export default api