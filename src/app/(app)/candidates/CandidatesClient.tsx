'use client';

import { useState, useMemo, useEffect, useRef, useOptimistic } from 'react';
import Link from 'next/link';
import CandidateForm from '@/components/CandidateForm';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, RowSelectionOptions } from 'ag-grid-community';
import { deleteCandidateAction } from '@/lib/actions';
import { deleteCandidates } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { Download, Trash2, Edit2, User, MoreHorizontal, X, Search, ArrowRight, AlertCircle } from 'lucide-react';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function CandidatesClient({ initialCandidates }: { initialCandidates: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState<any>(null);
  const [popoverData, setPopoverData] = useState<{ name: string, skills: string[], x: number, y: number } | null>(null);
  const [actionMenuData, setActionMenuData] = useState<{ candidate: any, x: number, y: number } | null>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id?: string, name?: string, ids?: string[], type: 'single' | 'bulk' } | null>(null);
  const gridRef = useRef<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || 'All';
  const currentSearch = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(currentSearch);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput) {
      params.set('search', searchInput);
    } else {
      params.delete('search');
    }
    router.push(`/candidates?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    router.push(`/candidates?${params.toString()}`);
  };

  const handleFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === currentStatus || status === 'All') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    router.push(`/candidates?${params.toString()}`);
  };

  const clearFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('status');
    router.push(`/candidates?${params.toString()}`);
  };

  const filterOptions = ['Screening', 'Shortlisted', 'On Hold', 'Rejected', 'Finalised'];

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase() || '';
    switch (s) {
      case 'shortlisted': return 'text-indigo-600 ';
      case 'screening': return 'text-blue-600 ';
      case 'finalised': return 'text-emerald-600 ';
      case 'on hold': return 'text-orange-600 ';
      case 'rejected': return 'text-red-600 ';
      default: return 'text-slate-600 ';
    }
  };

  const onSelectionChanged = () => {
    const selected = gridRef.current?.api.getSelectedRows();
    setSelectedRows(selected || []);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirm({ id, name, type: 'single' });
    setActionMenuData(null);
  };

  const [optimisticCandidates, addOptimisticCandidate] = useOptimistic(
    initialCandidates,
    (state, { action, id }) => {
      if (action === 'delete') {
        return state.filter(c => c._id !== id);
      }
      return state;
    }
  );

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      if (deleteConfirm.type === 'single' && deleteConfirm.id) {
        addOptimisticCandidate({ action: 'delete', id: deleteConfirm.id });
        await deleteCandidateAction(deleteConfirm.id);
      } else if (deleteConfirm.type === 'bulk' && deleteConfirm.ids) {
        deleteConfirm.ids.forEach(id => addOptimisticCandidate({ action: 'delete', id }));
        await deleteCandidates(deleteConfirm.ids);
        setSelectedRows([]);
      }
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleEdit = (candidate: any) => {
    setCandidateToEdit(candidate);
    setIsModalOpen(true);
    setActionMenuData(null);
  };

  const exportCsv = () => {
    gridRef.current?.api.exportDataAsCsv();
  };

  // Column Definitions
  const columnDefs = useMemo(() => [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      cellRenderer: (params: any) => (
        <div className="flex items-center h-full">
          <span className="font-bold text-slate-700">{params.value}</span>
        </div>
      )
    },
    { field: 'email', headerName: 'Email', flex: 1.2 },
    { field: 'role', headerName: 'Applied Role', flex: 1 },
    {
      field: 'experience',
      headerName: 'Experience',
      width: 110,
      cellRenderer: (params: any) => (
        <span className="text-slate-600 font-medium">
          {params.value === 'Fresher' ? 'Fresher' : `${params.value || 'Fresher'} Yrs`}
        </span>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      cellRenderer: (params: any) => (
        <div className="flex items-center h-full">
          <span className={`font-bold text-[11px] uppercase ${getStatusStyle(params.value)}`}>
            {params.value || 'Screening'}
          </span>
        </div>
      )
    },
    {
      field: 'skills',
      headerName: 'Skills',
      flex: 1.2,
      valueFormatter: (params: any) => (params.value || []).join(', '),
      cellRenderer: (params: any) => {
        const skills = params.value || [];
        if (skills.length === 0) return <span className="text-slate-400 italic text-sm">None</span>;
        const displayLimit = 2;
        const visibleSkills = skills.slice(0, displayLimit).join(', ');
        const extraCount = skills.length - displayLimit;
        return (
          <div className="text-slate-700 text-sm flex items-center h-full">
            <span className="truncate">{visibleSkills}</span>
            {extraCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                  setPopoverData({ name: params.data.name, skills, x: rect.left, y: rect.top });
                  setActionMenuData(null);
                }}
                className="ml-2 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md font-bold text-xs hover:bg-blue-100"
              >
                +{extraCount}
              </button>
            )}
          </div>
        );
      }
    },
    {
      headerName: 'Profile',
      width: 80,
      pinned: 'right',
      cellRenderer: (params: any) => (
        <Link href={`/candidates/${params.data._id}`} className="flex items-center justify-center h-full text-slate-400 hover:text-indigo-600 transition-colors">
          <User className="w-4 h-4" />
        </Link>
      )
    },
    {
      headerName: 'Actions',
      width: 90,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              setActionMenuData({
                candidate: params.data,
                x: rect.left,
                y: rect.top
              });
              setPopoverData(null);
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: false,
  }), []);

  const rowSelection = useMemo<RowSelectionOptions>(() => {
    return {
      mode: 'multiRow',
      headerCheckbox: true,
      checkboxes: true,
      enableClickSelection: false
    };
  }, []);

  // Close popovers on click outside
  useEffect(() => {
    const handleClick = () => {
      setPopoverData(null);
      setActionMenuData(null);
    };
    if (popoverData || actionMenuData) {
      window.addEventListener('click', handleClick);
    }
    return () => window.removeEventListener('click', handleClick);
  }, [popoverData, actionMenuData]);

  const closeModal = () => {
    setIsModalOpen(false);
    setCandidateToEdit(null);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">

        {/* Left Side: Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {filterOptions.map(opt => (
            <button
              key={opt}
              onClick={() => handleFilter(opt)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${currentStatus === opt
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
            >
              {opt}
            </button>
          ))}
          {currentStatus !== 'All' && (
            <button
              onClick={clearFilter}
              className="px-3 py-2 rounded-xl text-sm font-bold whitespace-nowrap text-red-500 hover:bg-red-50 transition-all flex items-center gap-1 ml-1"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Right Side: Search and Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9 pr-2 py-1.5 bg-transparent text-sm font-bold text-slate-700 focus:outline-none w-32 lg:w-40 transition-all"
              />
            </div>
            {(!currentSearch || searchInput !== currentSearch) ? (
              <button onClick={handleSearch} className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all shadow-sm" title="Search">
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleClearSearch} className="p-1.5 bg-slate-200 text-slate-500 rounded-lg hover:bg-slate-300 transition-all shadow-sm" title="Cancel Search">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {selectedRows.length > 0 && (
            <>
              <button onClick={exportCsv} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm" title="Export CSV">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={() => setDeleteConfirm({ ids: selectedRows.map(r => r._id), type: 'bulk' })} className="p-2.5 bg-red-50 border border-red-100 rounded-xl text-red-600 hover:bg-red-100 transition-all shadow-sm" title={`Delete ${selectedRows.length} rows`}>
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-indigo-600 rounded-xl font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100 active:scale-95 whitespace-nowrap"
          >
            Add Candidate
          </button>
        </div>
      </div>

      <div className="w-full">
        <div className="ag-theme-alpine w-full">
          <AgGridReact
            ref={gridRef}
            rowData={optimisticCandidates}
            columnDefs={columnDefs as any}
            defaultColDef={defaultColDef}
            domLayout='autoHeight'
            rowSelection={rowSelection}
            onSelectionChanged={onSelectionChanged}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50]}
          />
        </div>
      </div>

      {isModalOpen && (
        <CandidateForm
          onClose={closeModal}
          candidateToEdit={candidateToEdit}
        />
      )}

      {/* Skills Floating Card */}
      {popoverData && (
        <div
          className="fixed z-[100] w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in duration-200"
          style={{ left: `${popoverData.x - 240}px`, top: `${popoverData.y + 25}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">All Skills</h4>
            <button onClick={() => setPopoverData(null)} className="text-slate-300 hover:text-slate-500">✕</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {popoverData.skills.map(s => (
              <span key={s} className="px-2 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs border border-slate-100 font-medium">{s}</span>
            ))}
          </div>
          <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45"></div>
        </div>
      )}

      {/* Action Menu Floating Card */}
      {actionMenuData && (
        <div
          className="fixed z-[100] w-40 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150"
          style={{ left: `${actionMenuData.x - 145}px`, top: `${actionMenuData.y + 35}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1.5 flex flex-col">
            <button
              onClick={() => handleEdit(actionMenuData.candidate)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors text-left"
            >
              <Edit2 className="w-4 h-4 text-blue-500" /> Edit Details
            </button>
            <button
              onClick={() => handleDelete(actionMenuData.candidate._id, actionMenuData.candidate.name)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
            >
              <Trash2 className="w-4 h-4" /> Delete Row
            </button>
          </div>
          <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45"></div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-[400px] bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {deleteConfirm.type === 'single' ? 'Delete Candidate?' : 'Delete Candidates?'}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {deleteConfirm.type === 'single' 
                    ? `Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`
                    : `Are you sure you want to delete ${deleteConfirm.ids?.length} candidates? This action cannot be undone.`
                  }
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
