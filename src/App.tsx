import { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { 
  googleSignIn, 
  initAuth, 
  logout, 
  getAccessToken 
} from './lib/firebase';
import { 
  fetchAbsenteismoData, 
  fetchHeadcountData 
} from './lib/sheets';
import { MOCK_ABSENTEISMO, MOCK_HEADCOUNT } from './lib/mockData';
import { AbsenteismoRow, HeadcountRow, DashboardFilters } from './types';
import { Filters } from './components/Filters';
import { KpiCards } from './components/KpiCards';
import { SectorPieChart } from './components/Charts';
import { Tables } from './components/Tables';
import { 
  Database, 
  Sparkles, 
  LogOut, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  FileSpreadsheet, 
  ExternalLink,
  Lock,
  Share2
} from 'lucide-react';

const INITIAL_FILTERS: DashboardFilters = {
  anos: [],
  meses: [],
  setores: [],
  sexos: [],
  empresas: [],
  tipos: [],
  searchNome: '',
};

export default function App() {
  // Mode/State
  const [dataSource, setDataSource] = useState<'demo' | 'sheets'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('sheetId') || params.get('id') || params.get('fatoAbsId')) {
        return 'sheets';
      }
    }
    const saved = localStorage.getItem('abs_dashboard_mode');
    return (saved as 'demo' | 'sheets') || 'demo';
  });
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Spreadsheet Settings
  const [fatoAbsId, setFatoAbsId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get('sheetId') || params.get('id') || params.get('fatoAbsId');
      if (urlId) return urlId;
    }
    return localStorage.getItem('abs_dashboard_fato_abs_id') || '';
  });
  const [dimNfcId, setDimNfcId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get('headcountId') || params.get('dimNfcId');
      if (urlId) return urlId;
    }
    return localStorage.getItem('abs_dashboard_dim_nfc_id') || '';
  });
  const [useSameSpreadsheet, setUseSameSpreadsheet] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlSame = params.get('sameSheet');
      if (urlSame !== null) return urlSame === 'true';
    }
    const saved = localStorage.getItem('abs_dashboard_use_same_sheet');
    return saved === null ? true : saved === 'true';
  });
  const [dimNfcTabName, setDimNfcTabName] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tabName') || params.get('dimNfcTabName');
      if (urlTab) return urlTab;
    }
    return localStorage.getItem('abs_dashboard_dim_nfc_tab') || 'dim_NºFunc';
  });

  // Loaded Sheets Data
  const [absRows, setAbsRows] = useState<AbsenteismoRow[]>([]);
  const [headcountRows, setHeadcountRows] = useState<HeadcountRow[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Current Active Filters
  const [filters, setFilters] = useState<DashboardFilters>(INITIAL_FILTERS);

  // --- OAUTH / FIREBASE AUTH INITIALIZATION ---
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setNeedsAuth(false);
        setAuthLoading(false);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Save Settings to LocalStorage when changed
  useEffect(() => {
    localStorage.setItem('abs_dashboard_fato_abs_id', fatoAbsId);
    localStorage.setItem('abs_dashboard_dim_nfc_id', dimNfcId);
    localStorage.setItem('abs_dashboard_use_same_sheet', String(useSameSpreadsheet));
    localStorage.setItem('abs_dashboard_dim_nfc_tab', dimNfcTabName);
    localStorage.setItem('abs_dashboard_mode', dataSource);
  }, [fatoAbsId, dimNfcId, useSameSpreadsheet, dimNfcTabName, dataSource]);

  // --- ACTIONS ---
  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        setNeedsAuth(false);
        setSuccessMsg('Autenticação realizada com sucesso!');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      console.error(err);
      setError('Falha na autenticação do Google. Certifique-se de autorizar os escopos solicitados.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
      setAbsRows([]);
      setHeadcountRows([]);
      setDataSource('demo');
      setSuccessMsg('Desconectado com sucesso.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFetchData = async () => {
    if (!fatoAbsId.trim()) {
      setError('Insira o ID ou URL da planilha Fato_abs.');
      return;
    }
    if (!useSameSpreadsheet && !dimNfcId.trim()) {
      setError('Insira o ID ou URL da planilha dim_NºFunc.');
      return;
    }

    setDataLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Fetch absenteeism data
      const fetchedAbs = await fetchAbsenteismoData(fatoAbsId, accessToken);
      
      // 2. Fetch headcount data
      const headcountSpreadsheetId = useSameSpreadsheet ? fatoAbsId : dimNfcId;
      const fetchedHeadcount = await fetchHeadcountData(headcountSpreadsheetId, accessToken, dimNfcTabName);

      setAbsRows(fetchedAbs);
      setHeadcountRows(fetchedHeadcount);
      setSuccessMsg(`Dados carregados! Foram encontradas ${fetchedAbs.length} ocorrências de absenteísmo.`);
      
      // Switch mode to sheets once data is successfully fetched
      setDataSource('sheets');
      
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao carregar os dados. Verifique se a planilha está compartilhada publicamente como "Qualquer pessoa com o link pode ler" ou se você precisa fazer login com o Google.');
    } finally {
      setDataLoading(false);
    }
  };

  // Auto-fetch data if sheetId is available and we are in sheets mode
  useEffect(() => {
    if (!authLoading && fatoAbsId && dataSource === 'sheets' && !initialLoadDone) {
      setInitialLoadDone(true);
      handleFetchData();
    }
  }, [authLoading, accessToken, fatoAbsId, dataSource, initialLoadDone]);

  // Copy shareable link to clipboard
  const handleCopyShareLink = () => {
    if (!fatoAbsId) {
      setError('Insira o ID de uma planilha antes de gerar o link de compartilhamento.');
      return;
    }
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    
    // Extract clean sheet IDs to keep URL short
    const cleanFatoId = fatoAbsId.includes('/d/') ? fatoAbsId.split('/d/')[1].split('/')[0] : fatoAbsId;
    params.set('sheetId', cleanFatoId);
    
    if (!useSameSpreadsheet && dimNfcId) {
      const cleanDimId = dimNfcId.includes('/d/') ? dimNfcId.split('/d/')[1].split('/')[0] : dimNfcId;
      params.set('headcountId', cleanDimId);
    }
    if (dimNfcTabName && dimNfcTabName !== 'dim_NºFunc') {
      params.set('tabName', dimNfcTabName);
    }
    if (!useSameSpreadsheet) {
      params.set('sameSheet', 'false');
    }
    
    const shareUrl = `${baseUrl}?${params.toString()}`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setSuccessMsg('Link de compartilhamento copiado! Qualquer pessoa com este link verá seu dashboard em tempo real (certifique-se de que a planilha está compartilhada no Drive como "Qualquer pessoa com o link pode ler").');
        setTimeout(() => setSuccessMsg(null), 8000);
      })
      .catch((err) => {
        console.error('Falha ao copiar link:', err);
        setError(`Não foi possível copiar o link automaticamente. Copie manualmente esta URL: ${shareUrl}`);
      });
  };

  // --- DYNAMIC OPTION LISTS FOR FILTERS ---
  const availableOptions = useMemo(() => {
    const data = dataSource === 'demo' ? MOCK_ABSENTEISMO : absRows;
    
    const anosSet = new Set<number>();
    const setoresSet = new Set<string>();
    const sexosSet = new Set<string>();
    const empresasSet = new Set<string>();
    const tiposSet = new Set<string>();

    data.forEach((row) => {
      if (row.data) {
        const year = parseInt(row.data.split('-')[0]);
        if (!isNaN(year) && year >= 2015) {
          anosSet.add(year);
        }
      }
      if (row.setor) setoresSet.add(row.setor);
      if (row.sexo) sexosSet.add(row.sexo);
      if (row.empresa) empresasSet.add(row.empresa);
      if (row.tipo) tiposSet.add(row.tipo);
    });

    const anos = Array.from(anosSet).sort((a, b) => b - a); // Newer years first
    const setores = Array.from(setoresSet).sort();
    const sexos = Array.from(sexosSet).sort();
    const empresas = Array.from(empresasSet).sort();
    const tipos = Array.from(tiposSet).sort();

    return { anos, setores, sexos, empresas, tipos };
  }, [dataSource, absRows]);

  // --- DATA FILTERING LOGIC ---
  const filteredData = useMemo(() => {
    const data = dataSource === 'demo' ? MOCK_ABSENTEISMO : absRows;

    return data.filter((row) => {
      // Year filter
      let yearMatches = true;
      if (filters.anos.length > 0) {
        const y = parseInt(row.data.split('-')[0]);
        yearMatches = filters.anos.includes(y);
      }

      // Month filter
      let monthMatches = true;
      if (filters.meses.length > 0) {
        const m = parseInt(row.data.split('-')[1]);
        monthMatches = filters.meses.includes(m);
      }

      // Sector filter
      const sectorMatches = filters.setores.length === 0 || filters.setores.includes(row.setor);

      // Gender filter
      const genderMatches = filters.sexos.length === 0 || filters.sexos.includes(row.sexo);

      // Company filter
      const companyMatches = filters.empresas.length === 0 || filters.empresas.includes(row.empresa);

      // Type filter
      const typeMatches = filters.tipos.length === 0 || filters.tipos.includes(row.tipo);

      // Search Name filter
      let searchMatches = true;
      if (filters.searchNome && filters.searchNome.trim() !== '') {
        searchMatches = row.nome.toLowerCase().includes(filters.searchNome.toLowerCase().trim());
      }

      return (
        yearMatches &&
        monthMatches &&
        sectorMatches &&
        genderMatches &&
        companyMatches &&
        typeMatches &&
        searchMatches
      );
    });
  }, [dataSource, absRows, filters]);

  // Target Headcount list
  const headcountDataToUse = dataSource === 'demo' ? MOCK_HEADCOUNT : headcountRows;

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e2e8f0] flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-400">
      
      {/* HEADER SECTION */}
      <header className="bg-[#0a0a0b]/90 border-b border-[#262626] py-4 px-6 md:px-8 sticky top-0 z-40 shadow-md backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#171717] border border-[#262626] text-indigo-400 rounded-xl shadow-lg">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                Portal de Absenteísmo & Ausências
              </h1>
              <p className="text-xs text-[#737373] font-medium">
                Sincronizado diretamente com suas planilhas de Recursos Humanos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Toggle demo vs sheets */}
            <div className="bg-[#171717] rounded-xl p-1 flex items-center border border-[#262626]">
              <button
                id="toggle-demo-mode"
                onClick={() => setDataSource('demo')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  dataSource === 'demo'
                    ? 'bg-[#262626] text-indigo-400 shadow-sm font-bold'
                    : 'text-[#737373] hover:text-[#a3a3a3]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Dados Demonstrativos
              </button>
              <button
                id="toggle-sheets-mode"
                onClick={() => {
                  setDataSource('sheets');
                  if (!user) setNeedsAuth(true);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  dataSource === 'sheets'
                    ? 'bg-[#262626] text-indigo-400 shadow-sm font-bold'
                    : 'text-[#737373] hover:text-[#a3a3a3]'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Google Sheets
              </button>
            </div>

            {user && (
              <button
                id="logout-btn"
                onClick={handleLogout}
                className="p-2 text-[#737373] hover:text-rose-400 hover:bg-rose-950/20 rounded-xl border border-transparent hover:border-rose-900/30 transition-all cursor-pointer"
                title="Desconectar do Google"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        
        {/* NOTIFICATION MESSAGES */}
        {error && (
          <div id="error-alert" className="bg-rose-950/20 border border-rose-900/30 text-rose-200 px-5 py-3.5 rounded-2xl flex items-start gap-3 shadow-lg animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block text-sm">Atenção</span>
              <span className="text-xs text-rose-300 font-medium">{error}</span>
            </div>
          </div>
        )}

        {successMsg && (
          <div id="success-alert" className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-200 px-5 py-3.5 rounded-2xl flex items-start gap-3 shadow-lg animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block text-sm">Sucesso</span>
              <span className="text-xs text-emerald-300 font-medium">{successMsg}</span>
            </div>
          </div>
        )}

        {/* GOOGLE SHEETS SETUP CONFIGURATION SECTION */}
        {(dataSource === 'sheets' || needsAuth) && (
          <div id="sheets-config-panel" className="bg-[#171717] border border-[#262626] rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#262626]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                  Configuração de Planilhas Google
                </h3>
                <p className="text-xs text-[#737373]">Preencha os IDs das planilhas para gerar o dashboard em tempo real</p>
              </div>

              {user ? (
                <div className="flex items-center gap-3 bg-indigo-950/40 border border-indigo-900/30 rounded-xl px-4 py-2 text-xs font-semibold text-indigo-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>Conectado como: {user.email} (Acesso Privado)</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-neutral-900 border border-[#262626] rounded-xl px-4 py-2 text-xs font-semibold text-neutral-400">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <span>Modo Público (Lendo planilhas sem login)</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-xs font-bold text-[#737373] uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  ID ou URL da Planilha Fato_abs <span className="text-rose-500">*</span>
                </label>
                <input
                  id="fato-abs-url-input"
                  type="text"
                  value={fatoAbsId}
                  onChange={(e) => setFatoAbsId(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-[#262626] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white placeholder-neutral-600"
                />
                <span className="text-[10px] text-[#737373] mt-1 block">
                  Deve conter a aba <span className="font-semibold">abs</span> com as ocorrências de absenteísmo. 
                  {!user && (
                    <span className="text-amber-500"> Compartilhe como &quot;Qualquer pessoa com o link pode ler&quot; para carregar sem login.</span>
                  )}
                </span>
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-bold text-[#737373] uppercase tracking-wide mb-1.5">
                    Nome da Aba do Headcount
                  </label>
                  <input
                    id="headcount-tab-name-input"
                    type="text"
                    value={dimNfcTabName}
                    onChange={(e) => setDimNfcTabName(e.target.value)}
                    placeholder="dim_NºFunc"
                    className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-[#262626] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white placeholder-neutral-600"
                  />
                  <span className="text-[10px] text-[#737373] mt-1 block">
                    A aba que contém a quantidade mensal de funcionários ativos (Ex: dim_NºFunc).
                  </span>
                </div>
              </div>

              <div className="md:col-span-2 border-t border-[#262626] pt-4 mt-2">
                <div className="flex items-center gap-2 mb-4">
                  <input
                    id="use-same-sheet-checkbox"
                    type="checkbox"
                    checked={useSameSpreadsheet}
                    onChange={(e) => setUseSameSpreadsheet(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-indigo-500 border-[#262626] bg-[#0a0a0b] focus:ring-indigo-500"
                  />
                  <label htmlFor="use-same-sheet-checkbox" className="text-xs font-semibold text-[#a3a3a3]">
                    O headcount (aba {dimNfcTabName}) está no mesmo arquivo da planilha Fato_abs
                  </label>
                </div>

                {!useSameSpreadsheet && (
                  <div className="animate-fadeIn">
                    <label className="block text-xs font-bold text-[#737373] uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                      ID ou URL da Planilha de Headcount <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="dim-nfc-url-input"
                      type="text"
                      value={dimNfcId}
                      onChange={(e) => setDimNfcId(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-[#262626] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white placeholder-neutral-600"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#262626] pt-4 mt-4">
              <div className="flex flex-wrap items-center gap-3">
                {!user ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#737373] font-medium hidden md:inline">Planilha Privada?</span>
                    <button
                      id="google-login-btn"
                      onClick={handleGoogleLogin}
                      className="gsi-material-button cursor-pointer scale-90 origin-left"
                    >
                      <div className="gsi-material-button-state"></div>
                      <div className="gsi-material-button-content-wrapper">
                        <div className="gsi-material-button-icon">
                          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                          </svg>
                        </div>
                        <span className="gsi-material-button-contents text-xs font-semibold">Entrar c/ Google</span>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium bg-emerald-950/20 px-3 py-1.5 rounded-xl border border-emerald-900/20">
                    <Lock className="w-3.5 h-3.5" />
                    Autenticado via Google API
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 justify-end">
                <button
                  id="share-link-btn"
                  onClick={handleCopyShareLink}
                  disabled={!fatoAbsId}
                  className="flex items-center gap-1.5 border border-[#262626] hover:bg-[#262626] text-[#e5e5e5] px-4 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer"
                  title="Copiar link de compartilhamento para outras pessoas acessarem"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Compartilhar Link
                </button>

                <button
                  id="load-data-btn"
                  onClick={handleFetchData}
                  disabled={dataLoading || !fatoAbsId}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 shadow-md shadow-indigo-500/10 cursor-pointer"
                >
                  {dataLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Sincronizar Planilhas
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WATERMARK DEMO DATA BANNER */}
        {dataSource === 'demo' && (
          <div id="demo-banner" className="bg-gradient-to-r from-indigo-950 to-purple-950 border border-indigo-900/30 text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                Visualização de Demonstração
              </span>
              <h2 className="text-base font-bold mt-1">Você está visualizando dados fictícios!</h2>
              <p className="text-xs text-indigo-200 mt-1 max-w-xl">
                O painel está rodando com dados simulados realistas para demonstrar o potencial da ferramenta. Para utilizar suas planilhas de absenteísmo reais, mude a chave de dados no cabeçalho.
              </p>
            </div>
            <button
              id="connect-now-btn"
              onClick={() => {
                setDataSource('sheets');
                if (!user) setNeedsAuth(true);
              }}
              className="bg-[#171717] border border-[#262626] hover:bg-[#262626] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all self-start md:self-auto cursor-pointer"
            >
              Conectar Minha Planilha
            </button>
          </div>
        )}

        {/* FILTERS COMPONENT */}
        <Filters
          filters={filters}
          onChange={setFilters}
          availableOptions={availableOptions}
          onReset={handleResetFilters}
        />

        {/* KPI CARDS */}
        <KpiCards
          filteredData={filteredData}
          headcountData={headcountDataToUse}
          selectedYears={filters.anos}
          selectedMonths={filters.meses}
        />

        {/* CHART AND STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-full">
            <SectorPieChart filteredData={filteredData} />
          </div>
          <div className="lg:col-span-7 h-full">
            <div className="bg-[#171717] border border-[#262626] rounded-2xl p-6 shadow-lg flex flex-col justify-between h-full min-h-[520px]">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#262626] text-indigo-400 rounded-lg">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Diretrizes & Entendimentos de Negócio</h3>
                    <p className="text-xs text-[#737373]">Compreenda a metodologia e os cálculos de absenteísmo</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-[#a3a3a3]">
                  <div className="bg-[#0a0a0b]/80 p-3.5 border border-[#262626] rounded-xl">
                    <span className="font-bold text-white block mb-1">📅 Dias Úteis e Feriados</span>
                    Soma automática de todos os dias do período filtrado, descontando sábados, domingos e os feriados nacionais brasileiros (incluindo feriados móveis como Carnaval, Sexta-feira Santa e Corpus Christi).
                  </div>

                  <div className="bg-[#0a0a0b]/80 p-3.5 border border-[#262626] rounded-xl">
                    <span className="font-bold text-white block mb-1">👥 Cálculo de Headcount (Funcionários)</span>
                    A quantidade de funcionários é puxada de forma dinâmica a partir da planilha <span className="font-semibold text-indigo-400">{dimNfcTabName}</span> correspondente ao mês e ano selecionados. Ao filtrar múltiplos meses, o painel exibe a média ponderada do período.
                  </div>

                  <div className="bg-[#0a0a0b]/80 p-3.5 border border-[#262626] rounded-xl">
                    <span className="font-bold text-white block mb-1">💼 Horas Trabalhadas</span>
                    Calculado usando a fórmula padrão de mercado de Recursos Humanos:
                    <div className="font-mono text-[10px] bg-[#0a0a0b] text-emerald-400 border border-[#262626] p-2 rounded-lg mt-2 font-bold select-all">
                      (Funcionários × Dias Úteis × 8,8) − Total Ausências (Atestados + Faltas + Atrasos)
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 border-t border-[#262626] pt-4 mt-4">
                <a 
                  id="br-holidays-ref"
                  href="https://www.planalto.gov.br/ccivil_03/leis/l0662.htm" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  Feriados Nacionais (Lei 662/49) <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* DATA TABLES (Colaboradores and Individual occurrences) */}
        <Tables filteredData={filteredData} />

      </main>

      {/* FOOTER */}
      <footer className="bg-[#0a0a0b] border-t border-[#262626] py-6 mt-12 text-center text-xs text-[#737373] font-medium">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <span>© 2026 Dashboard de Absenteísmo. Todos os direitos reservados.</span>
          <span className="flex items-center gap-1 justify-center">
            Desenvolvido com integração em nuvem e segurança de dados de ponta.
          </span>
        </div>
      </footer>

    </div>
  );
}
