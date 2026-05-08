import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Calendar, Clock } from 'lucide-react';
import { findArticle, resourceArticles } from '@/data/resourceArticles';
import Breadcrumb from '@/components/Breadcrumb';

const ResourceArticlePage: React.FC = () => {
  const { articleSlug } = useParams();
  const article = findArticle(articleSlug);

  if (!article) {
    return <Navigate to="/resources" replace />;
  }

  return (
    <main className="min-h-screen bg-[#090909] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Breadcrumb items={[{ label: 'Resources', href: '/resources' }, { label: article.title }]} />

        <div className="mb-5 inline-flex rounded-xl bg-infamous-orange/10 p-3 text-infamous-orange">
          <BookOpen size={24} />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">{article.category}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{article.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-2"><Clock size={14} /> {article.readTime}</span>
          <span className="flex items-center gap-2"><Calendar size={14} /> Published May 8, 2026</span>
        </div>
        <p className="mt-4 text-lg leading-8 text-gray-300">{article.description}</p>

        <div className="mt-10 space-y-10">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-bold text-white">{section.heading}</h2>
              <p className="mt-3 text-base leading-8 text-gray-300">{section.body}</p>
            </section>
          ))}
        </div>

        {article.relatedLinks.length > 0 && (
          <nav className="mt-12 rounded-2xl border border-infamous-border bg-infamous-card p-6">
            <h2 className="text-lg font-bold text-white">Related</h2>
            <div className="mt-4 space-y-3">
              {article.relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center gap-2 text-sm font-semibold text-infamous-orange hover:underline"
                >
                  <ArrowRight size={14} /> {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}

        <section className="mt-12 rounded-2xl border border-infamous-border bg-[#0f0f0f] p-8">
          <h2 className="text-xl font-bold">Ready to ship?</h2>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Get a freight quote or talk to the dispatch team about your shipment needs.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/request-quote"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-infamous-orange px-5 py-3 font-semibold text-white transition hover:opacity-90"
            >
              Request a quote <ArrowRight size={17} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-infamous-border bg-infamous-card px-5 py-3 font-semibold text-white transition hover:border-infamous-orange/50"
            >
              Contact dispatch
            </Link>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-5 text-lg font-bold">More resources</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {resourceArticles
              .filter((a) => a.slug !== article.slug)
              .slice(0, 4)
              .map((a) => (
                <Link
                  key={a.slug}
                  to={`/resources/${a.slug}`}
                  className="rounded-2xl border border-infamous-border bg-infamous-card p-5 transition hover:border-infamous-orange/50"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-infamous-orange">
                    {a.category}
                  </p>
                  <h3 className="mt-2 font-bold text-white">{a.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{a.description}</p>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ResourceArticlePage;
