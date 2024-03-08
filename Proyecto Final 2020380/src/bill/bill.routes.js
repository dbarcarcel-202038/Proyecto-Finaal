import {Router} from 'express'
import { updateReceiptItem } from './bill.controller.js'
import { ifAdmin, validateJwt } from '../middleware/validate.js'

const api = Router()

api.put('/update/:id/:itemId', [validateJwt, ifAdmin], updateReceiptItem)

export default api