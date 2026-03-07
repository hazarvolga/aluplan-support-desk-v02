import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-4xl font-bold mb-4">404 - Sayfa Bulunamadı</h2>
            <p className="text-muted-foreground mb-8">Aradığınız sayfaya ulaşılamıyor.</p>
            <Link
                href="/"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
                Ana Sayfaya Dön
            </Link>
        </div>
    );
}
