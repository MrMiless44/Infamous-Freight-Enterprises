export function useApi() {
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost/api";

  async function get(path: string) {
    const res = await fetch(base + path);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function post(path: string, body?: any) {
    const res = await fetch(base + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  return { get, post };
}
