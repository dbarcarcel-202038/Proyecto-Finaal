import { Router } from "express";
import { purchaseHandler, tester } from "./cart.controller.js";
import { validateJwt } from '../middleware/validate.js'

const api = Router()

api.get('/test', tester)
api.post('/add', [validateJwt], purchaseHandler)

export default api