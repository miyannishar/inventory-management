export const metadata = {
  title: 'Inventory Management',
  description: 'Track and manage your inventory!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
