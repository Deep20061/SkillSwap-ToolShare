import { Router } from "express"
import { apiLimiter } from "../../middleware/rateLimiter"
import { requireSession } from "../auth/auth.middleware"
import * as controller from "./geocode.controller"

const router = Router()

router.use(apiLimiter)
router.use(requireSession)

router.get("/search", controller.search)
router.get("/", controller.reverse)

export default router
