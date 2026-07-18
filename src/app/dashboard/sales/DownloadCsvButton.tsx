"use client"

import { Button } from "@/components/ui/Button"

export function DownloadCsvButton({ sales }: { sales: any[] }) {
  const downloadCsv = () => {
    if (!sales || sales.length === 0) return

    // Define headers
    const headers = [
      "Order ID",
      "Tracking ID",
      "Product Title",
      "Quantity",
      "Unit Price",
      "Total Price",
      "Status",
      "Date Placed",
      "Customer Name",
      "Customer Phone",
      "Shipping Address",
      "City",
      "State",
      "Postal Code"
    ]

    // Create rows
    const rows = sales.map(item => {
      const order = item.orders || {}
      const product = item.products || {}
      const address = order.shipping_address || {}
      
      const fullAddress = [address.apartment, address.street, address.landmark]
        .filter(Boolean)
        .join(", ")

      return [
        order.id || "",
        order.tracking_id || "",
        `"${(product.title || "").replace(/"/g, '""')}"`, // escape quotes
        item.quantity || 0,
        item.price_at_time || 0,
        (item.quantity || 0) * (item.price_at_time || 0),
        item.status || "placed",
        new Date(order.created_at || Date.now()).toLocaleDateString(),
        `"${(address.full_name || "").replace(/"/g, '""')}"`,
        address.phone_number || "",
        `"${fullAddress.replace(/"/g, '""')}"`,
        address.city || "",
        address.state || "",
        address.postal_code || ""
      ].join(",")
    })

    const csvContent = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    
    // Create download link
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `sales_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button variant="outline" onClick={downloadCsv} disabled={sales.length === 0}>
      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Download CSV
    </Button>
  )
}
