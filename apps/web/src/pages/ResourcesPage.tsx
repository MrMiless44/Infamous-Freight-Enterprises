import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { resourceArticles } from '@/data/resourceArticles';

const ResourcesPage: React.FC = () => {
  const categories = [...new Set(resourceArticles.map((a) => a.category))];

  return (
    <main className="min-h-screen bg-[#090909] px-6 py-10 text-[#F5E8E8]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 inline-flex rounded-xl bg-infamous-orange/10 p-3 text-infamous-orange">
          <BookOpen size={24} />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">Resources</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Freight guides and resources</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#F5E8E8]/80">
          Practical freight knowledge for shippers, carriers, and logistics teams. Equipment guides, industry
          explanations, and decision frameworks to help you move freight with confidence.
        </p>

        {categories.map((cat) => (
          <section key={cat} className="mt-12">
            <h2 className="mb-5 text-xl font-bold text-[#F5E8E8]">{cat}</h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {resourceArticles
                .filter((a) => a.category === cat)
                .map((article) => (
                  <Link
                    key={article.slug}
                    to={`/resources/${article.slug}`}
                    className="group rounded-2xl border border-infamous-border bg-infamous-card p-6 transition hover:border-infamous-orange/50"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-infamous-orange">
                      {article.category}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-[#F5E8E8] group-hover:text-infamous-orange transition">
                      {article.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#B88989]">{article.description}</p>
                    <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-infamous-orange">
                      Read guide <ArrowRight size={14} />
                    </p>
                    <p className="mt-1 text-xs text-[#B88989]/70">{article.readTime}</p>
                  </Link>
                ))}
            </div>
          </section>
        ))}

        <section className="mt-14 rounded-2xl border border-infamous-border bg-[#0f0f0f] p-8 text-center">
          <h2 className="text-2xl font-bold">Need help with a specific freight question?</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#B88989]">
            The dispatch team can answer questions about equipment, lanes, pricing, and service options for your
            shipment.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/request-quote"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-infamous-orange px-5 py-3 font-semibold text-[#F5E8E8] transition hover:opacity-90"
            >
              Request a quote <ArrowRight size={17} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-infamous-border bg-infamous-card px-5 py-3 font-semibold text-[#F5E8E8] transition hover:border-infamous-orange/50"
            >
              Contact dispatch
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ResourcesPage;
