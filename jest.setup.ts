import "@testing-library/jest-dom"

import React from "react"

jest.mock("next/image", () => ({
  __esModule: true,
  default: function MockImage(
    props: Record<string, unknown> & { alt?: string; src?: string | object }
  ) {
    const {
      alt = "",
      src = "",
      priority: _p,
      fill: _f,
      placeholder: _ph,
      blurDataURL: _b,
      onLoad: _onLoad,
      onLoadingComplete: _olc,
      ...rest
    } = props as Record<string, unknown>
    const srcStr = typeof src === "string" ? src : ""
    return React.createElement("img", { alt, src: srcStr, ...rest })
  },
}))

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
