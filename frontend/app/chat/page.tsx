import ChatInterface from '@/components/ChatInterface';

export default function ChatPage() {
    return (
        <main className="min-h-screen bg-surface relative overflow-hidden flex items-center justify-center p-4">
            <div className="relative z-10 w-full max-w-5xl">
                <ChatInterface />
            </div>
        </main>
    );
}
