import { Link } from 'react-router-dom';
import { ArrowLeft, MapPinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BRAND } from '@/lib/brand';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <MapPinOff className="mx-auto h-14 w-14 text-infamous-orange mb-6" />
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-infamous-orange mb-3">
          {BRAND.displayName}
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Page not found</h1>
        <p className="text-base text-slate-400 leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved. Check the URL or head back to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button className="bg-infamous-orange hover:opacity-90 text-white font-bold px-6 py-2.5">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800 px-6 py-2.5">
              Contact support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
