import { redirect } from 'next/navigation';

export default function LegacyLoginPage() {
    // The actual login form lives at the root page (/[locale]/page.tsx).
    // This page exists only for backward compatibility.
    redirect('/tr');
}
