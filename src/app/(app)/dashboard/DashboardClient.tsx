'use client';

import { useState, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, RowSelectionOptions } from 'ag-grid-community';
import { X, Calendar, Users, LogOut, Download, Trash2 } from 'lucide-react';
import StatCards from '@/components/dashboard/StatCards';
import ApplicationsChart from '@/components/dashboard/ApplicationsChart';
import Acquisitions from '@/components/dashboard/Acquisitions';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { deleteCandidate } from '@/lib/api';
import { useRouter } from 'next/navigation';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function DashboardClient({ stats, jobs, candidates }: { stats: any, jobs: any[], candidates: any[] }) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedModalRows, setSelectedModalRows] = useState<any[]>([]);
  const modalGridRef = useRef<any>(null);
  const router = useRouter();

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

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete candidate "${name}"?`)) {
      try {
        await deleteCandidate(id);
        router.refresh();
        setActiveModal(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const exportCsv = () => {
    modalGridRef.current?.api.exportDataAsCsv();
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
      const dayCandidates = candidates.filter(c => new Date(c.createdAt).toDateString() === d.toDateString());
      last7Days.push({
        name: days[d.getDay()],
        apps: dayCandidates.length,
        short: dayCandidates.filter(c => c.status === 'Shortlisted').length,
        rej: dayCandidates.filter(c => c.status === 'Rejected').length
      });
    }
    return last7Days;
  }, [stats.weeklyStats, candidates]);

  const statCardsData = [
    { id: 'total', label: 'Total Applications', value: stats.totalCandidates || 0, data: candidates, color: 'text-blue-500' },
    { id: 'onhold', label: 'On Hold Candidates', value: stats.onHold || 0, data: candidates.filter(c => c.status === 'On Hold'), color: 'text-orange-500' },
    { id: 'shortlisted', label: 'Shortlisted Candidates', value: stats.shortlisted || 0, data: candidates.filter(c => c.status === 'Shortlisted'), color: 'text-indigo-500' },
    { id: 'rejected', label: 'Rejected Candidates', value: stats.rejected || 0, data: candidates.filter(c => c.status === 'Rejected'), color: 'text-red-500' },
  ];

  const acquisitionsData = useMemo(() => {
    const total = stats.totalCandidates || candidates.length || 0;
    const getPercent = (count: number) => total ? Math.round((count / total) * 100) : 0;
    const data = stats.acquisitions || {
      applications: 100,
      shortlisted: getPercent(stats.shortlisted || candidates.filter(c => c.status === 'Shortlisted').length),
      rejected: getPercent(stats.rejected || candidates.filter(c => c.status === 'Rejected').length),
      onHold: getPercent(stats.onHold || candidates.filter(c => c.status === 'On Hold').length),
      finalised: getPercent(stats.finalised || candidates.filter(c => c.status === 'Finalised').length),
    };
    return [
      { label: 'Applications', val: data.applications, color: 'bg-blue-500' },
      { label: 'Shortlisted', val: data.shortlisted, color: 'bg-amber-400' },
      { label: 'Rejected', val: data.rejected, color: 'bg-red-500' },
      { label: 'On Hold', val: data.onHold, color: 'bg-orange-400' },
      { label: 'Finalised', val: data.finalised, color: 'bg-emerald-500' },
    ];
  }, [stats, candidates]);

  const reminders = [
    { icon: <Calendar className="w-3 h-3 text-blue-500" />, text: "Interview schedule for today", time: "3:00 PM" },
    { icon: <Users className="w-3 h-3 text-amber-500" />, text: `${stats.onHold || 0} candidates on hold`, time: "Check now" },
    { icon: <LogOut className="w-3 h-3 text-red-500" />, text: `New rejections: ${stats.rejected || 0}`, time: "View list" },
  ];

  const currentModalData = useMemo(() => {
    return statCardsData.find(c => c.id === activeModal);
  }, [activeModal, statCardsData]);

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

      <DashboardSidebar stats={stats} recentJobs={stats.recentJobs || jobs.slice(0, 3)} reminders={reminders} />

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
    </div>
  );
}
