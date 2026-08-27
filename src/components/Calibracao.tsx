/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Search, 
  FileText, 
  Calendar, 
  Award, 
  Printer, 
  TrendingUp, 
  AlertCircle,
  AlertTriangle,
  Activity,
  Maximize2,
  Sliders,
  ShieldCheck,
  Tag,
  Trash2,
  Pencil
} from 'lucide-react';
import { Documento, Equipamento, Calibracao, SectorType } from '../types';
import { useSectors } from '../hooks/useSectors';
import { SECTORS, getSectors, PersonalizacaoGeral } from '../utils/mockData';
import { useAuth } from '../contexts/AuthContext';
import { useModulePermission } from '../utils/permissionManager';
import { SystemSettingsRepository } from '../services/database/repositories/systemSettings.repository';
import { EquipmentRepository } from '../services/database/repositories/equipment.repository';

interface CalibracaoProps {
  documents: Documento[];
  onAddLog: (action: string, details: string, docId?: string) => void;
  personalizacao?: PersonalizacaoGeral;
  equipamentos: Equipamento[];
  setEquipamentos: React.Dispatch<React.SetStateAction<Equipamento[]>>;
}

// Dados iniciais de Equipamentos e Dispositivos de Medição (ISO 7.1.5)
export const INITIAL_EQUIPAMENTOS: Equipamento[] = [
  {
    id: 'eq-1',
    tag: 'CAL-EST-001',
    nome: 'Termômetro Infravermelho Laser do Flash Cure',
    fabricante: 'Fluke',
    modelo: '62 MAX+',
    numeroSerie: 'FLU-87452-C',
    setor: 'Estamparia',
    frequenciaCalibracao: 6, // 6 meses
    dataAquisicao: '2025-01-15',
    status: 'Calibrado',
    calibracoes: [
      {
        id: 'cal-1-1',
        equipamentoId: 'eq-1',
        dataCalibracao: '2026-01-10',
        proximaCalibracao: '2026-07-10',
        laboratorio: 'METROTEC — Metrologia e Calibração Industrial (RBC)',
        numeroCertificado: 'CERT-2026-8843',
        resultado: 'Aprovado',
        erroMaximoDetectado: '0.2 °C',
        incerteza: '±0.05 °C',
        status: 'Vigente'
      }
    ]
  },
  {
    id: 'eq-2',
    tag: 'BAL-EXP-002',
    nome: 'Balança de Controle de Lotes e Expedição 150kg',
    fabricante: 'Toledo Brasil',
    modelo: 'Prix 3 Fit',
    numeroSerie: 'TOL-998412-A',
    setor: 'Expedição',
    frequenciaCalibracao: 12, // 12 meses
    dataAquisicao: '2024-06-10',
    status: 'Calibrado',
    calibracoes: [
      {
        id: 'cal-2-1',
        equipamentoId: 'eq-2',
        dataCalibracao: '2025-10-15',
        proximaCalibracao: '2026-10-15',
        laboratorio: 'INMETRO — Órgão Delegado IPEM-SP',
        numeroCertificado: 'CERT-IPEM-44512',
        resultado: 'Aprovado',
        erroMaximoDetectado: '5g',
        incerteza: '±2g',
        status: 'Vigente'
      }
    ]
  },
  {
    id: 'eq-3',
    tag: 'TRE-COR-003',
    nome: 'Trena Metálica Plana de Precisão do Chão de Corte',
    fabricante: 'Lufkin',
    modelo: 'Pro Series 10m',
    numeroSerie: 'LUF-1124-E',
    setor: 'Corte',
    frequenciaCalibracao: 12, // 12 meses
    dataAquisicao: '2025-03-01',
    status: 'Calibração Pendente',
    calibracoes: [
      {
        id: 'cal-3-1',
        equipamentoId: 'eq-3',
        dataCalibracao: '2025-05-10',
        proximaCalibracao: '2026-05-10', // Vencida!
        laboratorio: 'Qualidade Vickytex (Calibração Interna Padrão RBC)',
        numeroCertificado: 'INT-LUF-001',
        resultado: 'Aprovado com Restrição',
        erroMaximoDetectado: '0.8mm',
        incerteza: '±0.1mm',
        status: 'Vencida'
      }
    ]
  },
  {
    id: 'eq-4',
    tag: 'MAN-COS-004',
    nome: 'Manômetro do Regulador Pneumático da Travete Automática',
    fabricante: 'Festo',
    modelo: 'MS4-LFR',
    numeroSerie: 'FES-774125',
    setor: 'Costura',
    frequenciaCalibracao: 12, // 12 meses
    dataAquisicao: '2025-08-20',
    status: 'Calibrado',
    calibracoes: [
      {
        id: 'cal-4-1',
        equipamentoId: 'eq-4',
        dataCalibracao: '2025-08-25',
        proximaCalibracao: '2026-08-25',
        laboratorio: 'SMC Metrologia S.A.',
        numeroCertificado: 'CERT-SMC-99823',
        resultado: 'Aprovado',
        erroMaximoDetectado: '0.05 bar',
        incerteza: '±0.01 bar',
        status: 'Vigente'
      }
    ]
  }
];

