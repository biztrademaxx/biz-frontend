import { DELETE, GET, POST } from "../route"
import { proxyJson } from "@/lib/backend-proxy"

jest.mock("@/lib/backend-proxy", () => ({ proxyJson: jest.fn(async () => ({ status: 200 })) }))

describe("saved-event proxy routes", () => {
  beforeEach(() => jest.clearAllMocks())

  it.each([
    ["GET", GET],
    ["POST", POST],
    ["DELETE", DELETE],
  ] as const)("resolves Next.js async params before forwarding %s", async (method, handler) => {
    const req = {} as Request
    const id = "68703dde-6e02-418e-b6ed-949d25ded63a"

    await handler(req, { params: Promise.resolve({ id }) })

    if (method === "GET") {
      expect(proxyJson).toHaveBeenCalledWith(req, `/api/events/${id}/save`)
    } else {
      expect(proxyJson).toHaveBeenCalledWith(req, `/api/events/${id}/save`, { method })
    }
  })
})
