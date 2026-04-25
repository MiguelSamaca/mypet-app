import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  modo: "visita" | "perfil";
  onResult: (data: Record<string, any>) => void;
}

const AudioDictado = ({ modo, onResult }: Props) => {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // mp4/webm audio — Gemini acepta varios formatos; usamos webm/opus por compatibilidad amplia
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/mp4";
      const mr = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mime });
        await sendAudio(blob, mime);
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch (err: any) {
      toast.error("No se pudo acceder al micrófono. Permite el acceso e intenta de nuevo.");
    }
  };

  const stop = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const sendAudio = async (blob: Blob, mime: string) => {
    setProcessing(true);
    try {
      const buf = await blob.arrayBuffer();
      // base64 sin prefijo
      let bin = "";
      const bytes = new Uint8Array(buf);
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
      }
      const b64 = btoa(bin);

      const { data, error } = await supabase.functions.invoke("transcribe-peludo", {
        body: { audioBase64: b64, mimeType: mime, modo },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      onResult((data as any).result || {});
      toast.success("Audio procesado ✨");
    } catch (err: any) {
      toast.error(err.message || "Error al procesar audio");
    } finally {
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <Button type="button" variant="outline" disabled className="gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Procesando audio...
      </Button>
    );
  }

  return recording ? (
    <Button type="button" variant="destructive" onClick={stop} className="gap-2 animate-pulse">
      <Square className="w-4 h-4" /> Detener y procesar
    </Button>
  ) : (
    <Button type="button" variant="outline" onClick={start} className="gap-2">
      <Mic className="w-4 h-4" /> Dictar con voz
    </Button>
  );
};

export default AudioDictado;
