import React from 'react';
import { useApp } from '../store';
import { OrderStatus } from '../types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  ChevronRight,
  Filter,
  Calendar,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../components/Skeleton';

export const Warranties: React.FC = () => {
  const { orders, clients, loading } = useApp();
  const [activeTab, setActiveTab] = React.useState<'active' | 'expired' | 'all'>('active');
  const [searchQuery, setSearchQuery] = React.useState('');

  const allWarranties = React.useMemo(() => {
    return orders.filter(o => 
      o.status === OrderStatus.COMPLETED && 
      !o.noWarranty && 
      o.warrantyEnd
    ).sort((a, b) => new Date(b.warrantyEnd!).getTime() - new Date(a.warrantyEnd!).getTime());
  }, [orders]);

  const stats = React.useMemo(() => {
    const now = new Date();
    const expired = allWarranties.filter(o => {
      const end = new Date(o.warrantyEnd!);
      end.setHours(23, 59, 59, 999);
      return end < now;
    }).length;
    return {
      total: allWarranties.length,
      active: allWarranties.length - expired,
      expired
    };
  }, [allWarranties]);

  const filteredWarranties = React.useMemo(() => {
    const now = new Date();
    return allWarranties.filter(o => {
      const endDate = new Date(o.warrantyEnd!);
      endDate.setHours(23, 59, 59, 999);
      const isExpired = endDate < now;

      const matchesSearch = 
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (clients.find(c => c.id === o.clientId)?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (activeTab === 'active') return !isExpired;
      if (activeTab === 'expired') return isExpired;
      return true;
    });
  }, [allWarranties, activeTab, searchQuery, clients]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck size={20} className="animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Gestão de Pós-Venda</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Garantias</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Acompanhe e gerencie todos os prazos de garantia dos seus serviços.</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-surface-dark p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-x-auto no-scrollbar">
           <button 
             onClick={() => setActiveTab('active')}
             className={`relative px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap transition-colors duration-200 z-10 ${activeTab === 'active' ? 'text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
           >
             Ativas ({stats.active})
             {activeTab === 'active' && (
               <motion.div
                 layoutId="activeWarrantyTab"
                 className="absolute inset-0 bg-emerald-500 rounded-xl -z-10 shadow-md"
                 transition={{ type: "spring", stiffness: 380, damping: 30 }}
               />
             )}
           </button>
           <button 
             onClick={() => setActiveTab('expired')}
             className={`relative px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap transition-colors duration-200 z-10 ${activeTab === 'expired' ? 'text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
           >
             Vencidas ({stats.expired})
             {activeTab === 'expired' && (
               <motion.div
                 layoutId="activeWarrantyTab"
                 className="absolute inset-0 bg-red-500 rounded-xl -z-10 shadow-md"
                 transition={{ type: "spring", stiffness: 380, damping: 30 }}
               />
             )}
           </button>
           <button 
             onClick={() => setActiveTab('all')}
             className={`relative px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap transition-colors duration-200 z-10 ${activeTab === 'all' ? 'text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
           >
             Todas ({stats.total})
             {activeTab === 'all' && (
               <motion.div
                 layoutId="activeWarrantyTab"
                 className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-md"
                 transition={{ type: "spring", stiffness: 380, damping: 30 }}
               />
             )}
           </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Buscar por modelo, cliente ou ID da OS..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-surface-dark border-2 border-slate-100 dark:border-neutral-800 rounded-[24px] py-4 pl-14 pr-6 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:text-white placeholder:text-slate-400 shadow-sm"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-40 w-full rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <AnimatePresence mode='popLayout'>
            {filteredWarranties.map((o, idx) => {
              const client = clients.find(c => c.id === o.clientId);
              const endDate = new Date(o.warrantyEnd!);
              endDate.setHours(23, 59, 59, 999);
              const isExpired = endDate < new Date();

              return (
                <motion.div
                  layout
                  key={o.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group relative bg-white dark:bg-surface-dark rounded-[32px] p-6 shadow-sm border border-slate-200 dark:border-neutral-800 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all flex flex-col justify-between overflow-hidden"
                >
                  {/* Decorative background icon */}
                  <div className="absolute -right-4 -top-4 p-8 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.08] transition-opacity rotate-12 group-hover:rotate-0 duration-700 pointer-events-none">
                    <ShieldCheck size={120} />
                  </div>

                  <div className="relative space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isExpired ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                        {isExpired ? 'Vencida' : 'Ativa'}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">OS #{o.displayId || o.id.slice(0, 8)}</span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight">{o.deviceModel}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">{client?.name || 'Cliente N/A'}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between gap-4">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">Expira em</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Calendar size={14} className={isExpired ? 'text-red-500' : 'text-primary'} />
                          <span className={`text-sm font-black whitespace-nowrap ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
                            {new Date(o.warrantyEnd!).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <Link 
                        to={`/orders/${o.id}`}
                        className="p-3 bg-slate-50 dark:bg-neutral-900 rounded-2xl text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm flex-shrink-0"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredWarranties.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
               <div className="w-20 h-20 bg-slate-50 dark:bg-neutral-900 rounded-full flex items-center justify-center border border-slate-100 dark:border-neutral-800">
                  <Search size={32} className="text-slate-300" />
               </div>
               <div className="space-y-1">
                 <h3 className="text-slate-900 dark:text-white font-black text-lg">Nenhuma garantia encontrada</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-sm">Tente mudar o filtro ou termo de busca.</p>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
