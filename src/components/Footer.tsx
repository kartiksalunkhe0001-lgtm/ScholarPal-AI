import React from 'react';
import { ShieldCheck, Lock, ExternalLink, Sparkles } from 'lucide-react';

interface FooterProps {
  onDeleteData?: () => void;
  onOpenDiagnostics?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onDeleteData, onOpenDiagnostics }) => {
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Main Trust Banner */}
        <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="text-sm leading-relaxed text-emerald-100/90 font-medium">
            <span className="font-bold text-white">Trust & Official Source Guarantee:</span>{' '}
            ScholarPal AI is an independent guidance tool, not a government website. Always confirm
            details and apply only on the official website. Never pay anyone to get a scholarship.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800 text-sm">
          {/* Column 1: Privacy Promise */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Strict Privacy Standard</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Your caste, family income, and academic details are treated with the highest
              confidentiality. We use them strictly for local matching algorithms. We never sell,
              share, or display your data publicly.
            </p>
            {onDeleteData && (
              <>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="text-xs text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer"
                >
                  Delete my data from this device
                </button>

                {showDeleteModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
                      <h3 className="text-lg font-black text-slate-900">Erase All Stored Data?</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        This permanently removes your profile, matched scholarships, and test attempts from this device.
                      </p>
                      <div className="mt-6 flex items-center gap-2">
                        <button
                          onClick={() => setShowDeleteModal(false)}
                          className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteModal(false);
                            onDeleteData();
                          }}
                          className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs cursor-pointer"
                        >
                          Confirm Erase
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Column 2: Official Portals */}
          <div className="space-y-3">
            <div className="text-white font-semibold">Official Indian Portals</div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://scholarships.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 flex items-center gap-1.5"
                >
                  National Scholarship Portal (NSP)
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.aicte-india.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 flex items-center gap-1.5"
                >
                  AICTE Pragati, Saksham & Swanath
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://ugc.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 flex items-center gap-1.5"
                >
                  UGC Higher Education Schemes
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://csirhrdg.res.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 flex items-center gap-1.5"
                >
                  CSIR Human Resource Development
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Coverage */}
          <div className="space-y-3">
            <div className="text-white font-semibold">Inclusive Coverage</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Serving students across all 28 States and 8 Union Territories from Class 1 through
              Doctorate/Ph.D. level. Free, fair, and dedicated to student success.
            </p>
            <div className="text-xs text-emerald-400 font-medium">
              National Helpline for NSP: 0120-6619540
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <p>© {new Date().getFullYear()} ScholarPal AI. All verified details sourced from official notices.</p>
            {onOpenDiagnostics && (
              <button
                onClick={onOpenDiagnostics}
                className="text-xs text-slate-400 hover:text-emerald-400 underline transition-colors cursor-pointer"
              >
                Check AI connection
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <span>Powered by Gemini & Google Search Grounding</span>
            <Sparkles className="w-3 h-3 text-emerald-400" />
          </div>
        </div>
      </div>
    </footer>
  );
};
