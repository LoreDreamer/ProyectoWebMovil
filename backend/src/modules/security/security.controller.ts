import type { Request, Response } from 'express';
import { analyzeUrl } from './security.service';

export const checkUrlSecurity = async (req: Request, res: Response) => {
  try {
    const url = String(req.body?.url || '').trim();

    if (!url) {
      return res.status(400).json({
        ok: false,
        message: 'Debes ingresar una URL para analizar.'
      });
    }

    if (url.length > 2048) {
      return res.status(400).json({
        ok: false,
        message: 'La URL ingresada es demasiado larga.'
      });
    }

    const result = await analyzeUrl(url);

    return res.json({
      ok: true,
      message: result.message,
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({
      ok: false,
      message: error?.message || 'No se pudo analizar la URL.'
    });
  }
};
