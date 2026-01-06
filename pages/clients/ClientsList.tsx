import React, { useState } from 'react';
import { useApp } from '../../store';
import {
  Search,
  Filter,
  Download,
  UserPlus,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { FloatingActionButton } from '../../components/FloatingActionButton';

export const ClientsList: React.FC = () => {
  const { clients } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleSearchOrders = (clientName: string) => {
    navigate(`/orders?search=${encodeURIComponent(clientName)}`);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpf.includes(searchTerm) ||
    client.phone.includes(searchTerm)
  );

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
        <div className="hidden md:block bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden animate-fade-in-up">
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
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
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

                            {activeMenu === client.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setActiveMenu(null)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-dark rounded-lg shadow-xl border border-slate-100 dark:border-neutral-800 z-20 py-1 animate-in fade-in zoom-in-95 duration-200">
                                  <button
                                    onClick={() => handleSearchOrders(client.name)}
                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 hover:text-primary font-medium flex items-center gap-2 transition-colors"
                                  >
                                    <FileText size={16} />
                                    Buscar Ordens
                                  </button>
                                </div>
                              </>
                            )}
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
        </div >

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col gap-4">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
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
                  <Link to={`/clients/${client.id}/edit`} className="p-2 bg-slate-50 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 rounded-lg">
                    <Edit size={18} />
                  </Link>
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
      </div>

      {/* FAB Mobile */}
      <FloatingActionButton to="/clients/new" label="Novo Cliente" />
    </>
  );
};