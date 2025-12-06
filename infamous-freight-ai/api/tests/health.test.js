const request = require("supertest");
const app = require("../src/server");

describe("GET /api/health", () => {
  it("returns 200 and service payload", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ ok: true, service: "api" });
  });
});
