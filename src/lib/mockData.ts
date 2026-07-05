import { AbsenteismoRow, HeadcountRow } from '../types';

export const MOCK_ABSENTEISMO: AbsenteismoRow[] = [
  // 2026
  { nome: "Ana Paula Silva", data: "2026-05-12", horas: 8.8, empresa: "Empresa Alpha", cidAtestado: "J11", descricaoCid: "Gripe não especificada", setor: "Produção", tipo: "atestado", sexo: "F" },
  { nome: "Bruno Medeiros", data: "2026-05-13", horas: 4.0, empresa: "Empresa Alpha", cidAtestado: "", descricaoCid: "", setor: "Logística", tipo: "atraso", sexo: "M" },
  { nome: "Carlos Eduardo", data: "2026-05-14", horas: 8.8, empresa: "Empresa Beta", cidAtestado: "", descricaoCid: "", setor: "Vendas", tipo: "falta", sexo: "M" },
  { nome: "Daniela Costa", data: "2026-04-10", horas: 17.6, empresa: "Empresa Alpha", cidAtestado: "M54.5", descricaoCid: "Dor lombar baixa", setor: "Administrativo", tipo: "atestado", sexo: "F" },
  { nome: "Eduardo Santos", data: "2026-04-15", horas: 2.5, empresa: "Empresa Beta", cidAtestado: "", descricaoCid: "", setor: "TI", tipo: "atraso", sexo: "M" },
  { nome: "Fernanda Lima", data: "2026-03-22", horas: 8.8, empresa: "Empresa Gamma", cidAtestado: "", descricaoCid: "", setor: "Produção", tipo: "falta", sexo: "F" },
  { nome: "Gabriel Oliveira", data: "2026-03-23", horas: 8.8, empresa: "Empresa Gamma", cidAtestado: "K29", descricaoCid: "Gastrite e duodenite", setor: "Produção", tipo: "atestado", sexo: "M" },
  { nome: "Helena Rodrigues", data: "2026-02-05", horas: 1.5, empresa: "Empresa Alpha", cidAtestado: "", descricaoCid: "", setor: "RH", tipo: "atraso", sexo: "F" },
  { nome: "Igor Gomes", data: "2026-02-18", horas: 8.8, empresa: "Empresa Beta", cidAtestado: "", descricaoCid: "", setor: "Logística", tipo: "falta", sexo: "M" },
  { nome: "Juliana Santos", data: "2026-01-20", horas: 26.4, empresa: "Empresa Alpha", cidAtestado: "H10.9", descricaoCid: "Conjuntivite aguda", setor: "Administrativo", tipo: "atestado", sexo: "F" },

  // 2025
  { nome: "Kleber Andrade", data: "2025-11-10", horas: 8.8, empresa: "Empresa Beta", cidAtestado: "J06.9", descricaoCid: "Infeccao aguda vias aereas", setor: "Produção", tipo: "atestado", sexo: "M" },
  { nome: "Larissa Melo", data: "2025-10-05", horas: 3.2, empresa: "Empresa Alpha", cidAtestado: "", descricaoCid: "", setor: "TI", tipo: "atraso", sexo: "F" },
  { nome: "Maurício Souza", data: "2025-09-15", horas: 8.8, empresa: "Empresa Gamma", cidAtestado: "", descricaoCid: "", setor: "Logística", tipo: "falta", sexo: "M" },
  { nome: "Nívea Maria", data: "2025-08-20", horas: 8.8, empresa: "Empresa Alpha", cidAtestado: "M54.5", descricaoCid: "Dor lombar baixa", setor: "Produção", tipo: "atestado", sexo: "F" },
  { nome: "Otávio Neto", data: "2025-07-14", horas: 8.8, empresa: "Empresa Beta", cidAtestado: "", descricaoCid: "", setor: "Vendas", tipo: "falta", sexo: "M" },
  { nome: "Patrícia Alves", data: "2025-06-18", horas: 2.0, empresa: "Empresa Gamma", cidAtestado: "", descricaoCid: "", setor: "Administrativo", tipo: "atraso", sexo: "F" },
  { nome: "Rodrigo Faro", data: "2025-05-10", horas: 17.6, empresa: "Empresa Alpha", cidAtestado: "S93.4", descricaoCid: "Entorse do tornozelo", setor: "TI", tipo: "atestado", sexo: "M" },
  { nome: "Sabrina Sato", data: "2025-04-12", horas: 8.8, empresa: "Empresa Beta", cidAtestado: "", descricaoCid: "", setor: "RH", tipo: "falta", sexo: "F" },
  { nome: "Thiago Lacerda", data: "2025-03-08", horas: 4.5, empresa: "Empresa Gamma", cidAtestado: "", descricaoCid: "", setor: "Produção", tipo: "atraso", sexo: "M" },
  { nome: "Vanessa Camargo", data: "2025-02-14", horas: 8.8, empresa: "Empresa Alpha", cidAtestado: "J11", descricaoCid: "Gripe não especificada", setor: "Vendas", tipo: "atestado", sexo: "F" },

  // 2024
  { nome: "Ana Paula Silva", data: "2024-12-15", horas: 8.8, empresa: "Empresa Alpha", cidAtestado: "K29", descricaoCid: "Gastrite", setor: "Produção", tipo: "atestado", sexo: "F" },
  { nome: "Wellington Silva", data: "2024-11-22", horas: 8.8, empresa: "Empresa Beta", cidAtestado: "", descricaoCid: "", setor: "Logística", tipo: "falta", sexo: "M" },
  { nome: "Yara Ramos", data: "2024-10-18", horas: 1.0, empresa: "Empresa Alpha", cidAtestado: "", descricaoCid: "", setor: "Administrativo", tipo: "atraso", sexo: "F" },
  { nome: "Zeca Pagodinho", data: "2024-09-05", horas: 8.8, empresa: "Empresa Gamma", cidAtestado: "H10", descricaoCid: "Conjuntivite", setor: "Produção", tipo: "atestado", sexo: "M" },
  { nome: "Bruno Medeiros", data: "2024-08-11", horas: 5.0, empresa: "Empresa Alpha", cidAtestado: "", descricaoCid: "", setor: "Logística", tipo: "atraso", sexo: "M" },
  { nome: "Carlos Eduardo", data: "2024-07-29", horas: 8.8, empresa: "Empresa Beta", cidAtestado: "", descricaoCid: "", setor: "Vendas", tipo: "falta", sexo: "M" },
  { nome: "Daniela Costa", data: "2024-06-14", horas: 17.6, empresa: "Empresa Alpha", cidAtestado: "M54", descricaoCid: "Dorsalgia", setor: "Administrativo", tipo: "atestado", sexo: "F" },
  { nome: "Eduardo Santos", data: "2024-05-02", horas: 2.2, empresa: "Empresa Beta", cidAtestado: "", descricaoCid: "", setor: "TI", tipo: "atraso", sexo: "M" },
  { nome: "Fernanda Lima", data: "2024-04-12", horas: 8.8, empresa: "Empresa Gamma", cidAtestado: "", descricaoCid: "", setor: "Produção", tipo: "falta", sexo: "F" },
  { nome: "Gabriel Oliveira", data: "2024-03-10", horas: 8.8, empresa: "Empresa Gamma", cidAtestado: "K29", descricaoCid: "Gastrite", setor: "Produção", tipo: "atestado", sexo: "M" },

  // Older years for filter validation (2015-2023)
  { nome: "Marcos Frota", data: "2023-06-15", horas: 8.8, empresa: "Empresa Alpha", cidAtestado: "J11", descricaoCid: "Gripe", setor: "Produção", tipo: "atestado", sexo: "M" },
  { nome: "Cláudia Raia", data: "2022-04-10", horas: 8.8, empresa: "Empresa Beta", cidAtestado: "", descricaoCid: "", setor: "Vendas", tipo: "falta", sexo: "F" },
  { nome: "Tony Ramos", data: "2020-10-05", horas: 17.6, empresa: "Empresa Gamma", cidAtestado: "M54.5", descricaoCid: "Dor lombar", setor: "Produção", tipo: "atestado", sexo: "M" },
  { nome: "Glória Pires", data: "2018-12-01", horas: 3.5, empresa: "Empresa Alpha", cidAtestado: "", descricaoCid: "", setor: "RH", tipo: "atraso", sexo: "F" },
  { nome: "Zezé Polessa", data: "2015-05-15", horas: 8.8, empresa: "Empresa Beta", cidAtestado: "Z76.5", descricaoCid: "Pessoa fingindo doenca", setor: "Administrativo", tipo: "atestado", sexo: "F" }
];

