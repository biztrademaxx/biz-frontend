// lib/generate-invoice-pdf.ts
//
// Zero-dependency PDF generator. Builds a valid PDF file byte-for-byte using
// the raw PDF spec (text-based format) — no html2canvas, no jsPDF, no canvas
// screenshot of the page. The two logo images are fetched, converted to JPEG
// via an offscreen <canvas>, and embedded directly as native PDF JPEG
// (DCTDecode) XObjects — PDF's built-in, library-free way to include raster
// images. Triggers a direct file download via Blob.

interface InvoiceItem {
    description: string
    quantity: number
    unitPrice: number
    total: number
}

interface InvoiceForPdf {
    id: string
    invoiceNumber: string
    userName: string
    userEmail: string
    currency: string
    status: string
    invoiceDate: string
    dueDate: string
    paidDate?: string
    paymentMethod: string
    items: InvoiceItem[]
    subtotal: number
    tax: number
    total: number
}

const HEADER_LOGO_URL =
    "https://res.cloudinary.com/deo4vpw8f/image/upload/v1782713887/biztradefairs_new2_tjo8lq.png"
const FOOTER_LOGO_URL =
    "https://res.cloudinary.com/deo4vpw8f/image/upload/v1782713562/maxx_karjly.png"

// ---- low level text/string helpers --------------------------------------

function escPdfText(s: string): string {
    return String(s ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
}

function formatDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    } catch {
        return dateStr
    }
}

function formatCurrency(amount: number, currency: string): string {
    const symbols: Record<string, string> = {
        USD: "$",
        EUR: "EUR ",
        GBP: "GBP ",
        INR: "Rs. ",
    }
    const symbol = symbols[currency] || `${currency} `
    return `${symbol}${amount.toFixed(2)}`
}

// Converts a Uint8Array into a single-byte-per-char JS string (latin1-style),
// which is how we build up the raw PDF bytes (including binary JPEG data)
// before doing one final charCodeAt pass into a Uint8Array.
function bytesToBinaryString(bytes: Uint8Array): string {
    let result = ""
    const chunkSize = 8000
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize)
        result += String.fromCharCode.apply(null, Array.from(chunk))
    }
    return result
}

// ---- image loading (fetch -> canvas -> JPEG bytes) -----------------------

interface LoadedImage {
    bytes: Uint8Array
    width: number
    height: number
}

async function loadImageAsJpeg(url: string): Promise<LoadedImage | null> {
    try {
        const img = document.createElement("img")
        img.crossOrigin = "anonymous"
        const loaded = new Promise<void>((resolve, reject) => {
            img.onload = () => resolve()
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
        })
        img.src = url
        await loaded

        const canvas = document.createElement("canvas")
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext("2d")
        if (!ctx) return null

        // Flatten transparency onto white, since PDF DCTDecode (JPEG) has no
        // alpha channel.
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)

        const dataUrl = canvas.toDataURL("image/jpeg", 0.92)
        const base64 = dataUrl.split(",")[1]
        const binary = atob(base64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

        return { bytes, width: canvas.width, height: canvas.height }
    } catch (error) {
        console.error("Could not embed image in PDF:", url, error)
        return null
    }
}

// ---- PDF object writer ----------------------------------------------------

class PdfWriter {
    private objects: string[] = [""] // index 0 is unused (PDF objects start at 1)

    addObject(content: string): number {
        this.objects.push(content)
        return this.objects.length - 1
    }

    // Lets us patch an object's content after creation (used for the page's
    // /Parent reference, which we only know once the Pages object exists).
    updateObject(objNum: number, content: string): void {
        this.objects[objNum] = content
    }

