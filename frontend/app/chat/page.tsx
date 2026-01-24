import ChatInterface from '@/components/ChatInterface';

export default function ChatPage() {
    return (
        <main className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
            {/* Background Elements - Removed as per user request */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                {/* Gradient blobs removed */}
            </div>

            <div className="relative z-10 w-full max-w-5xl">
                <ChatInterface />
            </div>
        </main>
    );
}
