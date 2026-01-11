import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ======================================================
   ASR — Automatic Speech Recognition
   - Nunca lanza excepción hacia arriba
   - Si el audio es inválido, devuelve ""
====================================================== */
export async function asr(audio: Buffer): Promise<string> {
  const filePath = path.join(tmpdir(), `${randomUUID()}.wav`);

  try {
    // 1. Guardar audio temporal
    await fs.promises.writeFile(filePath, audio);

    // 2. Enviar a OpenAI
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });

    return transcription.text ?? "";
  } catch (err) {
    console.error("[ASR ERROR] Falló transcripción de audio", err);
    return ""; // 🔒 fallback seguro
  } finally {
    // 3. Limpieza garantizada
    try {
      await fs.promises.unlink(filePath);
    } catch {
      // ignoramos errores de limpieza
    }
  }
}

/* ======================================================
   TTS — Text to Speech
   - Si falla, lanza error (esto SÍ debe saberse)
====================================================== */
export async function tts(text: string): Promise<Buffer> {
  try {
    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "verse",
      input: text,
    });

    return Buffer.from(await response.arrayBuffer());
  } catch (err) {
    console.error("[TTS ERROR] Falló generación de audio", err);
    throw err; // ⚠️ aquí sí propagamos
  }
}
