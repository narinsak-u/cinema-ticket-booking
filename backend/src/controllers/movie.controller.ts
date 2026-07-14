import type { Request, Response } from 'express'

export function createMovieController(movieService: {
  getAll: () => Promise<{ success: boolean; data?: any; error?: string }>
  getById: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>
}) {
  return {
    async getAll(_req: Request, res: Response) {
      const result = await movieService.getAll()
      res.json(result)
    },
    async getById(req: Request, res: Response) {
      const result = await movieService.getById(req.params.id as string)
      res.json(result)
    },
  }
}