    build(rootObjNum: number): Uint8Array {
        let pdf = "%PDF-1.4\n"
        const offsets: number[] = [0]
        for (let i = 1; i < this.objects.length; i++) {
            offsets[i] = pdf.length
            pdf += `${i} 0 obj\n${this.objects[i]}\nendobj\n`
        }
        const xrefStart = pdf.length
        const count = this.objects.length
        pdf += `xref\n0 ${count}\n0000000000 65535 f \n`
        for (let i = 1; i < count; i++) {
            pdf += `${offsets[i].toString().padStart(10, "0")} 00000 n \n`
        }
        pdf += `trailer\n<< /Size ${count} /Root ${rootObjNum} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

        const bytes = new Uint8Array(pdf.length)
        for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff
        return bytes
    }
}

// A simple content-stream builder with a text cursor.
class PdfPage {
    ops: string[] = []
    font: "F1" | "F2" = "F1"
    size = 10

    setFont(font: "F1" | "F2", size: number) {
        this.font = font
        this.size = size
    }

    text(x: number, y: number, str: string) {
        this.ops.push(
            `BT /${this.font} ${this.size} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${escPdfText(
                str,
            )}) Tj ET`,
        )
    }

    textRightAligned(rightX: number, y: number, str: string) {
        const avgCharWidth = this.size * (this.font === "F2" ? 0.56 : 0.5)
        const width = str.length * avgCharWidth
        this.text(rightX - width, y, str)
    }

    line(x1: number, y1: number, x2: number, y2: number, widthPt = 1) {
        this.ops.push(`${widthPt} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`)
    }

    rect(x: number, y: number, w: number, h: number, fillColor?: string) {
        if (fillColor) {
            this.ops.push(`${fillColor} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`)
            this.ops.push(`0 g`) // reset fill color to black
        } else {
            this.ops.push(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`)
        }
    }

    // Draws a previously-registered image XObject at (x, y) — bottom-left
    // corner — scaled to displayWidth x displayHeight (in PDF points).
    image(xObjectName: string, x: number, y: number, displayWidth: number, displayHeight: number) {
        this.ops.push(
            `q ${displayWidth.toFixed(2)} 0 0 ${displayHeight.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(
                2,
            )} cm /${xObjectName} Do Q`,
        )
    }

    toStream(): string {
        return this.ops.join("\n")
    }
}

// ---- invoice layout --------------------------------------------------------