export const CalibracaoComponent: React.FC<CalibracaoProps> = ({ 
  documents, 
  onAddLog, 
  personalizacao,
  equipamentos,
  setEquipamentos
}) => {
  const { user } = useAuth();
  const {
    canCreate,
    canEdit,
    canDelete,
    canModifyItem,
    canDeleteItem
  } = useModulePermission('calibracao');
  const sectorsList = useSectors();
  const [activeTab, setActiveTab] = useState<'inventario' | 'certificados'>('inventario');

  const saveEquipamentos = (newEquips: Equipamento[]) => {
    setEquipamentos(newEquips);
  };

  const handleDeleteEquipamento = (id: string) => {
    const equip = equipamentos.find(eq => eq.id === id);
    if (equip) {
      setEquipToDelete(equip);
    }
  };

  const handleDeleteCalibracao = (equipId: string, calibId: string) => {
    const equip = equipamentos.find(eq => eq.id === equipId);
    const calib = equip?.calibracoes.find(c => c.id === calibId);
    if (equip && calib) {
      setCalibToDelete({
        equipId,
        calibId,
        certNum: calib.numeroCertificado
      });
    }
  };

  // Estados dos formulários e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('Todos');

  // Estados para edição
  const [editingEquip, setEditingEquip] = useState<Equipamento | null>(null);
  const [editingCalib, setEditingCalib] = useState<Calibracao | null>(null);
  const [equipToDelete, setEquipToDelete] = useState<Equipamento | null>(null);
  const [calibToDelete, setCalibToDelete] = useState<{ equipId: string; calibId: string; certNum: string } | null>(null);

  // Tipos de instrumentos dinâmicos
  const [instrumentTypes, setInstrumentTypes] = useState<string[]>([
    "Balança de Precisão",
    "Termômetro Digital",
    "Termômetro Infravermelho",
    "Paquímetro Analógico",
    "Trena Metálica",
    "Cronômetro Digital",
    "Durômetro",
    "Manômetro de Linha"
  ]);

  useEffect(() => {
    const unsub = SystemSettingsRepository.subscribe((records) => {
      const found = records.find(r => r.id === 'sgq_vickytex_calibracao_tipos');
      if (found && Array.isArray(found.items)) {
        setInstrumentTypes(found.items);
      }
    });
    return () => unsub();
  }, []);


  // Modal: Registrar Equipamento
  const [isEquipModalOpen, setIsEquipModalOpen] = useState(false);
  const [newEquip, setNewEquip] = useState({
    tag: '',
    nome: '',
    fabricante: '',
    modelo: '',
    numeroSerie: '',
    setor: 'Corte' as SectorType,
    frequenciaCalibracao: 12,
    dataAquisicao: new Date().toISOString().split('T')[0]
  });

  // Modal: Registrar Nova Calibração
  const [isCalibModalOpen, setIsCalibModalOpen] = useState(false);
  const [selectedEquipId, setSelectedEquipId] = useState<string>('');
  const [newCalib, setNewCalib] = useState({
    dataCalibracao: new Date().toISOString().split('T')[0],
    laboratorio: '',
    numeroCertificado: '',
    resultado: 'Aprovado' as 'Aprovado' | 'Aprovado com Restrição' | 'Reprovado',
    erroMaximoDetectado: '',
    incerteza: ''
  });

  // Visualização de Certificado
  const [selectedCert, setSelectedCert] = useState<{ equip: Equipamento; calib: Calibracao } | null>(null);

  const handlePrintCert = () => {
    if (!selectedCert) return;
    
    // Remover qualquer container de impressão anterior para evitar duplicidade
    const existing = document.querySelector('.print-container');
    if (existing) {
      existing.remove();
    }
    
    const printContainer = document.createElement('div');
    printContainer.className = 'print-container';
    
    const content = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
        .print-wrapper {
          font-family: 'Inter', sans-serif;
          padding: 40px;
          background-color: #fff;
          color: #0f172a;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .header-container {
          border: 1px solid #cbd5e1;
          padding: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .logo-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo {
          width: 40px;
          height: 40px;
          background-color: #2563eb;
          color: #ffffff;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          border-radius: 6px;
        }
        .company-name {
          font-size: 14px;
          font-weight: 800;
          margin: 0;
        }
        .company-sub {
          font-size: 10px;
          color: #64748b;
          margin: 0;
        }
        .header-ref {
          text-align: right;
        }
        .ref-code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          margin: 0;
          color: #0f172a;
        }
        .ref-sub {
          font-size: 9px;
          color: #94a3b8;
          margin: 2px 0 0 0;
        }
        .card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
          background: #ffffff;
        }
        .card-title {
          font-size: 12px;
          font-weight: 700;
          color: #2563eb;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 6px;
          margin-top: 0;
          margin-bottom: 12px;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
        }
        .grid-2 {
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 16px;
        }
        .grid-item-label {
          font-size: 9px;
          color: #64748b;
          margin: 0;
          text-transform: uppercase;
          font-weight: 600;
        }
        .grid-item-val {
          font-size: 12px;
          font-weight: 700;
          margin: 2px 0 0 0;
          color: #0f172a;
        }
        .mono {
          font-family: 'JetBrains Mono', monospace;
        }
        .result-container {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-top: 4px;
        }
        .result-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .badge-aprovado {
          background-color: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        .badge-restrito {
          background-color: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        }
        .badge-reprovado {
          background-color: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }
        .result-desc {
          font-size: 11px;
          color: #475569;
          margin: 0;
        }
        .footer-info {
          background-color: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 12px;
          font-size: 9px;
          color: #1e3a8a;
          text-align: center;
          line-height: 1.5;
          font-family: 'JetBrains Mono', monospace;
        }
      </style>
      <div class="print-wrapper">
        <div class="header-container">
          <div class="logo-title">
            <div class="logo">VI</div>
            <div>
              <h4 class="company-name">VICKYTEX</h4>
              <p class="company-sub">Controle Metrológico de Qualidade</p>
            </div>
          </div>
          <div class="header-ref">
            <h4 class="ref-code">${selectedCert.calib.numeroCertificado}</h4>
            <p class="ref-sub">Ref: ISO 9001:2015 Cláusula 7.1.5</p>
          </div>
        </div>
        
        <div class="card">
          <h3 class="card-title">Identificação do Instrumento / Dispositivo</h3>
          <div class="grid-2">
            <div>
              <p class="grid-item-label">TAG Industrial</p>
              <p class="grid-item-val mono">${selectedCert.equip.tag}</p>
            </div>
            <div>
              <p class="grid-item-label">Número de Série</p>
              <p class="grid-item-val mono">${selectedCert.equip.numeroSerie}</p>
            </div>
            <div>
              <p class="grid-item-label">Instrumento</p>
              <p class="grid-item-val">${selectedCert.equip.nome}</p>
            </div>
            <div>
              <p class="grid-item-label">Fabricante / Modelo</p>
              <p class="grid-item-val">${selectedCert.equip.fabricante} — ${selectedCert.equip.modelo}</p>
            </div>
            <div>
              <p class="grid-item-label">Setor Alocado</p>
              <p class="grid-item-val">${selectedCert.equip.setor}</p>
            </div>
            <div>
              <p class="grid-item-label">Frequência Recomendada</p>
              <p class="grid-item-val">${selectedCert.equip.frequenciaCalibracao} Meses</p>
            </div>
          </div>
        </div>
        
        <div class="card">
          <h3 class="card-title">Rastreabilidade e Resultados Técnicos</h3>
          <div class="grid-2">
            <div>
              <p class="grid-item-label">Data da Calibração</p>
              <p class="grid-item-val mono">${selectedCert.calib.dataCalibracao}</p>
            </div>
            <div>
              <p class="grid-item-label">Data de Expiração</p>
              <p class="grid-item-val mono">${selectedCert.calib.proximaCalibracao}</p>
            </div>
            <div style="grid-column: span 2;">
              <p class="grid-item-label">Laboratório Emissor</p>
              <p class="grid-item-val">${selectedCert.calib.laboratorio}</p>
            </div>
            <div>
              <p class="grid-item-label">Erro Máximo Encontrado</p>
              <p class="grid-item-val mono" style="color: #059669;">${selectedCert.calib.erroMaximoDetectado}</p>
            </div>
            <div>
              <p class="grid-item-label">Incerteza Expandida</p>
              <p class="grid-item-val mono">${selectedCert.calib.incerteza}</p>
            </div>
          </div>
        </div>
        
        <div class="card">
          <h3 class="card-title">Laudo de Conformidade do SGQ</h3>
          <div class="result-container">
            <span class="result-badge ${
              selectedCert.calib.resultado === 'Aprovado'
                ? 'badge-aprovado'
                : selectedCert.calib.resultado === 'Aprovado com Restrição'
                ? 'badge-restrito'
                : 'badge-reprovado'
            }">
              ${selectedCert.calib.resultado}
            </span>
            <div>
              <p class="result-desc" style="font-weight: 600; color: #0f172a;">
                Dispositivo considerado adequado para uso nos processos industriais da Vickytex.
              </p>
              <p class="result-desc">
                Adequado aos limites de tolerância de tolerabilidade e variância descritos nos POPs e Instruções de Trabalho da Vickytex.
              </p>
            </div>
          </div>
        </div>
        
        <div class="footer-info">
          Assinado digitalmente por ${user?.name ? `${user.name} (Gestor SGQ Vickytex)` : 'Gestão da Qualidade Vickytex'} via Google Auth SSO. Rastreável sob protocolo: REQUISITO-7-1-5-METROLOGIA-2026.
        </div>
      </div>
    `;
    
    printContainer.innerHTML = content;
    document.body.appendChild(printContainer);
    
    // Evento afterprint para garantir remoção segura do container apenas depois que a impressão é iniciada/fechada
    const handleAfterPrint = () => {
      if (document.body.contains(printContainer)) {
        document.body.removeChild(printContainer);
      }
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    
    // Fallback de segurança caso afterprint não dispare
    setTimeout(handleAfterPrint, 15000);
    
    setTimeout(() => {
      try {
        window.print();
      } catch (err) {
        console.error('Error triggering print:', err);
        handleAfterPrint();
      }
    }, 300);
  };

  const handleOpenNewEquip = () => {
    setEditingEquip(null);
    setNewEquip({
      tag: '',
      nome: '',
      fabricante: '',
      modelo: '',
      numeroSerie: '',
      setor: 'Corte',
      frequenciaCalibracao: 12,
      dataAquisicao: new Date().toISOString().split('T')[0]
    });
    setIsEquipModalOpen(true);
  };

  const handleOpenEditEquip = (eq: Equipamento) => {
    setEditingEquip(eq);
    setNewEquip({
      tag: eq.tag,
      nome: eq.nome,
      fabricante: eq.fabricante,
      modelo: eq.modelo,
      numeroSerie: eq.numeroSerie,
      setor: eq.setor,
      frequenciaCalibracao: eq.frequenciaCalibracao,
      dataAquisicao: eq.dataAquisicao
    });
    setIsEquipModalOpen(true);
  };

  const handleOpenNewCalib = (equipId: string) => {
    setEditingCalib(null);
    setSelectedEquipId(equipId);
    setNewCalib({
      dataCalibracao: new Date().toISOString().split('T')[0],
      laboratorio: '',
      numeroCertificado: '',
      resultado: 'Aprovado',
      erroMaximoDetectado: '',
      incerteza: ''
    });
    setIsCalibModalOpen(true);
  };

  const handleOpenEditCalib = (equip: Equipamento, cal: Calibracao) => {
    setEditingCalib(cal);
    setSelectedEquipId(equip.id);
    setNewCalib({
      dataCalibracao: cal.dataCalibracao,
      laboratorio: cal.laboratorio,
      numeroCertificado: cal.numeroCertificado,
      resultado: cal.resultado,
      erroMaximoDetectado: cal.erroMaximoDetectado,
      incerteza: cal.incerteza
    });
    setIsCalibModalOpen(true);
  };

  // Criar ou Editar Equipamento
  const handleCreateEquip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEquip.tag || !newEquip.nome || !newEquip.fabricante) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    if (editingEquip) {
      let updatedItem: Equipamento | null = null;
      const updated = equipamentos.map(eq => {
        if (eq.id === editingEquip.id) {
          updatedItem = {
            ...eq,
            tag: newEquip.tag.toUpperCase().trim(),
            nome: newEquip.nome.trim(),
            fabricante: newEquip.fabricante.trim(),
            modelo: newEquip.modelo.trim(),
            numeroSerie: newEquip.numeroSerie.trim(),
            setor: newEquip.setor,
            frequenciaCalibracao: Number(newEquip.frequenciaCalibracao),
            dataAquisicao: newEquip.dataAquisicao
          };
          return updatedItem;
        }
        return eq;
      });
      saveEquipamentos(updated);
      if (updatedItem) {
        EquipmentRepository.update((updatedItem as Equipamento).id, updatedItem).catch(e => console.error('Erro ao atualizar equipamento no Firestore:', e));
      }
      onAddLog('Editou Equipamento', `Atualizou informações do equipamento ${newEquip.tag.toUpperCase().trim()}.`);
    } else {
      const created: Equipamento = {
        id: `eq-${Date.now()}`,
        tag: newEquip.tag.toUpperCase().trim(),
        nome: newEquip.nome.trim(),
        fabricante: newEquip.fabricante.trim(),
        modelo: newEquip.modelo.trim(),
        numeroSerie: newEquip.numeroSerie.trim(),
        setor: newEquip.setor,
        frequenciaCalibracao: Number(newEquip.frequenciaCalibracao),
        dataAquisicao: newEquip.dataAquisicao,
        status: 'Calibração Pendente',
        calibracoes: []
      };

      const updated = [created, ...equipamentos];
      saveEquipamentos(updated);
      EquipmentRepository.create(created).catch(e => console.error('Erro ao criar equipamento no Firestore:', e));

      onAddLog(
        'Cadastro de Equipamento',
        `Registrado novo instrumento de medição ${created.tag} - ${created.nome} no setor ${created.setor}.`
      );
    }

    setIsEquipModalOpen(false);
    setEditingEquip(null);
    setNewEquip({
      tag: '',
      nome: '',
      fabricante: '',
      modelo: '',
      numeroSerie: '',
      setor: 'Corte',
      frequenciaCalibracao: 12,
      dataAquisicao: new Date().toISOString().split('T')[0]
    });
  };

  // Criar ou Editar Registro de Calibração
  const handleCreateCalib = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipId || !newCalib.laboratorio || !newCalib.numeroCertificado) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const equip = equipamentos.find(eq => eq.id === selectedEquipId);
    if (!equip) return;

    // Calcular data da próxima calibração
    const dateCal = new Date(newCalib.dataCalibracao + 'T12:00:00');
    dateCal.setMonth(dateCal.getMonth() + equip.frequenciaCalibracao);
    const nextCalDateStr = dateCal.toISOString().split('T')[0];

    const todayStr = new Date().toISOString().split('T')[0];
    const isVencida = nextCalDateStr < todayStr;

    if (editingCalib) {
      const updated = equipamentos.map(eq => {
        if (eq.id === selectedEquipId) {
          const updatedCalibs = eq.calibracoes.map(c => {
            if (c.id === editingCalib.id) {
              return {
                ...c,
                dataCalibracao: newCalib.dataCalibracao,
                proximaCalibracao: nextCalDateStr,
                laboratorio: newCalib.laboratorio.trim(),
                numeroCertificado: newCalib.numeroCertificado.toUpperCase().trim(),
                resultado: newCalib.resultado,
                erroMaximoDetectado: newCalib.erroMaximoDetectado.trim() || 'Desprezível',
                incerteza: newCalib.incerteza.trim() || 'Não declarada',
                status: isVencida ? 'Vencida' as const : 'Vigente' as const
              };
            }
            return c;
          });

          // Determinar status do equipamento a partir do certificado mais recente
          const principalCalib = updatedCalibs[0];
          const status: 'Calibrado' | 'Calibração Pendente' | 'Fora de Uso' = 
            !principalCalib 
              ? 'Calibração Pendente' 
              : principalCalib.resultado === 'Reprovado' 
              ? 'Fora de Uso' 
              : principalCalib.status === 'Vencida' 
              ? 'Calibração Pendente' 
              : 'Calibrado';

          return {
            ...eq,
            status,
            calibracoes: updatedCalibs
          };
        }
        return eq;
      });

      saveEquipamentos(updated);
      const targetEquip = updated.find(e => e.id === selectedEquipId);
      if (targetEquip) {
        EquipmentRepository.update(targetEquip.id, targetEquip).catch(e => console.error('Erro ao atualizar calibração no Firestore:', e));
      }

      onAddLog(
        'Editou Calibração',
        `Atualizou certificado de calibração ${newCalib.numeroCertificado.toUpperCase().trim()} para o equipamento ${equip.tag}.`
      );
    } else {
      const calib: Calibracao = {
        id: `cal-${Date.now()}`,
        equipamentoId: selectedEquipId,
        dataCalibracao: newCalib.dataCalibracao,
        proximaCalibracao: nextCalDateStr,
        laboratorio: newCalib.laboratorio.trim(),
        numeroCertificado: newCalib.numeroCertificado.toUpperCase().trim(),
        resultado: newCalib.resultado,
        erroMaximoDetectado: newCalib.erroMaximoDetectado.trim() || 'Desprezível',
        incerteza: newCalib.incerteza.trim() || 'Não declarada',
        status: isVencida ? 'Vencida' : 'Vigente'
      };

      const updated = equipamentos.map(eq => {
        if (eq.id === selectedEquipId) {
          // Atualiza a lista de calibrações de forma que a mais recente fique primeiro
          const updatedCalibs = [calib, ...eq.calibracoes];
          const status: 'Calibrado' | 'Calibração Pendente' | 'Fora de Uso' = 
            calib.resultado === 'Reprovado' 
              ? 'Fora de Uso' 
              : isVencida 
              ? 'Calibração Pendente' 
              : 'Calibrado';

          return {
            ...eq,
            status,
            calibracoes: updatedCalibs
          };
        }
        return eq;
      });

      saveEquipamentos(updated);
      const targetEquip = updated.find(e => e.id === selectedEquipId);
      if (targetEquip) {
        EquipmentRepository.update(targetEquip.id, targetEquip).catch(e => console.error('Erro ao registrar calibração no Firestore:', e));
      }

      onAddLog(
        'Homologação de Calibração',
        `Registrada calibração ${calib.numeroCertificado} para o equipamento ${equip.tag} com resultado: ${calib.resultado}.`
      );
    }

    setIsCalibModalOpen(false);
    setSelectedEquipId('');
    setEditingCalib(null);
    setNewCalib({
      dataCalibracao: new Date().toISOString().split('T')[0],
      laboratorio: '',
      numeroCertificado: '',
      resultado: 'Aprovado',
      erroMaximoDetectado: '',
      incerteza: ''
    });
  };

  // Filtragem
  const filteredEquipamentos = equipamentos.filter(eq => {
    const matchesSearch = eq.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          eq.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          eq.fabricante.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'Todos' || eq.setor === selectedSector;
    return matchesSearch && matchesSector;
  });

  // Métricas
  const totalEquips = equipamentos.length;
  const calibrados = equipamentos.filter(e => e.status === 'Calibrado').length;
  const pendentes = equipamentos.filter(e => e.status === 'Calibração Pendente').length;
  const foraDeUso = equipamentos.filter(e => e.status === 'Fora de Uso').length;

  const validPercent = totalEquips > 0 ? Math.round((calibrados / totalEquips) * 100) : 0;

  return (
    <div id="calibracao-container" className="space-y-6">

      {/* Banner de Conformidade ISO 7.1.5 */}
      <div id="calibracao-banner" className="bg-[#0B3A63] text-white rounded-xl shadow-xs border border-blue-200/10 p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 opacity-10 pointer-events-none">
          <Wrench className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-500/20 text-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-400/20 uppercase">
                REQUISITO {personalizacao?.normaISO || 'ISO 9001:2015'} — SEÇÃO 7.1.5
              </span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              {personalizacao?.calibracaoTitulo || 'Recursos de Monitoramento e Medição (Metrologia)'}
            </h2>
            <p className="text-xs text-blue-100/80 leading-relaxed">
              {personalizacao?.calibracaoSubtitulo || 'Monitore de forma centralizada e rastreável todos os instrumentos, sensores e balanças críticas.'}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {canCreate && (
              <button
                onClick={() => handleOpenNewCalib('')}
                className="px-3.5 py-2 text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Registrar Calibração</span>
              </button>
            )}
            {canCreate && (
              <button
                onClick={handleOpenNewEquip}
                className="px-3.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 rounded-lg text-white shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Instrumento</span>
              </button>
            )}
          </div>
        </div>

        {/* Métricas Metrológicas */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-blue-200/80 font-mono">ÍNDICE DE CONFORMIDADE</p>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-white font-mono">{validPercent}%</span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> Estável
              </span>
            </div>
            <p className="text-[9px] text-blue-200/60">Instrumentos devidamente aferidos</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-blue-200/80 font-mono">INVENTÁRIO MONITORADO</p>
            <span className="text-2xl font-black text-white font-mono">{totalEquips}</span>
            <p className="text-[9px] text-blue-200/60">Dispositivos cadastrados</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-blue-200/80 font-mono">CALIBRAÇÕES PENDENTES</p>
            <span className={`text-2xl font-black font-mono ${pendentes > 0 ? 'text-amber-300' : 'text-white'}`}>
              {pendentes}
            </span>
            <p className="text-[9px] text-blue-200/60">Aguardando re-aferição</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-blue-200/80 font-mono">FORA DE SERVIÇO / REPROVADO</p>
            <span className={`text-2xl font-black font-mono ${foraDeUso > 0 ? 'text-rose-400' : 'text-white'}`}>
              {foraDeUso}
            </span>
            <p className="text-[9px] text-blue-200/60">Bloqueados para uso na fábrica</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('inventario')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'inventario' 
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Inventário de Dispositivos de Medição</span>
        </button>
        <button
          onClick={() => setActiveTab('certificados')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'certificados' 
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Histórico de Certificados</span>
        </button>
      </div>

      {/* Aba 1: Inventário */}
      {activeTab === 'inventario' && (
        <div id="calibracao-inventario-tab" className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            
            {/* Filtros */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar instrumento por tag, nome ou fabricante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-xs text-slate-500 font-medium font-mono uppercase text-[10px]">Filtrar Setor:</label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-semibold"
                >
                  <option value="Todos">Todos os Setores</option>
                  {sectorsList.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid de Cards dos Equipamentos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredEquipamentos.map(eq => {
                const latestCal = eq.calibracoes[0];
                return (
                  <div 
                    key={eq.id} 
                    className="p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/20 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded font-mono border border-blue-100 dark:border-blue-900/40">
                            {eq.tag}
                          </span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="text-[10px] font-bold text-slate-400 font-mono">
                            S/N: {eq.numeroSerie}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                            eq.status === 'Calibrado' 
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-100 dark:border-emerald-900/20' 
                              : eq.status === 'Calibração Pendente'
                              ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-100 dark:border-amber-900/20'
                              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 border-rose-100 dark:border-rose-900/20'
                          }`}>
                            {eq.status.toUpperCase()}
                          </span>
                          {canEdit && (!canModifyItem || canModifyItem(eq.setor)) && (
                            <button
                              onClick={() => handleOpenEditEquip(eq)}
                              className="text-slate-400 hover:text-blue-500 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="Editar Equipamento"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (!canDeleteItem || canDeleteItem(eq.setor)) && (
                            <button
                              onClick={() => handleDeleteEquipamento(eq.id)}
                              className="text-slate-400 hover:text-rose-500 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="Excluir Equipamento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug">
                          {eq.nome}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {eq.fabricante} {eq.modelo} • Setor {eq.setor}
                        </p>
                      </div>

                      {/* Informações da Última Calibração */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-800/60 space-y-2">
                        {latestCal ? (
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div>
                              <span className="text-slate-400 font-mono text-[9px]">ÚLTIMA CALIBRAÇÃO</span>
                              <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center">
                                <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                                {latestCal.dataCalibracao}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-400 font-mono text-[9px]">VENCIMENTO</span>
                              <p className={`font-bold flex items-center ${
                                latestCal.status === 'Vencida' ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'
                              }`}>
                                <Clock className="w-3 h-3 mr-1 text-slate-400" />
                                {latestCal.proximaCalibracao}
                              </p>
                            </div>
                            <div className="col-span-2 border-t border-slate-100 dark:border-slate-800/60 pt-1.5 mt-0.5 flex items-center justify-between text-[9px]">
                              <span className="text-slate-500 font-semibold truncate max-w-[180px]">
                                Cert: <span className="font-mono text-slate-700 dark:text-slate-300">{latestCal.numeroCertificado}</span>
                              </span>
                              <button
                                onClick={() => setSelectedCert({ equip: eq, calib: latestCal })}
                                className="text-blue-600 hover:underline font-extrabold flex items-center"
                              >
                                <Printer className="w-3 h-3 mr-0.5" /> Certificado
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[10px] text-rose-500 italic flex items-center py-1">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" /> Nenhuma calibração cadastrada para este dispositivo.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-1 text-[10px]">
                      <span className="text-slate-400">Frequência: <strong className="text-slate-600 dark:text-slate-300 font-bold">{eq.frequenciaCalibracao} meses</strong></span>
                      
                      <button
                        onClick={() => handleOpenNewCalib(eq.id)}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-blue-600 dark:text-blue-400 font-bold border border-slate-200 dark:border-slate-700 rounded-md transition-colors"
                      >
                        Nova Aferição
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredEquipamentos.length === 0 && (
                <div className="col-span-2 text-center py-12 text-slate-400 italic bg-slate-50 dark:bg-slate-900/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  Nenhum instrumento de medição localizado.
                </div>
              )}
            </div>

          </div>

          {/* Cartão de Auditoria */}
          <div id="calibracao-help-box" className="p-5 rounded-xl border border-blue-100 dark:border-blue-950 bg-blue-50/20 dark:bg-blue-950/15 flex items-start space-x-3.5">
            <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300">
                {personalizacao?.calibracaoAjudaTitulo || 'Evidência de Rastreabilidade Metrológica (Requisito 7.1.5)'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {personalizacao?.calibracaoAjudaSubtitulo || 'A norma ISO 9001:2015 impõe que equipamentos usados para medir produtos (trena no corte, balança na expedição, termômetro na estamparia) sejam verificados a intervalos especificados contra padrões de medição rastreáveis a padrões nacionais ou internacionais (Inmetro/RBC). Os certificados desta aba atestam a rastreabilidade perfeita e garantem nota máxima nas auditorias.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Aba 2: Histórico de Certificados */}
      {activeTab === 'certificados' && (
        <div id="calibracao-certificados-tab" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-500 font-mono uppercase text-[10px]">Histórico de Certificados Homologados</h3>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
              {equipamentos.reduce((sum, eq) => sum + eq.calibracoes.length, 0)} Certificados Registrados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="py-3 px-4">Instrumento (TAG)</th>
                  <th className="py-3 px-4">N° Certificado</th>
                  <th className="py-3 px-4">Laboratório Emissor</th>
                  <th className="py-3 px-4">Data Aferição</th>
                  <th className="py-3 px-4">Erro Máx / Incerteza</th>
                  <th className="py-3 px-4 text-center">Laudo Técnico</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {equipamentos.flatMap(eq => eq.calibracoes.map(cal => ({ eq, cal }))).map(({ eq, cal }) => (
                  <tr key={cal.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
                      <div className="flex flex-col">
                        <span className="font-mono text-blue-600 dark:text-blue-400 text-[11px] font-bold">{eq.tag}</span>
                        <span className="text-[10px] font-normal text-slate-400 truncate max-w-[200px]">{eq.nome}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[11px] text-slate-600 dark:text-slate-400">
                      {cal.numeroCertificado}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-semibold truncate max-w-[180px]">
                      {cal.laboratorio}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {cal.dataCalibracao}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      Err: {cal.erroMaximoDetectado} / Inc: {cal.incerteza}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        cal.resultado === 'Aprovado' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                          : cal.resultado === 'Aprovado com Restrição'
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      }`}>
                        {cal.resultado.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedCert({ equip: eq, calib: cal })}
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Imprimir</span>
                        </button>
                        {canEdit && (!canModifyItem || canModifyItem(eq.setor)) && (
                          <button
                            onClick={() => handleOpenEditCalib(eq, cal)}
                            className="text-slate-400 hover:text-blue-500 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            title="Editar Certificado"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete && (!canDeleteItem || canDeleteItem(eq.setor)) && (
                          <button
                            onClick={() => handleDeleteCalibracao(eq.id, cal.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            title="Excluir Certificado"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Modal: Cadastrar Instrumento */}
      {isEquipModalOpen && (
        <div id="new-instrument-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsEquipModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-scale-up">
            
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#0B3A63] text-white flex items-center justify-between">
              <h3 className="text-sm font-extrabold flex items-center">
                <Wrench className="w-4.5 h-4.5 mr-2" />
                {editingEquip ? `Editar Instrumento: ${editingEquip.tag}` : 'Cadastrar Instrumento de Medição (ISO 7.1.5)'}
              </h3>
              <button onClick={() => setIsEquipModalOpen(false)} className="text-white/60 hover:text-white font-mono">&times;</button>
            </div>

            <form onSubmit={handleCreateEquip} className="p-5 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">TAG Única *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: CAL-EST-002"
                    value={newEquip.tag}
                    onChange={(e) => setNewEquip({ ...newEquip, tag: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 font-mono uppercase focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Nº de Série *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: SN-9941A"
                    value={newEquip.numeroSerie}
                    onChange={(e) => setNewEquip({ ...newEquip, numeroSerie: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>
              </div>

               <div className="space-y-1.5 font-sans">
                <label className="text-[11px] font-bold text-slate-500">Nome do Instrumento *</label>
                <input
                  type="text"
                  required
                  list="calibracao-instrument-types-datalist"
                  placeholder="Ex: Paquímetro Analógico de Precisão"
                  value={newEquip.nome}
                  onChange={(e) => setNewEquip({ ...newEquip, nome: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
                <datalist id="calibracao-instrument-types-datalist">
                  {instrumentTypes.map((type) => (
                    <option key={type} value={type} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Fabricante *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mitutoyo"
                    value={newEquip.fabricante}
                    onChange={(e) => setNewEquip({ ...newEquip, fabricante: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Modelo</label>
                  <input
                    type="text"
                    placeholder="Ex: Series 530"
                    value={newEquip.modelo}
                    onChange={(e) => setNewEquip({ ...newEquip, modelo: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Setor Alvo</label>
                  <select
                    value={newEquip.setor}
                    onChange={(e) => setNewEquip({ ...newEquip, setor: e.target.value as SectorType })}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  >
                    {sectorsList.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Frequência (Meses) *</label>
                  <input
                    type="number"
                    required
                    value={newEquip.frequenciaCalibracao}
                    onChange={(e) => setNewEquip({ ...newEquip, frequenciaCalibracao: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">Data de Aquisição</label>
                <input
                  type="date"
                  value={newEquip.dataAquisicao}
                  onChange={(e) => setNewEquip({ ...newEquip, dataAquisicao: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEquipModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  {editingEquip ? 'Salvar Alterações' : 'Cadastrar Dispositivo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Calibração */}
      {isCalibModalOpen && (
        <div id="new-calibration-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsCalibModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-scale-up">
            
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#0B3A63] text-white flex items-center justify-between">
              <h3 className="text-sm font-extrabold flex items-center">
                <Activity className="w-4.5 h-4.5 mr-2" />
                {editingCalib ? `Editar Certificado: ${editingCalib.numeroCertificado}` : 'Lançar Laudo de Calibração / Aferição (RBC)'}
              </h3>
              <button onClick={() => setIsCalibModalOpen(false)} className="text-white/60 hover:text-white font-mono">&times;</button>
            </div>

            <form onSubmit={handleCreateCalib} className="p-5 space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">Selecionar Equipamento *</label>
                <select
                  required
                  value={selectedEquipId}
                  onChange={(e) => setSelectedEquipId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                >
                  <option value="">Selecione o instrumento...</option>
                  {equipamentos.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.tag} - {eq.nome} ({eq.setor})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Nº Certificado *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: CERT-INM-774"
                    value={newCalib.numeroCertificado}
                    onChange={(e) => setNewCalib({ ...newCalib, numeroCertificado: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 font-mono uppercase focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Data de Realização *</label>
                  <input
                    type="date"
                    required
                    value={newCalib.dataCalibracao}
                    onChange={(e) => setNewCalib({ ...newCalib, dataCalibracao: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">Laboratório / Entidade Emissora *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: IPEM-SP ou Laboratório de Metrologia RBC"
                  value={newCalib.laboratorio}
                  onChange={(e) => setNewCalib({ ...newCalib, laboratorio: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Erro Máximo Detectado</label>
                  <input
                    type="text"
                    placeholder="Ex: +0.02 bar / -0.1g"
                    value={newCalib.erroMaximoDetectado}
                    onChange={(e) => setNewCalib({ ...newCalib, erroMaximoDetectado: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Incerteza Declarada</label>
                  <input
                    type="text"
                    placeholder="Ex: ±0.005 bar"
                    value={newCalib.incerteza}
                    onChange={(e) => setNewCalib({ ...newCalib, incerteza: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">Parecer Técnico / Laudo</label>
                <select
                  value={newCalib.resultado}
                  onChange={(e) => setNewCalib({ ...newCalib, resultado: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-semibold"
                >
                  <option value="Aprovado">Aprovado (Adequado para tolerância do produto)</option>
                  <option value="Aprovado com Restrição">Aprovado com Restrição (Uso específico ou desvio menor)</option>
                  <option value="Reprovado">Reprovado (Descartar ou enviar para manutenção)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCalibModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  {editingCalib ? 'Salvar Alterações' : 'Confirmar Aferição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Visualizar Certificado */}
      {selectedCert && (
        <div id="cert-view-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedCert(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-scale-up">
            
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#0B3A63] text-white flex items-center justify-between">
              <h3 className="text-sm font-extrabold flex items-center">
                <Printer className="w-4.5 h-4.5 mr-2" />
                Certificado Oficial de Calibração — {selectedCert.calib.numeroCertificado}
              </h3>
              <button onClick={() => setSelectedCert(null)} className="text-white/60 hover:text-white font-mono">&times;</button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6 bg-slate-50 dark:bg-slate-950 font-sans" id="printable-cert-area">
              
              {/* Header */}
              <div className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-md text-white font-black flex items-center justify-center text-sm">VI</div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">VICKYTEX</h4>
                    <p className="text-[10px] text-slate-500">Controle Metrológico de Qualidade</p>
                  </div>
                </div>
                <div className="text-right">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">{selectedCert.calib.numeroCertificado}</h4>
                  <p className="text-[9px] text-slate-400">Ref: ISO 9001:2015 Cláusula 7.1.5</p>
                </div>
              </div>

              {/* Equipamento */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-1.5 uppercase font-mono">
                  Identificação do Instrumento / Dispositivo
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[9px] text-slate-400">TAG INDUSTRIAL</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100 font-mono">{selectedCert.equip.tag}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400">NUMERO DE SÉRIE</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100 font-mono">{selectedCert.equip.numeroSerie}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400">INSTRUMENTO</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{selectedCert.equip.nome}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400">FABRICANTE / MODELO</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{selectedCert.equip.fabricante} — {selectedCert.equip.modelo}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400">SETOR ALOCADO</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{selectedCert.equip.setor}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400">FREQUÊNCIA RECOMENDADA</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{selectedCert.equip.frequenciaCalibracao} Meses</p>
                  </div>
                </div>
              </div>

              {/* Dados da Calibração */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-1.5 uppercase font-mono">
                  Rastreabilidade e Resultados Técnicos
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[9px] text-slate-400">DATA DA CALIBRAÇÃO</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100 font-mono">{selectedCert.calib.dataCalibracao}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400">DATA DE EXPIRAÇÃO</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100 font-mono">{selectedCert.calib.proximaCalibracao}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] text-slate-400">LABORATÓRIO EMISSOR</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{selectedCert.calib.laboratorio}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400">ERRO MÁXIMO ENCONTRADO</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{selectedCert.calib.erroMaximoDetectado}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400">INCERTEZA EXPANDIDA</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100 font-mono">{selectedCert.calib.incerteza}</p>
                  </div>
                </div>
              </div>

              {/* Parecer */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-1.5 uppercase font-mono">
                  Laudo de Conformidade do SGQ
                </h3>
                <div className="flex items-center space-x-3 pt-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedCert.calib.resultado === 'Aprovado'
                      ? 'bg-emerald-50 text-emerald-600'
                      : selectedCert.calib.resultado === 'Aprovado com Restrição'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}>
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                      Dispositivo considerado {selectedCert.calib.resultado.toUpperCase()}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Adequado aos limites de tolerância de tolerabilidade e variância descritos nos POPs e Instruções de Trabalho da Vickytex.
                    </p>
                  </div>
                </div>
              </div>

              {/* Rodapé */}
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-lg text-[9px] text-slate-500 dark:text-slate-400 text-center leading-relaxed font-mono">
                Assinado digitalmente por {user?.name ? `${user.name} (Gestor SGQ Vickytex)` : 'Gestão da Qualidade Vickytex'} via Google Auth SSO. Rastreável sob protocolo: REQUISITO-7-1-5-METROLOGIA-2026.
              </div>

            </div>

            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={handlePrintCert}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Via Oficial</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE EQUIPAMENTO */}
      {equipToDelete && (
        <div id="delete-equip-modal-overlay" className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div id="delete-equip-modal-content" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Confirmar Exclusão de Equipamento
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Metrologia & Calibração (ISO 9001 7.1.5)</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Você tem certeza que deseja excluir permanentemente o seguinte equipamento do inventário:
                <strong className="text-slate-950 dark:text-white font-bold block mt-1 text-sm bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-750 font-mono">
                  [{equipToDelete.tag}] {equipToDelete.nome}
                </strong>
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10">
                Aviso: Todo o histórico de calibração deste instrumento também será removido de forma irreversível.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEquipToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const idToDelete = equipToDelete.id;
                  const updated = equipamentos.filter(eq => eq.id !== idToDelete);
                  saveEquipamentos(updated);
                  EquipmentRepository.delete(idToDelete).catch(e => console.error('Erro ao excluir equipamento no Firestore:', e));
                  onAddLog('Excluiu Equipamento', `Removeu o equipamento com ID ${idToDelete} (${equipToDelete.tag}) do inventário.`);
                  setEquipToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Sim, Excluir Equipamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE CERTIFICADO DE CALIBRAÇÃO */}
      {calibToDelete && (
        <div id="delete-calib-modal-overlay" className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div id="delete-calib-modal-content" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Excluir Certificado de Calibração
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Metrologia & Calibração - Rastreabilidade</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Você tem certeza que deseja remover este certificado de calibração:
                <strong className="text-slate-950 dark:text-white font-bold block mt-1 text-sm bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-750 font-mono">
                  Certificado Nº: {calibToDelete.certNum}
                </strong>
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10">
                Atenção: A exclusão deste laudo removerá as métricas de conformidade históricas do equipamento correspondente.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCalibToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  let targetEquip: Equipamento | null = null;
                  const updated = equipamentos.map(eq => {
                    if (eq.id === calibToDelete.equipId) {
                      targetEquip = {
                        ...eq,
                        calibracoes: eq.calibracoes.filter(c => c.id !== calibToDelete.calibId)
                      };
                      return targetEquip;
                    }
                    return eq;
                  });
                  saveEquipamentos(updated);
                  if (targetEquip) {
                    EquipmentRepository.update((targetEquip as Equipamento).id, targetEquip).catch(e => console.error('Erro ao excluir certificado de calibração no Firestore:', e));
                  }
                  onAddLog('Excluiu Calibração', `Removeu o certificado de calibração ${calibToDelete.certNum} do equipamento.`);
                  setCalibToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Sim, Excluir Certificado
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
