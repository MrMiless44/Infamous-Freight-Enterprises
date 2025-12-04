import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    ok: true,
    service: "Infæmous Freight Web",
    timestamp: new Date().toISOString()
  });
}
