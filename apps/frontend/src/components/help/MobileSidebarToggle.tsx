import { Menu } from 'lucide-react';

interface MobileSidebarToggleProps {
  onToggle: () => void;
  className?: string;
}

export function MobileSidebarToggle({ onToggle, className = '' }: MobileSidebarToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors ${className}`}
      aria-label="Toggle Sidebar"
      aria-expanded="false"
    >
      <Menu size={24} />
    </button>
  );
}