export async function generateInvoicePdfBytes(invoice: InvoiceForPdf): Promise<Uint8Array> {
    const [headerLogo, footerLogo] = await Promise.all([
        loadImageAsJpeg(HEADER_LOGO_URL),
        loadImageAsJpeg(FOOTER_LOGO_URL),
    ])

    const writer = new PdfWriter()
    const fontF1 = writer.addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    const fontF2 = writer.addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

    let headerLogoObjNum: number | null = null
    if (headerLogo) {
        const data = bytesToBinaryString(headerLogo.bytes)
        headerLogoObjNum = writer.addObject(
            `<< /Type /XObject /Subtype /Image /Width ${headerLogo.width} /Height ${headerLogo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${headerLogo.bytes.length} >>\nstream\n${data}\nendstream`,
        )
    }

    let footerLogoObjNum: number | null = null
    if (footerLogo) {
        const data = bytesToBinaryString(footerLogo.bytes)
        footerLogoObjNum = writer.addObject(
            `<< /Type /XObject /Subtype /Image /Width ${footerLogo.width} /Height ${footerLogo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${footerLogo.bytes.length} >>\nstream\n${data}\nendstream`,
        )
    }

    const page = new PdfPage()
    const marginX = 50
    const pageWidth = 595
    const rightX = pageWidth - marginX
    let y = 790

    // ---- Header logo (top-left) ----
    let textStartX = marginX
    if (headerLogo) {
        const displayWidth = 130
        const displayHeight = (headerLogo.height / headerLogo.width) * displayWidth
        page.image("ImHeaderLogo", marginX, y - displayHeight + 10, displayWidth, displayHeight)
        textStartX = marginX
        y -= Math.max(0, displayHeight - 26) // shift text start down a bit so it clears the logo
    }

    page.setFont("F1", 9)
    page.text(textStartX, y - 16, "T9, Swastik Manandi Arcade, Subedar Chatram Rd")
    page.text(textStartX, y - 28, "VV Giri Colony, Seshadripuram, Bengaluru, KA 560020")
    page.text(textStartX, y - 40, "noreply@biztradefairs.com  |  +91 91483 19993")

    page.setFont("F1", 9)
    page.textRightAligned(rightX, 790, "INVOICE")
    page.setFont("F2", 16)
    page.textRightAligned(rightX, 790 - 18, invoice.invoiceNumber)
    page.setFont("F1", 10)
    page.textRightAligned(rightX, 790 - 34, invoice.status.toUpperCase())

    y -= 60
    page.line(marginX, y, rightX, y)
    y -= 20

    // Dates row
    page.setFont("F1", 10)
    page.text(marginX, y, `Invoice Date: ${formatDate(invoice.invoiceDate)}`)
    page.textRightAligned(rightX, y, `Due Date: ${formatDate(invoice.dueDate)}`)
    y -= 30

    // From / Bill To
    const colWidth = (rightX - marginX) / 2
    page.setFont("F2", 9)
    page.text(marginX, y, "FROM")
    page.text(marginX + colWidth, y, "BILL TO")
    y -= 16
    page.setFont("F1", 10)
    page.text(marginX, y, "Biz Trade Fairs.")
    page.text(marginX + colWidth, y, invoice.userName)
    y -= 14
    page.text(marginX, y, "Maxx Business Media Pvt Ltd")
    page.text(marginX + colWidth, y, invoice.userEmail)
    y -= 14
    page.text(marginX + colWidth, y, `Payment: ${invoice.paymentMethod}`)
    y -= 30

    // Items table header
    const col1 = marginX // description
    const col2 = marginX + 230 // qty
    const col3 = marginX + 320 // unit price
    const col4 = rightX // total (right aligned)

    page.rect(marginX, y - 18, rightX - marginX, 22, "0.95 0.95 0.95")
    page.setFont("F2", 9)
    page.text(col1 + 5, y - 12, "DESCRIPTION")
    page.text(col2, y - 12, "QTY")
    page.text(col3, y - 12, "UNIT PRICE")
    page.textRightAligned(col4 - 5, y - 12, "TOTAL")
    y -= 24

    page.setFont("F1", 9)
    for (const item of invoice.items) {
        if (y < 160) break // simple guard against overflow on huge item lists
        page.text(col1 + 5, y - 12, item.description)
        page.text(col2, y - 12, String(item.quantity))
        page.text(col3, y - 12, formatCurrency(item.unitPrice, invoice.currency))
        page.textRightAligned(col4 - 5, y - 12, formatCurrency(item.total, invoice.currency))
        y -= 20
        page.line(marginX, y + 6, rightX, y + 6, 0.5)
    }

    y -= 10
    page.setFont("F1", 10)
    page.text(col3, y, "Subtotal:")
    page.textRightAligned(col4 - 5, y, formatCurrency(invoice.subtotal, invoice.currency))
    y -= 16
    page.text(col3, y, `Tax (${invoice.tax > 0 ? "10%" : "0%"}):`)
    page.textRightAligned(col4 - 5, y, formatCurrency(invoice.tax, invoice.currency))
    y -= 4
    page.line(col3, y, rightX, y, 1)
    y -= 16
    page.setFont("F2", 13)
    page.text(col3, y, "Total:")
    page.textRightAligned(col4 - 5, y, formatCurrency(invoice.total, invoice.currency))

    if (invoice.paidDate) {
        y -= 20
        page.setFont("F1", 9)
        page.textRightAligned(col4 - 5, y, `Paid on ${formatDate(invoice.paidDate)}`)
    }

    // ---- Footer ----
    const footerY = 60
    if (footerLogo) {
        const displayWidth = 70
        const displayHeight = (footerLogo.height / footerLogo.width) * displayWidth
        page.image("ImFooterLogo", marginX, footerY - 6, displayWidth, displayHeight)
        page.setFont("F1", 9)
        page.text(marginX + displayWidth + 10, footerY + displayHeight / 2 - 9, "Maxx Business Media Pvt Ltd")
    } else {
        page.setFont("F1", 9)
        page.text(marginX, footerY, "Maxx Business Media Pvt Ltd")
    }

    page.setFont("F1", 8)
    page.textRightAligned(rightX, footerY + 10, "Thank you for your business!")
    page.textRightAligned(rightX, footerY - 2, "This is a computer-generated invoice.")

    // Build resources dict
    const xObjectEntries: string[] = []
    if (headerLogoObjNum) xObjectEntries.push(`/ImHeaderLogo ${headerLogoObjNum} 0 R`)
    if (footerLogoObjNum) xObjectEntries.push(`/ImFooterLogo ${footerLogoObjNum} 0 R`)
    const xObjectDict = xObjectEntries.length ? `/XObject << ${xObjectEntries.join(" ")} >>` : ""

    const contentStream = page.toStream()
    const contentObjNum = writer.addObject(
        `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`,
    )

    // Create the page object with a placeholder /Parent, then patch it once
    // we know the Pages object number.
    const pageObjNum = writer.addObject("")
    const pagesObjNum = writer.addObject(`<< /Type /Pages /Kids [${pageObjNum} 0 R] /Count 1 >>`)
    writer.updateObject(
        pageObjNum,
        `<< /Type /Page /Parent ${pagesObjNum} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontF1} 0 R /F2 ${fontF2} 0 R >> ${xObjectDict} >> /Contents ${contentObjNum} 0 R >>`,
    )

    const catalogObjNum = writer.addObject(`<< /Type /Catalog /Pages ${pagesObjNum} 0 R >>`)

    return writer.build(catalogObjNum)
}

export async function downloadInvoicePdf(invoice: InvoiceForPdf): Promise<void> {
    const bytes = await generateInvoicePdfBytes(invoice)
    const blob = new Blob([bytes.buffer.slice(0) as ArrayBuffer], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `invoice-${invoice.invoiceNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}