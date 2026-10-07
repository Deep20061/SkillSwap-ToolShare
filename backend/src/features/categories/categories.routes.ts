import { Router } from "express"
import { apiLimiter } from "../../middleware/rateLimiter"
import * as controller from "./categories.controller"

const router = Router()

router.use(apiLimiter)

router.get("/", controller.list)

export default router
