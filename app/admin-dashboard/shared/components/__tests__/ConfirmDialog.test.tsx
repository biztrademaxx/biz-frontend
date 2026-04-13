import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ConfirmDialog } from "@/app/admin-dashboard/shared/components/ConfirmDialog"
import { renderWithProviders } from "@/test/test-utils"

describe("ConfirmDialog", () => {
  it("renders title and description when open", () => {
    renderWithProviders(
      <ConfirmDialog
        open
        onOpenChange={jest.fn()}
        title="Delete item?"
        description="This cannot be undone."
        onConfirm={jest.fn()}
      />
    )
    expect(screen.getByText("Delete item?")).toBeInTheDocument()
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument()
  })

  it("invokes onConfirm then closes when confirm is clicked", async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn().mockResolvedValue(undefined)
    const onOpenChange = jest.fn()
    renderWithProviders(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Confirm action"
        confirmLabel="Yes, do it"
        onConfirm={onConfirm}
      />
    )
    await user.click(screen.getByRole("button", { name: /yes, do it/i }))
    await screen.findByText("Confirm action")
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("uses custom cancel label", async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ConfirmDialog
        open
        onOpenChange={jest.fn()}
        title="Sure?"
        cancelLabel="Go back"
        onConfirm={jest.fn()}
      />
    )
    expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument()
  })
})
