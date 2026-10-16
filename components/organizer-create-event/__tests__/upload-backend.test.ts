import { clearTokens, getAccessToken, setTokens } from "@/lib/api"
import { uploadEventFileToBackend } from "../upload-backend"

jest.mock("@/lib/prepare-image-upload", () => ({
  IMAGE_UPLOAD_HINT: "Image upload",
  prepareImageFileForUpload: jest.fn(async (file: File) => file),
  parseUploadErrorMessage: jest.fn((_status: number, message: string) => message),
}))

function jwt(exp: number) {
  return `header.${btoa(JSON.stringify({ exp, sub: "test-account" }))}.signature`
}

function response(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(body) } as Response
}

describe("event uploads with expiring authentication", () => {
  const originalFetch = global.fetch
  const file = new File(["demo-image"], "demo.png", { type: "image/png" })

  beforeEach(() => {
    clearTokens()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    clearTokens()
    global.fetch = originalFetch
  })

  it("refreshes an expired token before sending the multipart upload", async () => {
    const freshToken = jwt(Math.floor(Date.now() / 1000) + 3600)
    setTokens({ accessToken: jwt(Math.floor(Date.now() / 1000) - 60), refreshToken: "test-refresh" })
    const fetchMock = jest.mocked(global.fetch)
    fetchMock.mockResolvedValueOnce(response(200, { accessToken: freshToken }))
    fetchMock.mockResolvedValueOnce(response(201, { url: "https://example.test/demo.png" }))

    await expect(uploadEventFileToBackend(file, "image")).resolves.toBe("https://example.test/demo.png")

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(String(fetchMock.mock.calls[0][0])).toContain("/api/auth/refresh")
    expect(fetchMock.mock.calls[1][0]).toBe("/api/upload/cloudinary")
    expect(fetchMock.mock.calls[1][1]?.headers).toEqual({ Authorization: `Bearer ${freshToken}` })
    expect((fetchMock.mock.calls[1][1]?.body as FormData).get("file")).toBeInstanceOf(File)
    expect(getAccessToken()).toBe(freshToken)
  })

  it("uploads without refreshing when the token remains valid", async () => {
    const token = jwt(Math.floor(Date.now() / 1000) + 3600)
    setTokens({ accessToken: token, refreshToken: "test-refresh" })
    jest.mocked(global.fetch).mockResolvedValueOnce(response(201, { url: "https://example.test/demo.png" }))

    await uploadEventFileToBackend(file, "image")

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith("/api/upload/cloudinary", expect.objectContaining({ headers: { Authorization: `Bearer ${token}` } }))
  })

  it("does not upload if the expired session cannot be refreshed", async () => {
    setTokens({ accessToken: jwt(Math.floor(Date.now() / 1000) - 60), refreshToken: "invalid-refresh" })
    jest.mocked(global.fetch).mockResolvedValueOnce(response(401, { message: "Invalid refresh token" }))

    await expect(uploadEventFileToBackend(file, "image")).rejects.toThrow("Please log in to upload files")

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(getAccessToken()).toBeNull()
  })
})
