import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

type BreadcrumbItem = { label: string; href?: string };

const Breadcrumb: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => (
  <nav aria-label="Breadcrumb" className="mb-6">
    <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-400">
      <li className="flex items-center gap-1">
        <Link to="/" className="hover:text-white transition">Home</Link>
      </li>
      {items.map((item, i) => (
        <li key={item.label} className="flex items-center gap-1">
          <ChevronRight size={12} className="text-gray-600" />
          {item.href && i < items.length - 1 ? (
            <Link to={item.href} className="hover:text-white transition">{item.label}</Link>
          ) : (
            <span className="text-gray-200">{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumb;
