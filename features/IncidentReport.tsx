import React, { useState, useEffect, useRef } from 'react';
import { Asset, User, WorkOrder, WorkOrderType, WorkOrderStatus, WorkOrderOrigin, Priority } from '../types';
import { QrCode, Send, X, CheckCircle2, Wrench, AlertTriangle } from 'lucide-react';

interface Props {
  assets: Asset[];
  currentUser: User;
  onCreateWorkOrder: (order: WorkOrder) => void;
}

type ChatStep = 'GREETING' | 'ASK_MACHINE' | 'CONFIRM_MACHINE' | 'ASK_DESCRIPTION' | 'ASK_PRIORITY' | 'DONE';

interface Message {
  id: string;
  from: 'bot' | 'user';
  text: string;
  time: string;
}

interface QuickReply {
  label: string;
  value: string;
  emoji: string;
}

const BOT_NAME = 'MolinoBot 🤖';
const now = () => new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

const PRIORITY_REPLIES: QuickReply[] = [
  { label: 'Crítico — parar ahora',  value: 'CRITICAL', emoji: '🔴' },
  { label: 'Alta — intervenir hoy',  value: 'HIGH',     emoji: '🟠' },
  { label: 'Media — puede esperar',  value: 'MEDIUM',   emoji: '🟡' },
];

