import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

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

    if (!isMounted || typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClose();
                        }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[99998] md:hidden"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.8 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100 || info.velocity.y > 400) {
                                onClose();
                            }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 z-[99999] rounded-t-[32px] shadow-2xl overflow-hidden md:hidden outline-none"
                        style={{ maxHeight: '92vh' }}
                    >
                        {/* Drag Handle */}
                        <div className="flex flex-col items-center pt-3 pb-2 sticky top-0 bg-white dark:bg-neutral-900 z-10 select-none cursor-grab active:cursor-grabbing">
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-neutral-700 rounded-full" />
                            {title && (
                                <div className="mt-3 px-6 w-full text-center">
                                    <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</h3>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="px-5 pb-10 overflow-y-auto max-h-[75vh]">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};
