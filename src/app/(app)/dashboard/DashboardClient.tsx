'use client';

import { useState, useMemo, useRef, useOptimistic } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, RowSelectionOptions } from 'ag-grid-community';
import { X, Download, Trash2, AlertCircle } from 'lucide-react';
import StatCards from '@/components/dashboard/StatCards';
import ApplicationsChart from '@/components/dashboard/ApplicationsChart';
import Acquisitions from '@/components/dashboard/Acquisitions';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { deleteCandidateAction } from '@/lib/actions';
import { useRouter } from 'next/navigation';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function DashboardClient({ stats, jobs, candidates }: { stats: any, jobs: any[], candidates: any[] }) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedModalRows, setSelectedModalRows] = useState<any[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, name: string } | null>(null);
  const modalGridRef = useRef<any>(null);
  const router = useRouter();

  const [optimisticCandidates, addOptimisticCandidate] = useOptimistic(
    candidates,
    (state, { action, id }) => {
      if (action === 'delete') {
        return state.filter(c => (c._id || c.id) !== id);
      }
      return state;
    }
  );

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      addOptimisticCandidate({ action: 'delete', id: deleteConfirm.id });
      await deleteCandidateAction(deleteConfirm.id);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const exportCsv = () => {
    modalGridRef.current?.api.exportDataAsCsv();
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Shortlisted': return 'text-indigo-600 ';
      case 'Screening': return 'text-blue-600 ';
      case 'Finalised': return 'text-emerald-600 ';
      case 'On Hold': return 'text-orange-600 ';
      case 'Rejected': return 'text-red-600 ';
      default: return 'text-slate-600 ';
    }
  };

  const onSelectionChanged = () => {
    const selected = modalGridRef.current?.api.getSelectedRows();
    setSelectedModalRows(selected || []);
  };

  // Fallback calculation for Weekly Stats
  const barData = useMemo(() => {
    if (stats.weeklyStats && stats.weeklyStats.some((d: any) => d.apps > 0)) {
      return stats.weeklyStats;
    }
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayCandidates = optimisticCandidates.filter(c => new Date(c.createdAt).toDateString() === d.toDateString());
      last7Days.push({
        name: days[d.getDay()],
        apps: dayCandidates.length,
        short: dayCandidates.filter(c => c.status === 'Shortlisted').length,
        rej: dayCandidates.filter(c => c.status === 'Rejected').length
      });
    }
    return last7Days;
  }, [stats.weeklyStats, optimisticCandidates]);

  const statCardsData = useMemo(() => [
    { id: 'total', label: 'Total Applications', value: optimisticCandidates.length, data: optimisticCandidates, color: 'text-blue-500' },
    { id: 'onhold', label: 'On Hold Candidates', value: optimisticCandidates.filter(c => c.status === 'On Hold').length, data: optimisticCandidates.filter(c => c.status === 'On Hold'), color: 'text-orange-500' },
    { id: 'shortlisted', label: 'Shortlisted Candidates', value: optimisticCandidates.filter(c => c.status === 'Shortlisted').length, data: optimisticCandidates.filter(c => c.status === 'Shortlisted'), color: 'text-indigo-500' },
    { id: 'rejected', label: 'Rejected Candidates', value: optimisticCandidates.filter(c => c.status === 'Rejected').length, data: optimisticCandidates.filter(c => c.status === 'Rejected'), color: 'text-red-500' },
  ], [optimisticCandidates]);

  const acquisitionsData = useMemo(() => {
    const total = optimisticCandidates.length || 0;
    const getPercent = (count: number) => total ? Math.round((count / total) * 100) : 0;
    
    return [
      { label: 'Applications', val: 100, color: 'bg-blue-500' },
      { label: 'Shortlisted', val: getPercent(optimisticCandidates.filter(c => c.status === 'Shortlisted').length), color: 'bg-amber-400' },
      { label: 'Rejected', val: getPercent(optimisticCandidates.filter(c => c.status === 'Rejected').length), color: 'bg-red-500' },
      { label: 'On Hold', val: getPercent(optimisticCandidates.filter(c => c.status === 'On Hold').length), color: 'bg-orange-400' },
      { label: 'Finalised', val: getPercent(optimisticCandidates.filter(c => c.status === 'Finalised').length), color: 'bg-emerald-500' },
    ];
  }, [optimisticCandidates]);



  const currentModalData = useMemo(() => {
    return statCardsData.find(c => c.id === activeModal);
  }, [activeModal, statCardsData]);

  const getRowId = useMemo(() => (params: any) => params.data._id || params.data.id, []);

  const modalColumnDefs = useMemo(() => [
    { field: 'name', headerName: 'Name', flex: 1, cellClass: 'font-bold text-slate-700' },
    { field: 'email', headerName: 'Email', flex: 1.2 },
    { field: 'role', headerName: 'Role', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      cellRenderer: (params: any) => (
        <span className={`font-bold text-[11px] uppercase ${getStatusStyle(params.value)}`}>
          {params.value || 'Screening'}
        </span>
      )
    },
    {
      headerName: 'Actions',
      width: 80,
      cellRenderer: (params: any) => (
        <button
          onClick={() => handleDelete(params.data._id || params.data.id, params.data.name)}
          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ], []);

  const rowSelection = useMemo<RowSelectionOptions>(() => {
    return {
      mode: 'multiRow',
      headerCheckbox: true,
      checkboxes: true,
      enableClickSelection: false
    };
  }, []);

  return (
    <div className="flex gap-8">
      <div className="flex-1 space-y-8">
        <StatCards cards={statCardsData} onCardClick={(id) => {
          setActiveModal(id);
          setSelectedModalRows([]);
        }} />

        <div className="grid grid-cols-3 gap-8">
          <ApplicationsChart data={barData} />
          <Acquisitions data={acquisitionsData} />
        </div>
      </div>

      <DashboardSidebar totalCandidates={optimisticCandidates.length} recentJobs={stats.recentJobs || jobs.slice(0, 3)} />

      {/* Modal */}
      {activeModal && currentModalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-[40px] p-10 shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{currentModalData.label}</h2>
                <p className="text-slate-400 font-bold text-sm mt-1">Viewing all candidates in this category</p>
              </div>
              <div className="flex items-center gap-4">
                {selectedModalRows.length > 0 && (
                  <button
                    onClick={exportCsv}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all shadow-sm border border-indigo-100"
                  >
                    <Download className="w-4 h-4" /> Export CSV ({selectedModalRows.length})
                  </button>
                )}
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="w-full rounded-[24px] overflow-hidden border border-slate-100 shadow-sm">
              <div className="ag-theme-alpine w-full">
                <AgGridReact
                  ref={modalGridRef}
                  rowData={currentModalData.data}
                  columnDefs={modalColumnDefs as any}
                  domLayout='autoHeight'
                  pagination={true}
                  paginationPageSize={10}
                  paginationPageSizeSelector={[10, 20, 50]}
                  rowSelection={rowSelection}
                  onSelectionChanged={onSelectionChanged}
                  getRowId={getRowId}
                />
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-bold transition-all hover:bg-slate-800 active:scale-95 shadow-lg shadow-slate-200"
              >
                Close View
              </button>
            </div>
          </div>
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
                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Candidate?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Are you sure you want to delete &quot;{deleteConfirm.name}&quot;? This action cannot be undone.
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
