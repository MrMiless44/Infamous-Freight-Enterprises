import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Box,
  CheckCircle2,
  Code2,
  GitBranch,
  Globe2,
  Layers3,
  Map,
  Navigation,
  Network,
  Route,
  Server,
  Shield,
  Smartphone,
  TrainFront,
} from 'lucide-react';

const releases = [
  {
    version: '11.x',
    label: 'Current stable',
    details: 'Java 17+, web service jar 11.0, released October 14, 2025.',
  },
  {
    version: '10.x',
    label: 'Previous major',
    details: 'Web service jar 10.0, released November 5, 2024.',
  },
  {
    version: '9.x',
    label: 'Legacy support',
    details: 'Web service jar 9.1, released April 23, 2024.',
  },
];

const capabilities = [
  { icon: Route, title: 'A-to-B routing', body: 'Calculate distance, travel time, instructions, and road attributes between two or more points.' },
  { icon: Navigation, title: 'Map matching', body: 'Snap GPX traces and noisy GPS data back to the road network for cleaner route histories.' },
  { icon: Activity, title: 'Isochrones', body: 'Analyze reachable areas by travel time or distance and visualize service coverage.' },
  { icon: TrainFront, title: 'Public transit', body: 'Import GTFS data for time-dependent routing across scheduled transit networks.' },
  { icon: Smartphone, title: 'Mobile navigation', body: 'Serve navigation responses that can be consumed by MapLibre Navigation SDK or Ferrostar.' },
  { icon: Layers3, title: 'Path details', body: 'Expose route attributes such as road class, surface, max speed, turn restrictions, and elevation.' },
];

const modes = [
  {
    name: 'Speed mode',
    tag: 'Contraction Hierarchies',
    body: 'Prepares predefined profiles for extremely fast, low-memory responses without heuristics.',
  },
  {
    name: 'Hybrid mode',
    tag: 'Flexible enough for traffic',
    body: 'Adds preparation time and memory, but supports request-time customization and remains much faster than flexible mode.',
  },
  {
    name: 'Flexible mode',
    tag: 'No preparation required',
    body: 'Runs without CH preparation and supports the broadest profile customization, trading speed for adaptability.',
  },
];

const features = [
  'OpenStreetMap XML and PBF import',
  'Custom data import support',
  'Car, bike, hike, truck, bus, and motorcycle profiles',
  'Custom models without Java changes',
  'Turn costs and turn restrictions',
  'Country-specific routing rules',
  'Alternative routes',
  'Elevation-aware routing',
  'Vector tiles for debugging',
  'Turn instructions in more than 45 languages',
  'Low-level and high-level Java APIs',
  'JavaScript and Java HTTP clients',
];

const installCommand = `wget https://repo1.maven.org/maven2/com/graphhopper/graphhopper-web/11.0/graphhopper-web-11.0.jar \\
  https://raw.githubusercontent.com/graphhopper/graphhopper/11.x/config-example.yml \\
  http://download.geofabrik.de/europe/germany/berlin-latest.osm.pbf
java -D"dw.graphhopper.datareader.file=berlin-latest.osm.pbf" -jar graphhopper*.jar server config-example.yml`;

const GraphHopperPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-[#f5f7ef] text-[#152016]">
      <section className="relative overflow-hidden border-b border-[#d8dfce]">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute left-[-10%] top-[-20%] h-80 w-80 rounded-full bg-[#b9e675]/60 blur-3xl" />
          <div className="absolute bottom-[-18%] right-[-8%] h-96 w-96 rounded-full bg-[#79c7a7]/50 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#9fb493] bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#496140]">
              <GitBranch size={14} />
              Apache 2.0 routing engine
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              GraphHopper Routing Engine
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4b5946]">
              A fast, memory-efficient Java routing engine for OpenStreetMap and GTFS data. Run it as a
              standalone web server or embed it as a library to power route planning, map matching, isochrones,
              public transit, and mobile navigation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://github.com/graphhopper/graphhopper/blob/11.x/docs/index.md"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#243a22] px-5 py-3 font-bold text-white transition hover:bg-[#31502d]"
              >
                Read documentation <ArrowRight size={17} />
              </a>
              <a
                href="https://discuss.graphhopper.com/"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#9fb493] bg-white/75 px-5 py-3 font-bold text-[#243a22] transition hover:border-[#54764b]"
              >
                Visit community
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-lg border border-[#b8c7ae] bg-[#172417] p-4 shadow-2xl shadow-[#43633c]/20">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#b9e675]">Berlin import</span>
                <span className="rounded bg-[#b9e675]/15 px-2 py-1 text-xs text-[#d5f5a8]">server :8989</span>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-7 text-[#d8e7cc]">
                <code>{installCommand}</code>
              </pre>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm font-bold">
              <div className="rounded-lg border border-[#d8dfce] bg-white/70 p-4">
                <Map className="mx-auto mb-2 text-[#527d43]" size={22} />
                OSM
              </div>
              <div className="rounded-lg border border-[#d8dfce] bg-white/70 p-4">
                <Server className="mx-auto mb-2 text-[#527d43]" size={22} />
                Web API
              </div>
              <div className="rounded-lg border border-[#d8dfce] bg-white/70 p-4">
                <Code2 className="mx-auto mb-2 text-[#527d43]" size={22} />
                Java
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-14 md:grid-cols-3">
        {releases.map((release) => (
          <article key={release.version} className="rounded-lg border border-[#d8dfce] bg-white p-6">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#66805a]">{release.label}</p>
            <h2 className="mt-3 text-3xl font-black">{release.version}</h2>
            <p className="mt-3 leading-7 text-[#55624f]">{release.details}</p>
          </article>
        ))}
      </section>

      <section className="border-y border-[#d8dfce] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#66805a]">Capabilities</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">Routing, analysis, and navigation in one engine</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-lg border border-[#d8dfce] bg-[#f9fbf5] p-6">
                  <Icon className="text-[#527d43]" size={26} />
                  <h3 className="mt-4 text-xl font-black">{item.title}</h3>
                  <p className="mt-3 leading-7 text-[#566351]">{item.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#66805a]">Technical overview</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Choose the routing mode per workload</h2>
          <p className="mt-5 leading-8 text-[#55624f]">
            GraphHopper supports Dijkstra, A*, bidirectional variants, and Contraction Hierarchies. When
            preparations exist, applications can switch between routing modes at request time.
          </p>
        </div>
        <div className="grid gap-4">
          {modes.map((mode) => (
            <article key={mode.name} className="rounded-lg border border-[#d8dfce] bg-white p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-2xl font-black">{mode.name}</h3>
                <span className="rounded-full bg-[#e7f2d8] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#4f6f43]">
                  {mode.tag}
                </span>
              </div>
              <p className="mt-3 leading-7 text-[#55624f]">{mode.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#172417] px-6 py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="inline-flex rounded-lg bg-[#b9e675]/15 p-3 text-[#d5f5a8]">
              <Network size={26} />
            </div>
            <h2 className="mt-5 text-4xl font-black tracking-tight">Feature coverage for production routing</h2>
            <p className="mt-5 leading-8 text-[#c5d5bd]">
              The engine was built for extensible road-network routing, commercial APIs, desktop use, and
              debugging workflows that expose the shape of the graph.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                <CheckCircle2 className="mt-0.5 flex-none text-[#b9e675]" size={18} />
                <span className="text-sm leading-6 text-[#edf6e7]">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-14 md:grid-cols-3">
        <article className="rounded-lg border border-[#d8dfce] bg-white p-6">
          <Shield className="text-[#527d43]" size={25} />
          <h2 className="mt-4 text-xl font-black">Apache License 2.0</h2>
          <p className="mt-3 leading-7 text-[#55624f]">
            Embed GraphHopper in open or closed-source products, while contributing improvements back where useful.
          </p>
        </article>
        <article className="rounded-lg border border-[#d8dfce] bg-white p-6">
          <Globe2 className="text-[#527d43]" size={25} />
          <h2 className="mt-4 text-xl font-black">OpenStreetMap first</h2>
          <p className="mt-3 leading-7 text-[#55624f]">
            Road classes, speed limits, surfaces, ferries, barriers, access restrictions, and country rules are imported.
          </p>
        </article>
        <article className="rounded-lg border border-[#d8dfce] bg-white p-6">
          <Box className="text-[#527d43]" size={25} />
          <h2 className="mt-4 text-xl font-black">Commercial API path</h2>
          <p className="mt-3 leading-7 text-[#55624f]">
            GraphHopper Directions API adds hosted routing, matrix, isochrone, map matching, optimization, and geocoding APIs.
          </p>
        </article>
      </section>

      <section className="border-t border-[#d8dfce] bg-white px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black">Start with the docs or run the Berlin sample locally.</h2>
            <p className="mt-2 text-[#55624f]">After the server starts, open localhost:8989 and right click the map to create a route.</p>
          </div>
          <Link
            to="/resources"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#9fb493] px-5 py-3 font-bold text-[#243a22] transition hover:border-[#54764b]"
          >
            Back to resources
          </Link>
        </div>
      </section>
    </main>
  );
};

export default GraphHopperPage;
