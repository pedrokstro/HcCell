import React, { useState } from 'react';
import { useApp } from '../../store';
import { useToast } from '../../components/Toast';
import { BottomSheet } from '../../components/BottomSheet';
import {
  Search,
  Filter,
  Download,
  UserPlus,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ITEMS_PER_PAGE = 20;


export const ClientsList: React.FC = () => {
  const { clients, deleteClient } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
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
      console.error("Failed to delete client", error);
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

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpf.includes(searchTerm) ||
    client.phone.includes(searchTerm)
  );

  // ✅ Paginação
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedClients = filteredClients.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );
  const rangeStart = filteredClients.length === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;
  const rangeEnd = Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredClients.length);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // ✅ Componente de Paginação
  const PaginationControls = () => {
    const getPageNumbers = () => {
      if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
      const pages: (number | '...')[] = [];
      if (safeCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (safeCurrentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages);
      }
      return pages;
    };

    return (
      <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-neutral-800 flex-wrap">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {filteredClients.length === 0 ? 'Nenhum cliente encontrado' : (
            <>Exibindo <span className="font-semibold text-slate-700 dark:text-slate-300">{rangeStart}–{rangeEnd}</span> de <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredClients.length}</span> clientes</>
          )}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); scrollToTop(); }}
              disabled={safeCurrentPage === 1}
              className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Página Anterior"
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((page, idx) =>
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="w-8 text-center text-slate-400 text-xs select-none">…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => { setCurrentPage(page as number); scrollToTop(); }}
                  className={`size-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                    safeCurrentPage === page
                      ? 'bg-primary text-white shadow-sm shadow-primary/30'
                      : 'border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); scrollToTop(); }}
              disabled={safeCurrentPage === totalPages}
              className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Próxima Página"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-8 animate-fade-in">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex text-sm">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/dashboard" className="inline-flex items-center text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary">
                Início
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="text-slate-400 mx-2">/</span>
                <span className="text-slate-900 dark:text-white font-medium">Clientes</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Clientes</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie sua base de clientes, histórico de serviços e crie novas ordens.</p>
          </div>
          <Link to="/clients/new" className="hidden sm:flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg shadow-sm font-medium transition-all whitespace-nowrap">
            <UserPlus size={20} />
            <span>Novo Cliente</span>
          </Link>
        </div>

        {/* Search Toolbar */}
        <div className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-neutral-800 rounded-lg leading-5 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Buscar por Nome, CPF ou Telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-600 dark:text-slate-300 bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-neutral-800 font-medium transition-colors">
                <Filter size={18} />
                <span className="hidden sm:inline">Filtros</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-600 dark:text-slate-300 bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-neutral-800 font-medium transition-colors">
                <Download size={18} />
                <span className="hidden sm:inline">Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm animate-fade-in-up">
          <div className="overflow-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/50">
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Nome</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">CPF</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Telefone</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap text-right">Desde</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                {paginatedClients.length > 0 ? (
                  paginatedClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-neutral-900/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {client.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">{client.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-mono">{client.cpf}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-mono">{client.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-300 text-right">
                        {new Date(client.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/clients/${client.id}/edit`} className="text-primary hover:text-primary-dark p-1.5 hover:bg-primary/10 rounded-md transition-colors">
                            <Edit size={20} />
                          </Link>
                          <div className="relative">
                            <button
                              onClick={() => setActiveMenu(activeMenu === client.id ? null : client.id)}
                              className={`p-1.5 rounded-md transition-colors ${activeMenu === client.id ? 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800'}`}
                            >
                              <MoreHorizontal size={20} />
                            </button>

                            <AnimatePresence>
                              {activeMenu === client.id && (
                                <>
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm z-[60]"
                                    onClick={() => setActiveMenu(null)}
                                  />
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-slate-100 dark:border-neutral-800 z-[70] py-1.5 overflow-hidden"
                                  >
                                    <button
                                      onClick={() => handleSearchOrders(client.name)}
                                      className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 hover:text-primary font-medium flex items-center gap-2 transition-colors"
                                    >
                                      <FileText size={16} />
                                      Buscar Ordens
                                    </button>
                                    <button
                                      onClick={() => handleDeleteClick(client.id, client.name)}
                                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium flex items-center gap-2 transition-colors border-t border-slate-100 dark:border-neutral-800"
                                    >
                                      <Trash2 size={16} />
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
                    <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      Nenhum cliente encontrado para "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody >
            </table >
          </div >
          {/* ✅ Paginação Desktop */}
          <div className="px-6 py-3 border-t border-slate-100 dark:border-neutral-800 bg-white dark:bg-surface-dark rounded-b-xl">
            <PaginationControls />
          </div>
        </div >

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col gap-4">
          {paginatedClients.length > 0 ? (
            paginatedClients.map((client) => (
              <div key={client.id} className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {client.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{client.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Desde {new Date(client.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/clients/${client.id}/edit`} className="w-11 h-11 flex items-center justify-center bg-slate-50 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors">
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(client.id, client.name)}
                      className="w-11 h-11 flex items-center justify-center bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      title="Excluir Cliente"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-neutral-800">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">CPF</p>
                    <p className="text-sm font-mono text-slate-700 dark:text-slate-300">{client.cpf}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Telefone</p>
                    <p className="text-sm font-mono text-slate-700 dark:text-slate-300">{client.phone}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800 border-dashed p-8 text-center">
              <Search className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={32} />
              <p className="text-slate-500 dark:text-slate-400">Nenhum cliente encontrado</p>
            </div>
          )}
        </div>

        {/* ✅ Paginação Mobile */}
        {paginatedClients.length > 0 && (
          <div className="md:hidden bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800 p-4 shadow-sm">
            <PaginationControls />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          {/* Desktop Modal */}
          <div className="fixed inset-0 z-[100] hidden md:flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md transform overflow-hidden rounded-[32px] bg-white dark:bg-surface-dark p-8 text-center shadow-2xl transition-all border border-slate-100 dark:border-neutral-800 animate-in zoom-in-95 duration-300">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
                <Trash2 size={32} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">Excluir Cliente?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                Tem certeza que deseja excluir o cliente <span className="font-bold text-slate-900 dark:text-white">{clientToDelete?.name}</span> permanentemente?
                <br /><span className="text-red-500 font-medium">Esta ação não pode ser desfeita e falhará se o cliente possuir ordens vinculadas.</span>
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-2xl px-8 py-3.5 text-sm font-bold text-slate-500 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteClient}
                  disabled={isDeleting}
                  className="flex items-center gap-2 rounded-2xl bg-red-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-red-200 dark:shadow-none hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Sim, Excluir
                    </>
                  )}
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
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
                <Trash2 size={40} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Excluir Registro?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 px-4">
                Tem certeza que deseja excluir permanentemente o cliente <span className="font-bold text-slate-900 dark:text-white">{clientToDelete?.name}</span>?
                <br /><span className="text-red-500 font-medium">Esta ação não pode ser desfeita.</span>
              </p>
              
              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={confirmDeleteClient}
                  disabled={isDeleting}
                  className="w-full h-14 rounded-2xl bg-red-600 text-sm font-black text-white shadow-xl shadow-red-100 dark:shadow-none active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  {isDeleting ? "Excluindo..." : "Sim, Excluir Agora"}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full h-12 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </BottomSheet>
        </>
      )}

      {/* FAB Mobile removed */}
    </>
  );
};