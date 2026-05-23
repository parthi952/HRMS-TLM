import { motion, AnimatePresence } from "framer-motion";
import { X, Paperclip } from "lucide-react";

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string | undefined;
  title?: string;
  subTitle?: string;
}

export const DocumentViewer = ({
  isOpen,
  onClose,
  filePath,
  title = "Document Preview",
  subTitle
}: DocumentViewerProps) => {
  if (!filePath) return null;

  const isPDF = filePath.toLowerCase().includes(".pdf");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-4xl h-[95vh] bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col border border-white/20"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/5">
                  <Paperclip size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none">
                    {title}
                  </h3>
                  {subTitle && (
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
                      {subTitle}
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center text-slate-400 transition-all active:scale-90 group"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-slate-50 p-0 overflow-hidden flex items-center justify-center relative">
              {isPDF ? (
                <iframe
                  src={`${filePath}#view=Fit`}
                  className="w-full h-full border-none"
                  title={title}
                />
              ) : (
                <div className="w-full h-full p-8 flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-slate-100">
                  <img
                    src={filePath}
                    alt={title}
                    className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl border-4 border-white animate-in zoom-in-95 duration-500"
                  />
                </div>
              )}
            </div>
            
            {/* Footer / Status Bar (Optional) */}
            <div className="px-6 py-3 bg-white border-t border-slate-50 flex justify-end">
               <button 
                 onClick={onClose}
                 className="px-6 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-lg shadow-slate-900/10"
               >
                 Close Viewer
               </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
