import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <span className="mb-4 text-[#B88989]/60">{icon ?? <Inbox size={40} />}</span>
    <p className="text-base font-semibold text-[#F5E8E8]/80">{title}</p>
    {description && <p className="mt-1 max-w-md text-sm text-[#B88989]/70">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
