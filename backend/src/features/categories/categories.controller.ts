import { Request, Response, NextFunction } from "express"
import { getCategories } from "./categories.service"

export async function list(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const categories = await getCategories()
    res.json(categories)
  } catch (err) {
    next(err)
  }
}
