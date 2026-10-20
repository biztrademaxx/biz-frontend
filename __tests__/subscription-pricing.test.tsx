import "@testing-library/jest-dom"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import SubscriptionPlansPage from "@/app/admin-dashboard/subscription-plans/page"
import { adminApi } from "@/lib/admin-api"
import { getDashboardPlansForRole } from "@/lib/dashboard-packages"
import { SWRConfig } from "swr"
import { useDashboardPlanPrices } from "@/hooks/use-dashboard-plan-prices"

jest.mock("@/lib/admin-api", () => ({ adminApi: jest.fn() }))
jest.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: jest.fn() }) }))
const api = adminApi as jest.Mock

const prices = getDashboardPlansForRole("ORGANIZER").map((plan, index) => ({
  slug: plan.id, name: plan.name, role: "ORGANIZER", amountInr: plan.priceInr,
  billingNote: plan.billingNote,
  billingKind: index === 0 ? "FREE" : index === 1 ? "YEARLY" : "MONTHLY",
  displayOrder: index + 1,
}))

beforeEach(() => {
  jest.clearAllMocks()
  api.mockResolvedValue({ success: true, data: prices })
})

it("saves a new INR price, updates its display, and cancels unsaved changes", async () => {
  render(<SubscriptionPlansPage />)
  const fields = await screen.findAllByRole("spinbutton")
  expect(fields).toHaveLength(4)
  expect(fields[0]).toBeDisabled()
  expect(fields[0]).toHaveValue(0)
  fireEvent.change(fields[1], { target: { value: "12345.67" } })
  api.mockResolvedValueOnce({ success: true, data: { ...prices[1], amountInr: 12345.67 } })
  fireEvent.click(screen.getAllByRole("button", { name: "Save" })[0])
  await screen.findByText("₹12,345.67")
  expect(api).toHaveBeenLastCalledWith("/subscription-plans/organizer-silver", {
    method: "PATCH", body: { amountInr: 12345.67 },
  })
  fireEvent.change(fields[1], { target: { value: "14000" } })
  fireEvent.click(screen.getAllByRole("button", { name: "Cancel" })[0])
  expect(fields[1]).toHaveValue(12345.67)
  expect(screen.getAllByRole("button", { name: "Save" })[0]).toBeDisabled()
  fireEvent.change(fields[1], { target: { value: "" } })
  fireEvent.click(screen.getAllByRole("button", { name: "Cancel" })[0])
  expect(fields[1]).toHaveValue(12345.67)
})

it("keeps unsaved values available after a failed save", async () => {
  render(<SubscriptionPlansPage />)
  const fields = await screen.findAllByRole("spinbutton")
  fireEvent.change(fields[1], { target: { value: "12000" } })
  api.mockRejectedValueOnce(new Error("Unable to save the plan price."))
  fireEvent.click(screen.getAllByRole("button", { name: "Save" })[0])
  expect(await screen.findByRole("alert")).toHaveTextContent("Unable to save the plan price.")
  expect(fields[1]).toHaveValue(12000)
  expect(screen.getByText("₹10,000")).toBeInTheDocument()
  expect(screen.getAllByRole("button", { name: "Save" })[0]).toBeEnabled()
})

function PricingProbe() {
  const { plans, pricingError, pricingLoading } = useDashboardPlanPrices("ORGANIZER")
  if (pricingError) return <p role="alert">{pricingError}</p>
  if (pricingLoading) return <p>Loading</p>
  return <>{plans.map((plan) => <p key={plan.id}>{plan.priceDisplay}</p>)}</>
}

it("displays prices received from the backend instead of the hardcoded amounts", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true, json: async () => ({ data: prices.map((plan, i) => i === 1 ? { ...plan, amountInr: 12345.67 } : plan) }),
  })
  render(<SWRConfig value={{ provider: () => new Map() }}><PricingProbe /></SWRConfig>)
  expect(await screen.findByText("₹12,345.67")).toBeInTheDocument()
  expect(screen.queryByText("₹10,000")).not.toBeInTheDocument()
})

it("shows an error when the pricing API is unavailable", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({ message: "Unavailable" }) })
  render(<SWRConfig value={{ provider: () => new Map(), shouldRetryOnError: false }}><PricingProbe /></SWRConfig>)
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Unable to load current plan prices"))
  expect(screen.queryByText("₹10,000")).not.toBeInTheDocument()
})
