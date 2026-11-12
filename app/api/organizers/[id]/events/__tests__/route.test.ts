/** @jest-environment node */
import { GET, POST, PUT, DELETE } from "../route"
import { proxyJson } from "@/lib/backend-proxy"

jest.mock("@/lib/backend-proxy", () => ({
  proxyJson: jest.fn(async () => new Response("{}", { status: 200 })),
}))

const context = () => ({ params: Promise.resolve({ id: "organizer/1" }) })
const endpoint = "/api/organizers/organizer%2F1/events"
function request(method: string, body?: object, query = "") {
  return new Request("http://localhost/api/organizers/organizer/events" + query, {
    method,
    headers: { authorization: "Bearer test-session", "content-type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}

describe("organizer event backend routes", () => {
  beforeEach(() => jest.clearAllMocks())

  it.each([["GET", GET], ["POST", POST]] as const)("forwards %s with resolved parameters", async (method, handler) => {
    const req = request(method, method === "POST" ? { title: "Trade fair" } : undefined)
    await handler(req, context())
    expect(proxyJson).toHaveBeenCalledWith(req, endpoint, { method })
  })

  it("updates the requested event with the editable fields", async () => {
    const req = request("PUT", { eventId: "event/2", title: "Updated fair" })
    await PUT(req, context())
    expect(proxyJson).toHaveBeenCalledWith(req, endpoint + "/event%2F2", {
      method: "PUT", body: JSON.stringify({ title: "Updated fair" }),
    })
  })

  it.each(["query", "body"])("deletes an event identified by %s", async (source) => {
    const req = source === "query"
      ? request("DELETE", undefined, "?eventId=event%2F2")
      : request("DELETE", { eventId: "event/2" })
    await DELETE(req, context())
    expect(proxyJson).toHaveBeenCalledWith(req, endpoint + "/event%2F2", { method: "DELETE" })
  })

  it.each([["PUT", PUT], ["DELETE", DELETE]] as const)("rejects %s without an event ID", async (method, handler) => {
    const response = await handler(request(method, {}), context())
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "Event ID is required" })
    expect(proxyJson).not.toHaveBeenCalled()
  })
})
