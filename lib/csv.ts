export function serializeCsv(rows: ReadonlyArray<ReadonlyArray<unknown>>): string {
  return rows.map((row) => row.map((value) => {
    const text = String(value ?? "")
    const cell = /^[=+@-]/.test(text) ? `'${text}` : text
    return `"${cell.replace(/"/g, '""')}"`
  }).join(",")).join("\r\n")
}

export function downloadCsv(filename: string, rows: ReadonlyArray<ReadonlyArray<unknown>>): void {
  const url = URL.createObjectURL(new Blob(["\uFEFF", serializeCsv(rows)], { type: "text/csv;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
