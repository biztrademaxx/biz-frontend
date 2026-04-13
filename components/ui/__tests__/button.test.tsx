import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Button } from "@/components/ui/button"

describe("Button", () => {
  it("renders children and is a button by default", () => {
    render(<Button type="button">Save</Button>)
    const btn = screen.getByRole("button", { name: "Save" })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute("data-slot", "button")
  })

  it("forwards click handlers", async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    render(
      <Button type="button" onClick={onClick}>
        Submit
      </Button>
    )
    await user.click(screen.getByRole("button", { name: "Submit" }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("can be disabled", () => {
    render(
      <Button type="button" disabled>
        Off
      </Button>
    )
    expect(screen.getByRole("button", { name: "Off" })).toBeDisabled()
  })
})
