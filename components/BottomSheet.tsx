
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isMounted) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[100] md:hidden"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 150 || info.velocity.y > 500) {
                                onClose();
                            }
                        }}
                        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 z-[101] rounded-t-[32px] shadow-2xl overflow-hidden md:hidden outline-none touch-none"
                        style={{ maxHeight: '92vh' }}
                    >
                        {/* Drag Handle */}
                        <div className="flex flex-col items-center pt-3 pb-6 sticky top-0 bg-white dark:bg-neutral-900 z-10">
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-neutral-700 rounded-full mb-1" />
                            {title && (
                                <div className="mt-4 px-6 w-full">
                                    <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{title}</h3>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="px-4 pb-12 overflow-y-auto overflow-x-hidden max-h-[80vh] touch-pan-y">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
