'use client';

import { usePathname } from 'next/navigation';
import FloatingChatbot from "@/components/FloatingChatbot";
import FloatingNavbar from "@/components/FloatingNavbar";
import Footer from "@/components/Footer";

export default function ClientShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isChatPage = pathname === '/chat';

    return (
        <div className="max-w-7xl mx-auto bg-primary min-h-screen border-x border-[#111] shadow-[0_0_40px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col">
            {!isChatPage && <FloatingChatbot />}
            {!isChatPage && <FloatingNavbar />}
            <div className="flex-grow">
                {children}
            </div>
            {!isChatPage && <Footer />}
        </div>
    );
}
