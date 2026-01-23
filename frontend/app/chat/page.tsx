import ChatInterface from '@/components/ChatInterface';

export default function ChatPage() {
    return (
        <main className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-pink-900/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 w-full max-w-5xl">
                <ChatInterface />
            </div>
        </main>
    );
}