export const IncidentReport: React.FC<Props> = ({ assets, currentUser, onCreateWorkOrder }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<ChatStep>('GREETING');
  const [inputValue, setInputValue] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [description, setDescription] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [createdOT, setCreatedOT] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addMessage = (from: 'bot' | 'user', text: string) => {
    setMessages(prev => [...prev, { id: `msg-${Date.now()}-${Math.random()}`, from, text, time: now() }]);
  };

  const botSay = (text: string, delay = 600) => {
    setTimeout(() => addMessage('bot', text), delay);
  };

  // Arrancar la conversación
  useEffect(() => {
    setTimeout(() => {
      addMessage('bot', `¡Hola ${currentUser.name.split(' ')[0]}! 👋 Soy el asistente de fallas del Molino.`);
      botSay('Para registrar un incidente, ingresá el *código o nombre del equipo*, o escaneá el QR que está en la máquina.', 1200);
      setTimeout(() => setStep('ASK_MACHINE'), 1400);
    }, 400);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const val = inputValue.trim();
    if (!val) return;
    addMessage('user', val);
    setInputValue('');
    processInput(val);
  };

  const processInput = (val: string) => {
    if (step === 'ASK_MACHINE') {
      const q = val.toLowerCase();
      const found = assets.find(a =>
        a.name.toLowerCase().includes(q) ||
        (a.tag && a.tag.toLowerCase().includes(q)) ||
        a.id.toLowerCase() === q
      );
      if (found) {
        setSelectedAsset(found);
        setStep('CONFIRM_MACHINE');
        botSay(`Encontré el equipo: *${found.name}* 📍 ${found.location} — Sector: ${found.sector || '—'}`, 600);
        botSay(`¿Es este el equipo con la falla? Respondé *sí* para continuar o escribí otro código.`, 1300);
      } else {
        botSay(`No encontré el equipo con ese código. Intentá con el nombre o el TAG (ej: *52M014*, *Banco C6*, *Humedecanter*).`, 600);
      }
    } else if (step === 'CONFIRM_MACHINE') {
      if (/^s[ií]/i.test(val)) {
        setStep('ASK_DESCRIPTION');
        botSay(`Perfecto ✅ Ahora, *¿qué pasó?* Contame brevemente la falla (ruido, pérdida, parado, etc.)`, 600);
      } else {
        setStep('ASK_MACHINE');
        setSelectedAsset(null);
        botSay(`Ok, ingresá el código o nombre del equipo correcto.`, 600);
      }
    } else if (step === 'ASK_DESCRIPTION') {
      setDescription(val);
      setStep('ASK_PRIORITY');
      botSay(`Entendido. ¿Qué tan urgente es?`, 700);
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    if (step !== 'ASK_PRIORITY' || !selectedAsset) return;
    addMessage('user', `${reply.emoji} ${reply.label}`);

    const priority = reply.value as Priority;
    const otId = `ot-${Date.now()}`;
    const order: WorkOrder = {
      id: otId,
      title: `Falla reportada: ${selectedAsset.name}`,
      description,
      assetId: selectedAsset.id,
      assetName: selectedAsset.name,
      type: WorkOrderType.CORRECTIVE,
      priority,
      status: WorkOrderStatus.PENDING,
      dueDate: new Date().toISOString().split('T')[0],
      specialtyRequired: 'Mecánica',
      origin: WorkOrderOrigin.MANUAL,
      sector: selectedAsset.sector,
      reportedBy: currentUser.name,
      reportDate: new Date().toISOString().split('T')[0],
    };

    onCreateWorkOrder(order);
    setCreatedOT(otId);
    setStep('DONE');

    botSay(`Registrando incidente...`, 700);
    botSay(
      `✅ *OT #${otId}* creada y notificada a Mantenimiento.\n\nEquipo: ${selectedAsset.name}\nFalla: ${description}\nPrioridad: ${reply.label}\n\nEl equipo de mantenimiento ya la recibió. Te avisamos cuando esté en camino.`,
      1600
    );
  };

  const handleQRSelect = (asset: Asset) => {
    setShowQR(false);
    setSelectedAsset(asset);
    addMessage('user', `📷 [QR escaneado: ${asset.tag || asset.name}]`);
    setStep('CONFIRM_MACHINE');
    botSay(`Leí el QR del equipo: *${asset.name}* 📍 ${asset.location} — Sector: ${asset.sector || '—'}`, 600);
    botSay(`¿Es este el equipo con la falla? Respondé *sí* para continuar.`, 1300);
  };

  const resetChat = () => {
    setMessages([]);
    setStep('GREETING');
    setSelectedAsset(null);
    setDescription('');
    setCreatedOT(null);
    setInputValue('');
    setTimeout(() => {
      addMessage('bot', `¡Listo para registrar otro incidente! Ingresá el código del equipo.`);
      setStep('ASK_MACHINE');
    }, 300);
  };

  const canSendText = step === 'ASK_MACHINE' || step === 'CONFIRM_MACHINE' || step === 'ASK_DESCRIPTION';

  return (
    <div className="flex items-start justify-center gap-8 min-h-[80vh] p-4">

      {/* ── Panel izquierdo: contexto ── */}
      <div className="hidden lg:flex flex-col gap-4 w-64 pt-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Reportar Falla</h2>
          <p className="text-sm text-slate-500 mt-1">Módulo de Operaciones — levantá incidentes directo desde planta.</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-green-800 uppercase">¿Cómo funciona?</p>
          <ol className="text-xs text-green-700 space-y-1.5 list-decimal list-inside">
            <li>Escaneá el QR del equipo o escribí su código</li>
            <li>Contá brevemente qué pasó</li>
            <li>Indicá la urgencia</li>
            <li>La OT se crea automáticamente en el sistema</li>
          </ol>
        </div>
        {createdOT && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-sm">
            <p className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1"><CheckCircle2 size={13} className="text-green-600"/> Último incidente</p>
            <p className="text-xs font-mono text-slate-500">{createdOT}</p>
            <p className="text-xs text-slate-700 font-medium">{selectedAsset?.name}</p>
            <p className="text-xs text-slate-500">{description}</p>
            <button onClick={resetChat} className="w-full text-xs font-semibold text-primary-600 hover:text-primary-800 border border-primary-200 hover:border-primary-400 rounded-lg py-1.5 transition-colors mt-1">
              + Nuevo incidente
            </button>
          </div>
        )}
      </div>

      {/* ── Celular WhatsApp ── */}
      <div
        className="relative flex flex-col bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
        style={{ width: 375, height: 720, border: '8px solid #1a1a2e' }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#1a1a2e] rounded-b-2xl z-20" />

        {/* WhatsApp Header */}
        <div className="bg-[#075E54] pt-6 pb-3 px-4 flex items-center gap-3 z-10 shrink-0">
          <div className="w-9 h-9 rounded-full bg-green-300 flex items-center justify-center text-lg font-bold text-green-900">
            🤖
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">{BOT_NAME}</p>
            <p className="text-green-200 text-[11px]">
              {step === 'DONE' ? 'Incidente registrado ✓' : 'en línea'}
            </p>
          </div>
          <Wrench size={18} className="text-green-200" />
        </div>

        {/* Chat background */}
        <div
          className="flex-1 overflow-y-auto px-3 py-3 space-y-1"
          style={{ background: '#ECE5DD' }}
        >
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} mb-1`}>
              <div
                className={`relative max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                  msg.from === 'user'
                    ? 'bg-[#DCF8C6] rounded-br-sm text-slate-800'
                    : 'bg-white rounded-bl-sm text-slate-800'
                }`}
              >
                <p className="leading-snug whitespace-pre-line" dangerouslySetInnerHTML={{
                  __html: msg.text.replace(/\*(.*?)\*/g, '<strong>$1</strong>')
                }} />
                <p className={`text-[10px] mt-1 text-right ${msg.from === 'user' ? 'text-green-700' : 'text-slate-400'}`}>
                  {msg.time} {msg.from === 'user' ? '✓✓' : ''}
                </p>
              </div>
            </div>
          ))}

          {/* Quick replies para prioridad */}
          {step === 'ASK_PRIORITY' && (
            <div className="flex flex-col gap-2 mt-2">
              {PRIORITY_REPLIES.map(r => (
                <button
                  key={r.value}
                  onClick={() => handleQuickReply(r)}
                  className="bg-white border border-[#25D366] text-[#075E54] font-semibold text-sm rounded-xl py-2.5 px-4 text-center shadow-sm hover:bg-green-50 active:scale-95 transition-all"
                >
                  {r.emoji} {r.label}
                </button>
              ))}
            </div>
          )}

          {step === 'DONE' && (
            <div className="flex justify-center mt-3">
              <button
                onClick={resetChat}
                className="bg-[#25D366] text-white font-bold text-xs rounded-xl py-2 px-5 shadow hover:bg-[#1da851] transition-colors"
              >
                + Reportar otro incidente
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="bg-[#F0F0F0] px-2 py-2 flex items-center gap-2 shrink-0">
          {/* Botón QR */}
          <button
            onClick={() => setShowQR(true)}
            disabled={step === 'DONE' || step === 'ASK_PRIORITY'}
            className="shrink-0 w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white disabled:opacity-40 hover:bg-[#1da851] transition-colors"
            title="Escanear QR del equipo"
          >
            <QrCode size={18} />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canSendText && handleSend()}
            disabled={!canSendText}
            placeholder={
              step === 'ASK_MACHINE' ? 'Código o nombre del equipo...'
              : step === 'CONFIRM_MACHINE' ? 'sí / no...'
              : step === 'ASK_DESCRIPTION' ? 'Describí la falla brevemente...'
              : step === 'ASK_PRIORITY' ? 'Elegí una opción arriba...'
              : 'Incidente registrado'
            }
            className="flex-1 rounded-full bg-white px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none disabled:opacity-50 border border-slate-200"
          />

          <button
            onClick={handleSend}
            disabled={!canSendText || !inputValue.trim()}
            className="shrink-0 w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white disabled:opacity-40 hover:bg-[#1da851] transition-colors"
          >
            <Send size={16} />
          </button>
        </div>

        {/* Home bar */}
        <div className="bg-white h-5 flex items-center justify-center shrink-0">
          <div className="w-28 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>

      {/* ── Modal QR Scanner ── */}
      {showQR && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-[#075E54] px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-white font-bold">Escaneá el QR del equipo</p>
                <p className="text-green-200 text-xs mt-0.5">Seleccioná el equipo de la lista</p>
              </div>
              <button onClick={() => setShowQR(false)} className="text-green-200 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            {/* Simulador de viewfinder */}
            <div className="bg-slate-900 flex items-center justify-center py-4">
              <div className="relative w-44 h-44 border-2 border-white/30 rounded-lg flex items-center justify-center">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#25D366] rounded-tl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#25D366] rounded-tr" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#25D366] rounded-bl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#25D366] rounded-br" />
                <QrCode size={60} className="text-white/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-[#25D366] opacity-70 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="px-4 py-3">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">O seleccioná el equipo:</p>
              <div className="space-y-1 max-h-52 overflow-y-auto">
                {assets.map(a => (
                  <button
                    key={a.id}
                    onClick={() => handleQRSelect(a)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-green-100 flex items-center justify-center shrink-0 transition-colors">
                      {a.status === 'DOWN'
                        ? <AlertTriangle size={14} className="text-red-500" />
                        : <Wrench size={14} className="text-slate-400 group-hover:text-green-600" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{a.name}</p>
                      <p className="text-[10px] text-slate-400">{a.location} {a.tag ? `· ${a.tag}` : ''}</p>
                    </div>
                    {a.status === 'DOWN' && (
                      <span className="shrink-0 text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">PARADO</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
