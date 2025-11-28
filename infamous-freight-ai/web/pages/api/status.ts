import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    app: process.env.NEXT_PUBLIC_APP_NAME || "Infæmous Freight",
    env: process.env.NEXT_PUBLIC_ENV || "unknown",
    time: new Date().toISOString(),
  });
}