export const MOCK_HEADCOUNT: HeadcountRow[] = [
  // Competencies represent first day of each month for 2015-2026
  // We populate realistic amounts ranging between 120 and 160 employees.
  { competencia: "01/01/2015", quantidade: 110 },
  { competencia: "01/05/2015", quantidade: 115 },
  { competencia: "01/12/2018", quantidade: 120 },
  { competencia: "01/10/2020", quantidade: 130 },
  { competencia: "01/04/2022", quantidade: 135 },
  { competencia: "01/06/2023", quantidade: 140 },

  // 2024
  { competencia: "01/01/2024", quantidade: 142 },
  { competencia: "01/02/2024", quantidade: 142 },
  { competencia: "01/03/2024", quantidade: 145 },
  { competencia: "01/04/2024", quantidade: 145 },
  { competencia: "01/05/2024", quantidade: 148 },
  { competencia: "01/06/2024", quantidade: 148 },
  { competencia: "01/07/2024", quantidade: 150 },
  { competencia: "01/08/2024", quantidade: 150 },
  { competencia: "01/09/2024", quantidade: 152 },
  { competencia: "01/10/2024", quantidade: 152 },
  { competencia: "01/11/2024", quantidade: 155 },
  { competencia: "01/12/2024", quantidade: 155 },

  // 2025
  { competencia: "01/01/2025", quantidade: 155 },
  { competencia: "01/02/2025", quantidade: 154 },
  { competencia: "01/03/2025", quantidade: 156 },
  { competencia: "01/04/2025", quantidade: 156 },
  { competencia: "01/05/2025", quantidade: 158 },
  { competencia: "01/06/2025", quantidade: 158 },
  { competencia: "01/07/2025", quantidade: 160 },
  { competencia: "01/08/2025", quantidade: 160 },
  { competencia: "01/09/2025", quantidade: 162 },
  { competencia: "01/10/2025", quantidade: 162 },
  { competencia: "01/11/2025", quantidade: 165 },
  { competencia: "01/12/2025", quantidade: 165 },

  // 2026
  { competencia: "01/01/2026", quantidade: 165 },
  { competencia: "01/02/2026", quantidade: 163 },
  { competencia: "01/03/2026", quantidade: 164 },
  { competencia: "01/04/2026", quantidade: 164 },
  { competencia: "01/05/2026", quantidade: 168 },
  { competencia: "01/06/2026", quantidade: 168 },
  { competencia: "01/07/2026", quantidade: 170 },
  { competencia: "01/08/2026", quantidade: 170 },
  { competencia: "01/09/2026", quantidade: 172 },
  { competencia: "01/10/2026", quantidade: 172 },
  { competencia: "01/11/2026", quantidade: 175 },
  { competencia: "01/12/2026", quantidade: 175 }
];
