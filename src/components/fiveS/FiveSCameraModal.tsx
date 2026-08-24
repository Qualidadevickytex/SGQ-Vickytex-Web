/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  SwitchCamera, 
  X, 
  Check, 
  RefreshCw, 
  Upload, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { compressImage } from '../../utils/imageCompressor';

interface FiveSCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string, legend: string) => void;
  title?: string;
  defaultLegend?: string;
}

export const FiveSCameraModal: React.FC<FiveSCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = "Capturar Evidência Fotográfica",
  defaultLegend = "Evidência fotográfica"
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [legend, setLegend] = useState<string>(defaultLegend);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Iniciar ou reiniciar o stream da câmera ao abrir o modal ou alternar facingMode
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPhoto(null);
      setCameraError(null);
      return;
    }

    setLegend(defaultLegend);
    setCapturedPhoto(null);
    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    stopCamera();
    setIsInitializing(true);
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Seu navegador ou ambiente não suporta acesso direto à câmera.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.warn("Erro ao dar play no vídeo:", e));
        };
      }
      setIsInitializing(false);
    } catch (err: any) {
      console.warn("Não foi possível acessar a câmera em tempo real:", err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? "Permissão de câmera negada. Permita o acesso nas configurações do seu navegador ou escolha um arquivo."
          : "Câmera não detectada ou indisponível. Você pode carregar uma foto diretamente do seu dispositivo."
      );
      setIsInitializing(false);
    }
  };

  // Alternar entre câmera traseira e frontal
  const handleToggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capturar o quadro atual do feed de vídeo em tempo real
  const handleTakeSnapshot = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Se estiver usando câmera frontal, espelhar para parecer natural
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.85);

    try {
      const compressed = await compressImage(rawDataUrl, 1200, 1200, 0.75);
      setCapturedPhoto(compressed);
      stopCamera();
    } catch {
      setCapturedPhoto(rawDataUrl);
      stopCamera();
    }
  };

  // Upload por arquivo ou galeria
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 1200, 1200, 0.75);
      setCapturedPhoto(compressed);
      stopCamera();
    } catch (err) {
      console.error("Erro ao comprimir arquivo:", err);
    } finally {
      e.target.value = '';
    }
  };

  // Confirmar e enviar a foto
  const handleConfirm = () => {
    if (!capturedPhoto) return;
    onCapture(capturedPhoto, legend.trim() || "Evidência fotográfica");
    onClose();
  };

  // Retirar foto / tentar novamente
  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0B3A63] text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">{title}</h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewfinder / Preview Area */}
        <div className="relative bg-black flex-1 min-h-[300px] sm:min-h-[360px] flex items-center justify-center overflow-hidden">
          {capturedPhoto ? (
            /* Foto Capturada (Preview Imediato) */
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
              <img 
                src={capturedPhoto} 
                alt="Foto Capturada" 
                className="max-h-[380px] w-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Foto Pronta</span>
              </div>
            </div>
          ) : (
            /* Live Stream da Câmera em Tempo Real */
            <>
              {isInitializing && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white space-y-2 z-10">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                  <span className="text-xs font-bold text-slate-300">Conectando câmera em tempo real...</span>
                </div>
              )}

              {cameraError ? (
                <div className="p-6 text-center text-white space-y-4 max-w-sm">
                  <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 mx-auto"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Selecionar Foto do Dispositivo</span>
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover min-h-[300px] sm:min-h-[360px]"
                  />

                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-25">
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-white" />
                    <div className="border-r border-white" />
                    <div />
                  </div>

                  {/* Live Status Badge */}
                  <div className="absolute top-3 left-3 bg-red-600/90 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center space-x-1.5 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>Câmera ao Vivo</span>
                  </div>

                  {/* Switch Camera Button */}
                  <button
                    type="button"
                    onClick={handleToggleFacingMode}
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-xs border border-white/20 transition-all"
                    title="Alternar Câmera (Traseira/Frontal)"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                </>
              )}
            </>
          )}

          {/* Hidden File Input for Gallery / Local Files */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Bottom Controls / Legend Input */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-3 shrink-0">
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase">
              Legenda da Evidência
            </label>
            <input
              type="text"
              placeholder="Ex: Garrafa fora do local padronizado no setor"
              value={legend}
              onChange={(e) => setLegend(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            {capturedPhoto ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Tirar Outra</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar e Inserir Evidência</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1.5 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Galeria / Arquivo</span>
                </button>

                <button
                  type="button"
                  onClick={handleTakeSnapshot}
                  disabled={Boolean(cameraError) || isInitializing}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capturar Foto em Tempo Real</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
