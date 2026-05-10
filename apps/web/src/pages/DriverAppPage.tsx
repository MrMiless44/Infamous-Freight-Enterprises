import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Truck,
  Upload,
} from 'lucide-react';

type LoadStage =
  | 'assigned'
  | 'en_route_pickup'
  | 'at_pickup'
  | 'loaded'
  | 'in_transit'
  | 'at_delivery'
  | 'delivered'
  | 'complete';

interface DriverLoad {
  id: string;
  stage: LoadStage;
  origin: string;
  originAddress: string;
  destination: string;
  destinationAddress: string;
  pickupTime: string;
  deliveryTime: string;
  equipment: string;
  commodity: string;
  weight: string;
  dispatcher: string;
  dispatcherPhone: string;
  rate: string;
  miles: string;
  notes: string;
}

const stageConfig: Record<LoadStage, { label: string; button: string; next: LoadStage | null; color: string }> = {
  assigned: { label: 'Assigned', button: 'Accept Load', next: 'en_route_pickup', color: 'bg-infamous-red' },
  en_route_pickup: { label: 'En Route to Pickup', button: 'Arrived at Pickup', next: 'at_pickup', color: 'bg-infamous-red' },
  at_pickup: { label: 'At Pickup', button: 'Start Pickup', next: 'loaded', color: 'bg-infamous-red' },
  loaded: { label: 'Loading', button: 'Mark Picked Up', next: 'in_transit', color: 'bg-infamous-red' },
  in_transit: { label: 'In Transit', button: 'Arrived at Delivery', next: 'at_delivery', color: 'bg-infamous-red' },
  at_delivery: { label: 'At Delivery', button: 'Mark Delivered', next: 'delivered', color: 'bg-emerald-600' },
  delivered: { label: 'Delivered', button: 'Upload POD', next: 'complete', color: 'bg-emerald-600' },
  complete: { label: 'Complete', button: 'Submit Completion', next: null, color: 'bg-emerald-600' },
};

const stageOrder: LoadStage[] = [
  'assigned', 'en_route_pickup', 'at_pickup', 'loaded', 'in_transit', 'at_delivery', 'delivered', 'complete',
];

const demoLoad: DriverLoad = {
  id: 'IF-20491',
  stage: 'in_transit',
  origin: 'Chicago, IL',
  originAddress: '1200 S Ashland Ave, Chicago, IL 60608',
  destination: 'Dallas, TX',
  destinationAddress: '4500 S Lamar St, Dallas, TX 75215',
  pickupTime: 'Apr 29, 2026 · 8:00 AM',
  deliveryTime: 'Apr 30, 2026 · 6:30 PM',
  equipment: '53 ft Dry Van',
  commodity: 'Palletized retail goods',
  weight: '24,000 lb',
  dispatcher: 'Marcus T.',
  dispatcherPhone: '+1 (312) 555-0194',
  rate: '$3,200',
  miles: '925 mi',
  notes: 'Dock door #7 at delivery. Lumper fee pre-paid.',
};

