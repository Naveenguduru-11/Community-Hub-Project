import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/api';
import { Database, Server, RefreshCw, Search, FileJson, CheckCircle2, Layers, HardDrive, Shield } from 'lucide-react';

export const DatabaseExplorerPage = () => {
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCollection, setActiveCollection] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDatabaseDump = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getDatabaseExplorer();
      setDbData(res.data);
    } catch (err) {
      console.error('Failed to fetch database dump:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseDump();
  }, []);

  const collectionsList = dbData?.collections ? Object.keys(dbData.collections) : [
    'users', 'villas', 'communities', 'visitors', 'complaints', 'notices', 'payments', 'events'
  ];

  const currentCollectionData = dbData?.collections?.[activeCollection]?.documents || [];

  const filteredDocuments = currentCollectionData.filter(doc => {
    if (!searchTerm) return true;
    const str = JSON.stringify(doc).toLowerCase();
    return str.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold mb-2 border border-emerald-500/30">
            <Server className="w-3.5 h-3.5" />
            <span>MongoDB & Data Store Inspector</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            <Database className="w-7 h-7 text-blue-400" />
            <span>Database Explorer</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Live inspection of all MongoDB collections, document structures, object IDs, and records across CommunityHub.
          </p>
        </div>

        <button
          onClick={fetchDatabaseDump}
          disabled={loading}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Fetching DB...' : 'Refresh Database Dump'}</span>
        </button>
      </div>

      {/* Database Connection Info Box */}
      {dbData?.dbInfo && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><Database className="w-5 h-5" /></div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Database Name</span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{dbData.dbInfo.databaseName}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="w-5 h-5" /></div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Connection State</span>
              <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                {dbData.dbInfo.connectionState}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500"><HardDrive className="w-5 h-5" /></div>
            <div className="truncate">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Target URI</span>
              <span className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate block">
                {dbData.dbInfo.connectionUri}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Collection Navigation Tabs */}
      <div className="bg-slate-900 p-2 rounded-2xl border border-slate-800 overflow-x-auto flex items-center gap-1">
        {collectionsList.map(col => {
          const count = dbData?.collections?.[col]?.count || 0;
          const isActive = activeCollection === col;
          return (
            <button
              key={col}
              onClick={() => { setActiveCollection(col); setSearchTerm(''); }}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>db.{col}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Filter documents in db.${activeCollection}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="text-xs font-mono text-slate-500 font-semibold">
          Showing {filteredDocuments.length} of {currentCollectionData.length} records in <strong className="text-blue-500">db.{activeCollection}</strong>
        </div>
      </div>

      {/* Document Inspector Cards / JSON View */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
            <FileJson className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">No documents found in db.{activeCollection}</h3>
            <p className="text-xs text-slate-400">Add data using the application screens or clear search filters to inspect existing records.</p>
          </div>
        ) : (
          filteredDocuments.map((doc, idx) => (
            <div key={doc._id || idx} className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
              <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between font-mono text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">Document #{idx + 1}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-purple-400">_id: "{doc._id || doc.id}"</span>
                </div>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">JSON Format</span>
              </div>

              <div className="p-4 overflow-x-auto">
                <pre className="font-mono text-xs text-emerald-400 leading-relaxed">
                  {JSON.stringify(doc, null, 2)}
                </pre>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
