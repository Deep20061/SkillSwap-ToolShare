import { Request, Response, NextFunction } from "express"
import { reverseGeocode, forwardGeocode } from "./geocode.service"

export async function reverse(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const lat = parseFloat(req.query["lat"] as string)
    const lng = parseFloat(req.query["lng"] as string)
    const zoomRaw = req.query["zoom"] as string | undefined
    const parsedZoom = zoomRaw !== undefined ? parseInt(zoomRaw, 10) : NaN
    const zoom = isNaN(parsedZoom) ? undefined : parsedZoom

    if (isNaN(lat) || lat < -90 || lat > 90) {
      res.status(400).json({ error: "lat must be a number between -90 and 90" })
      return
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      res.status(400).json({ error: "lng must be a number between -180 and 180" })
      return
    }

    const locationName = await reverseGeocode(lat, lng, zoom)
    res.json({ locationName })
  } catch (err) {
    next(err)
  }
}

export async function search(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const q = ((req.query["q"] as string) ?? "").trim()
    if (q.length < 2) {
      res.json({ results: [] })
      return
    }
    const results = await forwardGeocode(q)
    res.json({ results })
  } catch (err) {
    next(err)
  }
}
