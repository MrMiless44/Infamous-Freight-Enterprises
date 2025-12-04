export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: "Infæmous Freight Web",
    timestamp: new Date().toISOString()
  });
}
