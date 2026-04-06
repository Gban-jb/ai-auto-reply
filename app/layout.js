import './globals.css'

export const metadata = {
  title: 'AI Auto-Reply - Missed Call Recovery',
  description: 'AI-powered SMS recovery for small business owners',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
