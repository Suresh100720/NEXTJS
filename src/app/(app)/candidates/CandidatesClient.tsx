'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import CandidateForm from '@/components/CandidateForm';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, RowSelectionOptions } from 'ag-grid-community';
import { deleteCandidate, deleteCandidates } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Download, Trash2, Edit2, User, MoreHorizontal, X } from 'lucide-react';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function CandidatesClient({ initialCandidates }: { initialCandidates: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState<any>(null);
  const [popoverData, setPopoverData] = useState<{ name: string, skills: string[], x: number, y: number } | null>(null);
  const [actionMenuData, setActionMenuData] = useState<{ candidate: any, x: number, y: number } | null>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const gridRef = useRef<any>(null);
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

  const onSelectionChanged = () => {
    const selected = gridRef.current?.api.getSelectedRows();
    setSelectedRows(selected || []);
  };

  const handleBulkDelete = async () => {
    const ids = selectedRows.map(r => r._id);
    if (confirm(`Are you sure you want to delete ${ids.length} candidates?`)) {
      try {
        await deleteCandidates(ids);
        router.refresh();
        setSelectedRows([]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete candidate "${name}"?`)) {
      try {
        await deleteCandidate(id);
        router.refresh();
        setActionMenuData(null);
      } catch (err) {
        console.error(err);
      }
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

  const getAvatarColor = (name: string) => {
    const colors = ['bg-[#319795]', 'bg-[#38A169]', 'bg-[#E53E3E]', 'bg-[#D69E2E]', 'bg-[#805AD5]', 'bg-[#3182CE]'];
    const index = name?.length % colors.length || 0;
    return colors[index];
  };

  // Column Definitions
  const columnDefs = useMemo(() => [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-3 h-full">
          <div className={`w-7 h-7 rounded-full ${getAvatarColor(params.value)} flex items-center justify-center text-white text-[10px] font-bold`}>
            {params.value?.charAt(0)}
          </div>
          <span className="font-bold text-slate-700">{params.value}</span>
        </div>
      )
    },
    { field: 'email', headerName: 'Email', flex: 1.2 },
    { field: 'role', headerName: 'Applied Role', flex: 1 },
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
      cellRenderer: (params: any) => (
        <Link href={`/candidates/${params.data._id}`} className="flex items-center justify-center h-full text-slate-400 hover:text-indigo-600 transition-colors">
          <User className="w-4 h-4" />
        </Link>
      )
    },
    {
      headerName: 'Actions',
      width: 80,
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
      <div className="flex justify-end items-center">
        <div className="flex items-center gap-3">
          {selectedRows.length > 0 && (
            <>
              <button
                onClick={exportCsv}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-sm font-bold text-red-600 hover:bg-red-100 transition-all shadow-sm"
              >
                <Trash2 className="w-4 h-4" /> Delete ({selectedRows.length})
              </button>
            </>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-indigo-600 rounded-xl font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            Add Candidate
          </button>
        </div>
      </div>

      <div className="w-full">
        <div className="ag-theme-alpine w-full">
          <AgGridReact
            ref={gridRef}
            rowData={initialCandidates}
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
    </div>
  );
}
