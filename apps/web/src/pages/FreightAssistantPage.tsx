import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bot, CheckCircle2, ClipboardList, MessageSquareText } from 'lucide-react';

const starterText = `Customer needs a 53 ft dry van from Chicago, IL to Dallas, TX. Pickup is tomorrow morning. Freight is palletized retail goods, 24,000 lb, no hazmat, delivery required next day by 6 PM.`;

const FreightAssistantPage: React.FC = () => {
  const [input, setInput] = useState(starterText);

  const summary = useMemo(() => {
    const text = input.toLowerCase();
    const hasOrigin = text.includes('chicago') || text.includes('atlanta') || text.includes('houston');
    const hasDestination = text.includes('dallas') || text.includes('charlotte') || text.includes('phoenix');
    const hasEquipment = text.includes('dry van') || text.includes('reefer') || text.includes('flatbed');
    const hasWeight = text.includes('lb') || text.includes('pound') || text.includes('weight');

    return {
      readiness: [hasOrigin, hasDestination, hasEquipment, hasWeight].filter(Boolean).length,
      nextSteps: [
        hasOrigin && hasDestination ? 'Confirm lane mileage and pickup/delivery windows.' : 'Collect complete origin and destination details.',
        hasEquipment ? 'Validate equipment availability and accessorial requirements.' : 'Confirm required equipment type.',
        hasWeight ? 'Check carrier capacity against freight weight and dimensions.' : 'Request weight, dimensions, and pallet count.',
        'Quote rate, document assumptions, and assign dispatcher follow-up owner.',
      ],
    };
  }, [input]);

  return (
    <main className="min-h-screen bg-[#090909] px-6 py-8 text-[#F5E8E8]">
      <div className="mx-auto max-w-6xl">
        <Link to="/home" className="mb-8 inline-flex items-center gap-2 text-sm text-[#B88989] hover:text-[#F5E8E8]">
          <ArrowLeft size={16} /> Back to Infamous Freight
        </Link>

        <header className="mb-8">
          <div className="mb-3 inline-flex rounded-xl bg-infamous-orange/10 p-3 text-infamous-orange">
            <Bot size={26} />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-infamous-orange">AI operations assistant</p>
          <h1 className="mt-2 text-3xl font-bold">Turn messy freight requests into dispatch-ready next steps</h1>
          <p className="mt-2 max-w-3xl text-[#B88989]">
            This MVP assistant summarizes quote intake, checks for missing operational details, and gives dispatch a clean action list.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-infamous-border bg-infamous-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <MessageSquareText className="text-infamous-orange" size={22} />
              <h2 className="text-xl font-bold">Freight request input</h2>
            </div>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="min-h-80 w-full rounded-2xl border border-infamous-border bg-infamous-panel p-4 text-sm leading-6 text-[#F5E8E8] outline-none transition focus:border-infamous-orange"
            />
          </div>

          <div className="rounded-3xl border border-infamous-border bg-infamous-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <ClipboardList className="text-infamous-orange" size={22} />
              <h2 className="text-xl font-bold">Dispatch summary</h2>
            </div>

            <div className="mb-5 rounded-2xl border border-infamous-border bg-infamous-panel p-4">
              <p className="text-xs uppercase tracking-wider text-[#B88989]/70">Quote readiness</p>
              <p className="mt-2 text-3xl font-bold">{summary.readiness}/4</p>
              <p className="mt-1 text-sm text-[#B88989]">Checks detected from request text.</p>
            </div>

            <div className="space-y-3">
              {summary.nextSteps.map((step) => (
                <div key={step} className="flex gap-3 rounded-2xl border border-infamous-border bg-infamous-panel p-4">
                  <CheckCircle2 className="mt-0.5 flex-shrink-0 text-green-400" size={18} />
                  <p className="text-sm leading-6 text-[#F5E8E8]/80">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default FreightAssistantPage;