const DriverAppPage: React.FC = () => {
  const [load, setLoad] = useState<DriverLoad>(demoLoad);
  const [showPodUpload, setShowPodUpload] = useState(false);
  const [podUploaded, setPodUploaded] = useState(false);

  const config = stageConfig[load.stage];
  const currentStageIndex = stageOrder.indexOf(load.stage);

  const handleMainAction = () => {
    if (load.stage === 'delivered') {
      setShowPodUpload(true);
      return;
    }
    if (config.next) {
      setLoad({ ...load, stage: config.next });
    }
  };

  const handlePodUpload = () => {
    setPodUploaded(true);
    setShowPodUpload(false);
    setLoad({ ...load, stage: 'complete' });
  };

  return (
    <div className="min-h-screen bg-infamous-dark text-[#F5E8E8] flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-infamous-border bg-infamous-navy">
        <div className="flex items-center gap-2">
          <Truck size={20} className="text-infamous-red-light" />
          <span className="font-bold text-sm">Infamous Freight</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-infamous-muted">Driver View</span>
          <div className="w-8 h-8 rounded-full bg-infamous-red flex items-center justify-center text-xs font-bold">D</div>
        </div>
      </header>

      {/* Load ID + Status */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-infamous-muted uppercase tracking-wider">Current Load</p>
            <p className="text-xl font-black mt-0.5">{load.id}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold text-[#F5E8E8] ${
            load.stage === 'complete' ? 'bg-emerald-600' :
            load.stage.includes('delivery') || load.stage === 'delivered' ? 'bg-emerald-600' :
            'bg-infamous-red'
          }`}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-1">
          {stageOrder.map((stage, i) => (
            <div
              key={stage}
              className={`flex-1 h-1.5 rounded-full ${
                i <= currentStageIndex ? 'bg-infamous-red' : 'bg-infamous-border'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-infamous-muted mt-1.5">Step {currentStageIndex + 1} of {stageOrder.length}</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 space-y-4">
        {/* Route Card */}
        <div className="rounded-xl border border-infamous-border bg-infamous-card p-4">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 pt-1">
              <div className="w-3 h-3 rounded-full bg-infamous-red" />
              <div className="w-px h-10 bg-infamous-border" />
              <div className="w-3 h-3 rounded-full bg-[#36D399]" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-infamous-muted">Pickup</p>
                <p className="font-bold text-base">{load.origin}</p>
                <p className="text-xs text-[#B88989]/70 mt-0.5">{load.originAddress}</p>
                <p className="text-xs text-infamous-red-light mt-1 flex items-center gap-1">
                  <Clock size={10} /> {load.pickupTime}
                </p>
              </div>
              <div>
                <p className="text-xs text-infamous-muted">Delivery</p>
                <p className="font-bold text-base">{load.destination}</p>
                <p className="text-xs text-[#B88989]/70 mt-0.5">{load.destinationAddress}</p>
                <p className="text-xs text-[#36D399] mt-1 flex items-center gap-1">
                  <Clock size={10} /> {load.deliveryTime}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Load Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-infamous-border bg-infamous-card p-3">
            <p className="text-xs text-infamous-muted">Equipment</p>
            <p className="text-sm font-semibold mt-1">{load.equipment}</p>
          </div>
          <div className="rounded-xl border border-infamous-border bg-infamous-card p-3">
            <p className="text-xs text-infamous-muted">Weight</p>
            <p className="text-sm font-semibold mt-1">{load.weight}</p>
          </div>
          <div className="rounded-xl border border-infamous-border bg-infamous-card p-3">
            <p className="text-xs text-infamous-muted">Rate</p>
            <p className="text-sm font-semibold mt-1 text-[#36D399]">{load.rate}</p>
          </div>
          <div className="rounded-xl border border-infamous-border bg-infamous-card p-3">
            <p className="text-xs text-infamous-muted">Miles</p>
            <p className="text-sm font-semibold mt-1">{load.miles}</p>
          </div>
        </div>

        {/* Notes */}
        {load.notes && (
          <div className="rounded-xl border border-infamous-border bg-infamous-card p-4">
            <p className="text-xs text-infamous-muted mb-1">Dispatch Notes</p>
            <p className="text-sm text-[#F5E8E8]/80">{load.notes}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`https://maps.google.com/?daddr=${encodeURIComponent(
              load.stage === 'in_transit' || load.stage === 'at_delivery' || load.stage === 'delivered'
                ? load.destinationAddress
                : load.originAddress
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-infamous-border bg-infamous-card p-4 transition hover:border-infamous-red/30"
          >
            <Navigation size={20} className="text-infamous-red-light" />
            <div>
              <p className="text-sm font-semibold">Navigate</p>
              <p className="text-xs text-infamous-muted">Open Maps</p>
            </div>
          </a>
          <a
            href={`tel:${load.dispatcherPhone}`}
            className="flex items-center gap-3 rounded-xl border border-infamous-border bg-infamous-card p-4 transition hover:border-infamous-red/30"
          >
            <Phone size={20} className="text-[#36D399]" />
            <div>
              <p className="text-sm font-semibold">Call Dispatch</p>
              <p className="text-xs text-infamous-muted">{load.dispatcher}</p>
            </div>
          </a>
        </div>

        {/* Documents + Messages */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center gap-3 rounded-xl border border-infamous-border bg-infamous-card p-4 transition hover:border-infamous-red/30">
            <FileText size={20} className="text-infamous-ember" />
            <div className="text-left">
              <p className="text-sm font-semibold">Documents</p>
              <p className="text-xs text-infamous-muted">BOL, Rate Con</p>
            </div>
          </button>
          <Link
            to="/messages"
            className="flex items-center gap-3 rounded-xl border border-infamous-border bg-infamous-card p-4 transition hover:border-infamous-red/30"
          >
            <MessageSquare size={20} className="text-infamous-red-light" />
            <div>
              <p className="text-sm font-semibold">Messages</p>
              <p className="text-xs text-infamous-muted">Dispatch Chat</p>
            </div>
          </Link>
        </div>

        {/* POD Section (when delivered) */}
        {(load.stage === 'delivered' || load.stage === 'complete') && (
          <div className="rounded-xl border border-infamous-border bg-infamous-card p-4">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Camera size={16} className="text-[#36D399]" />
              Proof of Delivery
            </h3>
            {podUploaded ? (
              <div className="flex items-center gap-3 text-[#36D399]">
                <CheckCircle size={20} />
                <div>
                  <p className="font-semibold text-sm">POD Uploaded</p>
                  <p className="text-xs text-infamous-muted">Signature + 2 photos captured</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#B88989]/70">Tap the main action button below to upload POD.</p>
            )}
          </div>
        )}
      </div>

      {/* POD Upload Modal */}
      {showPodUpload && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 pb-4">
          <div className="w-full max-w-lg rounded-2xl bg-infamous-card border border-infamous-border p-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Upload size={20} className="text-infamous-red-light" />
              Upload Proof of Delivery
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-4 rounded-xl border border-dashed border-infamous-border bg-infamous-panel p-4 transition hover:border-infamous-red/30">
                <Camera size={24} className="text-infamous-red-light" />
                <div className="text-left">
                  <p className="font-semibold text-sm">Take Photo</p>
                  <p className="text-xs text-infamous-muted">Capture delivery photo with camera</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-4 rounded-xl border border-dashed border-infamous-border bg-infamous-panel p-4 transition hover:border-infamous-red/30">
                <Upload size={24} className="text-infamous-red-light" />
                <div className="text-left">
                  <p className="font-semibold text-sm">Upload File</p>
                  <p className="text-xs text-infamous-muted">Select from photo library</p>
                </div>
              </button>
              <div className="rounded-xl border border-dashed border-infamous-border bg-infamous-panel p-4">
                <p className="text-xs text-infamous-muted mb-2">Signature</p>
                <div className="h-24 rounded-lg bg-infamous-dark border border-infamous-border flex items-center justify-center">
                  <p className="text-sm text-[#B88989]/70">Tap to capture signature</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPodUpload(false)}
                className="flex-1 rounded-xl border border-infamous-border bg-infamous-panel py-3 font-semibold text-sm transition hover:bg-infamous-border"
              >
                Cancel
              </button>
              <button
                onClick={handlePodUpload}
                className="flex-1 rounded-xl bg-emerald-600 py-3 font-semibold text-sm text-[#F5E8E8] transition hover:bg-[#36D399]"
              >
                Submit POD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Main Action Button */}
      {load.stage !== 'complete' ? (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-infamous-dark via-infamous-dark to-transparent pt-8">
          <button
            onClick={handleMainAction}
            className={`w-full ${config.color} text-[#F5E8E8] rounded-2xl py-5 text-lg font-black shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-3`}
          >
            {config.button}
            <ChevronRight size={22} />
          </button>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-infamous-dark via-infamous-dark to-transparent pt-8">
          <div className="w-full bg-emerald-600/10 border border-emerald-600/30 text-[#36D399] rounded-2xl py-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={22} />
              <span className="text-lg font-black">Load Complete</span>
            </div>
            <p className="text-sm mt-1 text-[#36D399]/70">POD submitted. Awaiting invoice.</p>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-infamous-navy border-t border-infamous-border z-40 hidden">
        <div className="flex items-center justify-around py-2">
          <Link to="/driver-app" className="flex flex-col items-center gap-1 py-1 text-infamous-red-light">
            <Truck size={20} />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link to="/loads" className="flex flex-col items-center gap-1 py-1 text-[#B88989]/70">
            <MapPin size={20} />
            <span className="text-[10px] font-medium">Loads</span>
          </Link>
          <Link to="/messages" className="flex flex-col items-center gap-1 py-1 text-[#B88989]/70">
            <MessageSquare size={20} />
            <span className="text-[10px] font-medium">Messages</span>
          </Link>
          <Link to="/documents" className="flex flex-col items-center gap-1 py-1 text-[#B88989]/70">
            <FileText size={20} />
            <span className="text-[10px] font-medium">Docs</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default DriverAppPage;
