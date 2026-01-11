/* ======================================================
   AUDIO RECORDING — HOLD TO TALK
====================================================== */

export async function recordAudio(): Promise<Blob> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const audioContext = new AudioContext({ sampleRate: 16000 });
  const source = audioContext.createMediaStreamSource(stream);

  // ScriptProcessor es deprecated pero sigue siendo soportado
  const processor = audioContext.createScriptProcessor(4096, 1, 1);
  const chunks: Float32Array[] = [];

  source.connect(processor);
  processor.connect(audioContext.destination);

  processor.onaudioprocess = (e) => {
    chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  };

  // ⏺️ espera a que el usuario suelte el botón
  await waitForRelease();

  processor.disconnect();
  source.disconnect();
  stream.getTracks().forEach((t) => t.stop());
  audioContext.close();

  const pcm = flatten(chunks);

  // 🛑 si no habló, no mandamos nada
  if (pcm.length < 1600) {
    throw new Error("Audio demasiado corto");
  }

  const wav = encodeWAV(pcm, 16000);
  return new Blob([wav], { type: "audio/wav" });
}

/* ======================================================
   HELPERS
====================================================== */

function waitForRelease(): Promise<void> {
  return new Promise((resolve) => {
    const stop = () => {
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchend", stop);
      resolve();
    };

    window.addEventListener("mouseup", stop);
    window.addEventListener("touchend", stop);
  });
}

function flatten(chunks: Float32Array[]): Float32Array {
  const length = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Float32Array(length);

  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

function encodeWAV(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return buffer;
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
