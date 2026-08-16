import type { Metadata } from "next"; import "./globals.css";
export const metadata: Metadata={title:"VIC Student Dashboard",description:"Visionary Interns Club student dashboard"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}