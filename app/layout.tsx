import './globals.css';
import {Cormorant_Garamond,Inter} from 'next/font/google';
const serif=Cormorant_Garamond({subsets:['latin'],weight:['400','500','600','700'],variable:'--font-serif'});
const sans=Inter({subsets:['latin'],variable:'--font-sans'});
export const metadata={title:'Hole-In-Won',manifest:'/manifest.json',appleWebApp:{capable:true,title:'Hole-In-Won'}};
export const viewport={themeColor:'#04281b',width:'device-width',initialScale:1,maximumScale:1};
export default function L({children}:{children:React.ReactNode}){return <html lang="en"><body className={`${serif.variable} ${sans.variable} bg-deep pb-24 font-sans text-cream`}>{children}</body></html>}
