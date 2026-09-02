import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../store';
import { useToast } from '../../components/Toast';
import { BottomSheet } from '../../components/BottomSheet';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Phone,
  ArrowUpRight,
  UserCheck,
  Calendar
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { AnimatedNumber } from '../../components/AnimatedNumber';

gsap.registerPlugin(useGSAP);

const ITEMS_PER_PAGE = 15;

export const ClientsList: React.FC = () => {
  const { clients, deleteClient, orders } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id: string, name: string) => {
    setClientToDelete({ id, name });
    setShowDeleteModal(true);
    setActiveMenu(null);
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    try {
      await deleteClient(clientToDelete.id);
      showToast('Cliente excluído com sucesso!', 'success');
    } catch (error) {
      console.error('Failed to delete client', error);
      showToast('Erro ao excluir cliente. Verifique se possui ordens de serviço associadas.', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setClientToDelete(null);
    }
  };

  const handleSearchOrders = (clientName: string) => {
    navigate(`/orders?search=${encodeURIComponent(clientName)}`);
  };

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredClients = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return clients
      .filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.cpf.includes(query) ||
          client.phone.includes(query)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [clients, searchTerm]);

  // Clients with active orders count
  const clientsWithActiveOrdersCount = useMemo(() => {
    const activeClientIds = new Set(
      orders.filter((o) => o.status !== 'Concluído' && o.status !== 'Cancelado' && o.clientId).map((o) => o.clientId)
    );
    return activeClientIds.size;
  }, [orders]);

  // New clients this month count
  const newClientsThisMonth = useMemo(() => {
    const now = new Date();
    return clients.filter((c) => {
      const d = new Date(c.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [clients]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedClients = filteredClients.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );
  const rangeStart = filteredClients.length === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;
  const rangeEnd = Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredClients.length);

  useGSAP(() => {
    if (!containerRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.from('.gsap-client-row', {
      opacity: 0,
      y: 10,
      stagger: 0.025,
      duration: 0.28,
      ease: 'power2.out',
      clearProps: 'opacity,transform',
    });

    gsap.from('.gsap-client-card', {
      opacity: 0,
      y: 12,
      stagger: 0.035,
      duration: 0.32,
      ease: 'power2.out',
      clearProps: 'opacity,transform',
    });
  }, { dependencies: [safeCurrentPage, searchTerm], scope: containerRef });

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Pagination Component
  const PaginationControls = () => {
    const getPageNumbers = () => {
      if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
      const pages: (number | '...')[] = [];
      if (safeCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (safeCurrentPage >= totalPages - 3) {
        pages.push(
          1,
          '...',
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          '...',
          safeCurrentPage - 1,
          safeCurrentPage,
          safeCurrentPage + 1,
          '...',
          totalPages
        );
      }
      return pages;
    };

    return (
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-neutral-800 flex-wrap text-xs">
        <p className="text-slate-500 dark:text-slate-400">
          {filteredClients.length === 0 ? (
            'Nenhum cliente encontrado'
          ) : (
            <>
              Exibindo{' '}
              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                {rangeStart}–{rangeEnd}
              </span>{' '}
              de{' '}
              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                {filteredClients.length}
              </span>{' '}
              clientes
            </>
          )}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                scrollToTop();
              }}
              disabled={safeCurrentPage === 1}
              className="size-8 flex items-center justify-center rounded-xl border border-slate-200/80 dark:border-neutral-700 bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              title="Página Anterior"
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((page, idx) =>
              page === '...' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-7 text-center text-slate-400 font-bold select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page as number);
                    scrollToTop();
                  }}
                  className={`size-8 flex items-center justify-center rounded-xl font-extrabold text-xs transition-all active:scale-95 ${
                    safeCurrentPage === page
                      ? 'bg-primary text-white shadow-sm shadow-primary/30'
                      : 'border border-slate-200/80 dark:border-neutral-700 bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                scrollToTop();
              }}
              disabled={safeCurrentPage === totalPages}
              className="size-8 flex items-center justify-center rounded-xl border border-slate-200/80 dark:border-neutral-700 bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              title="Próxima Página"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleWhatsApp = (e: React.MouseEvent, phone: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Olá ${name}, aqui é da HcCell Assistência Técnica. Em que posso ajudar?`;
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <>
      <div ref={containerRef} className="max-w-[1400px] mx-auto flex flex-col gap-3.5 sm:gap-6 pb-36 md:pb-12">
        {/* Modern SaaS Header (Oculto no Mobile para economizar espaço) */}
        <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-surface-dark p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Users size={16} />
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Gestão de Relacionamento
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Base de Clientes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Cadastre e consulte informações de contatos, históricos e registros.
            </p>
          </div>

          <Link
            to="/clients/new"
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm shadow-primary/20 transition-all active:scale-95 whitespace-nowrap self-start sm:self-auto"
          >
            <UserPlus size={18} />
            <span>Cadastrar Novo Cliente</span>
          </Link>
        </div>

        {/* Quick Metrics Bar (Oculto no Mobile para economizar espaço) */}
        <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
              <Users size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Total de Clientes
              </span>
              <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                <AnimatedNumber value={clients.length} format="integer" />
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0">
              <UserCheck size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Com OS em Bancada
              </span>
              <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                <AnimatedNumber value={clientsWithActiveOrdersCount} format="integer" />
              </span>
            </div>
          </div>

          <div className="hidden sm:flex bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-500 rounded-xl shrink-0">
              <Calendar size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Novos Este Mês
              </span>
              <span className="text-lg font-black font-mono text-cyan-600 dark:text-cyan-400">
                <AnimatedNumber value={newClientsThisMonth} format="integer" />
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white dark:bg-surface-dark p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80 dark:border-neutral-800 flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-8 py-2.5 border border-slate-200/80 dark:border-neutral-800 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs transition-all font-medium"
              placeholder="Buscar por Nome, CPF ou Telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Mobile + Novo Cliente Button */}
          <Link
            to="/clients/new"
            className="sm:hidden flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-3.5 py-2.5 rounded-xl font-bold text-xs shadow-xs shadow-primary/25 transition-all active:scale-95 shrink-0"
            title="Novo Cliente"
          >
            <UserPlus size={16} />
            <span className="font-extrabold">Novo</span>
          </Link>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-surface-dark rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50">
                  <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    Cliente / Nome
                  </th>
                  <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    CPF
                  </th>
                  <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    Telefone / Contato
                  </th>
                  <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">
                    Cadastrado Em
                  </th>
                  <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/80">
                {paginatedClients.length > 0 ? (
                  paginatedClients.map((client) => (
                    <tr
                      key={client.id}
                      className="gsap-client-row group hover:bg-slate-50/80 dark:hover:bg-neutral-900/60 transition-colors"
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center text-xs font-black shrink-0 border border-primary/20">
                            {client.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                              {client.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300 font-mono">
                        {client.cpf || '—'}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300 font-mono">
                        <div className="flex items-center gap-2">
                          <span>{client.phone}</span>
                          {client.phone && (
                            <button
                              onClick={(e) => handleWhatsApp(e, client.phone, client.name)}
                              className="size-7 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                              title="Abrir no WhatsApp"
                            >
                              <WhatsAppIcon size={14} color="#10b981" />
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 text-right">
                        {new Date(client.createdAt).toLocaleDateString('pt-BR', {
                          timeZone: 'America/Sao_Paulo',
                        })}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-right text-xs font-medium">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/clients/${client.id}/edit`}
                            className="size-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all border border-slate-200/60 dark:border-neutral-700 shadow-sm"
                            title="Editar Cliente"
                          >
                            <Edit size={14} />
                          </Link>

                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveMenu(activeMenu === client.id ? null : client.id)
                              }
                              className={`size-8 flex items-center justify-center rounded-lg transition-all border border-slate-200/60 dark:border-neutral-700 ${
                                activeMenu === client.id
                                  ? 'bg-slate-200 dark:bg-neutral-700 text-slate-900 dark:text-white'
                                  : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
                              }`}
                              title="Opções"
                            >
                              <MoreHorizontal size={16} />
                            </button>

                            <AnimatePresence>
                              {activeMenu === client.id && (
                                <>
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs z-[60]"
                                    onClick={() => setActiveMenu(null)}
                                  />
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-slate-200/80 dark:border-neutral-800 z-[70] py-1.5 overflow-hidden"
                                  >
                                    <button
                                      onClick={() => handleSearchOrders(client.name)}
                                      className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-800 font-bold flex items-center gap-2 transition-colors"
                                    >
                                      <FileText size={15} />
                                      Buscar Ordens (OS)
                                    </button>
                                    <button
                                      onClick={() => handleDeleteClick(client.id, client.name)}
                                      className="w-full text-left px-4 py-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold flex items-center gap-2 transition-colors border-t border-slate-100 dark:border-neutral-800"
                                    >
                                      <Trash2 size={15} />
                                      Excluir Cliente
                                    </button>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <Search size={28} className="mb-2 opacity-30" />
                        <p className="font-bold text-sm text-slate-600 dark:text-slate-300">
                          Nenhum cliente encontrado
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Tente buscar por outro termo.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-neutral-800">
            <PaginationControls />
          </div>
        </div>

        {/* Mobile Card View (App Nativo Style) */}
        <div className="md:hidden flex flex-col gap-3">
          {paginatedClients.length > 0 ? (
            paginatedClients.map((client) => {
              return (
                <div
                  key={client.id}
                  className="gsap-client-card bg-white dark:bg-surface-dark rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-4 shadow-sm transition-all flex flex-col gap-3 active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="size-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center text-sm font-black shrink-0 border border-primary/20">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm truncate">
                          {client.name}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-medium truncate">
                          Desde {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link
                        to={`/clients/${client.id}/edit`}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 font-bold text-xs border border-slate-200/60 dark:border-neutral-700 active:scale-95 shrink-0"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(client.id, client.name)}
                        className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/20 active:scale-95 shrink-0"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800 text-xs">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        CPF
                      </span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {client.cpf || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        Telefone
                      </span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {client.phone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {client.phone && (
                      <button
                        onClick={(e) => handleWhatsApp(e, client.phone, client.name)}
                        className="flex-1 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-500/20 active:scale-95"
                      >
                        <WhatsAppIcon size={14} color="#10b981" />
                        <span>WhatsApp</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleSearchOrders(client.name)}
                      className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200/60 dark:border-neutral-700 active:scale-95"
                    >
                      <FileText size={15} />
                      <span>Ver Ordens</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-8 text-center text-slate-400">
              <Search size={24} className="mx-auto mb-2 opacity-30" />
              <p className="font-bold text-sm text-slate-600 dark:text-slate-300">
                Nenhum cliente encontrado
              </p>
            </div>
          )}

          {paginatedClients.length > 0 && (
            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-4 shadow-sm">
              <PaginationControls />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          {/* Desktop Modal */}
          <div className="fixed inset-0 z-[100] hidden md:flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-surface-dark p-6 text-center shadow-2xl transition-all border border-slate-200/80 dark:border-neutral-800">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4 text-rose-500">
                <Trash2 size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                Excluir Cliente?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 leading-relaxed">
                Tem certeza que deseja excluir o cliente{' '}
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {clientToDelete?.name}
                </span>{' '}
                permanentemente?
                <br />
                <span className="text-rose-500 font-bold">
                  Esta ação não pode ser desfeita e falhará se o cliente possuir ordens associadas.
                </span>
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteClient}
                  disabled={isDeleting}
                  className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm active:scale-95 transition-all disabled:opacity-50"
                >
                  {isDeleting ? 'Excluindo...' : 'Sim, Excluir Registro'}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile BottomSheet */}
          <BottomSheet
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="EXCLUIR CLIENTE"
          >
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4 text-rose-500">
                <Trash2 size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-1">
                Excluir Registro?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 px-4">
                Tem certeza que deseja excluir o cliente{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {clientToDelete?.name}
                </span>
                ?
              </p>

              <div className="w-full flex flex-col gap-2">
                <button
                  onClick={confirmDeleteClient}
                  disabled={isDeleting}
                  className="w-full py-3 rounded-xl bg-rose-600 text-xs font-extrabold text-white uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50"
                >
                  {isDeleting ? 'Excluindo...' : 'Sim, Excluir Agora'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </BottomSheet>
        </>
      )}
    </>
  );
};