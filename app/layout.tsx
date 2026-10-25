import './globals.css';
export const metadata={title:'Hole-In-Won',manifest:'/manifest.json',appleWebApp:{capable:true,title:'Hole-In-Won'}};
export const viewport={themeColor:'#15803d',width:'device-width',initialScale:1,maximumScale:1};
export default function L({children}:{children:React.ReactNode}){return <html lang="en"><body className="bg-green-50 pb-24 text-gray-900">{children}</body></html>}
