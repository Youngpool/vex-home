import json, subprocess, sys, soundfile as sf
from kokoro_onnx import Kokoro
K = Kokoro('models/kokoro-v1.0.onnx', 'models/voices-v1.0.bin')
ST = K.get_voice_style('af_bella') * 0.7 + K.get_voice_style('jf_gongitsune') * 0.3
NEW = {
  'intent': "I trade inside your limits. Try a swap, or ask me about BTC.",
  'hi2':    "Hi. I'm Vex. Give me an order.",
  'nudge2': "Your move.",
  'nudge3': "Want another order?",
  'poke2':  "Hm?",
  'poke3':  "That tickles.",
  'spam2':  "Alright, alright!",
  'swap3b': "Done. Signed by you.",
  'ape2b':  "No. That breaks your limits. Nothing signed.",
}
SR = 24000; meta = json.load(open('/home/claude/vex-home/voice/lines.json'))
for k, t in NEW.items():
    a, _ = K.create(t.replace('4h', 'four hour'), voice=ST, speed=1.0, lang='en-us'); sf.write(f'_{k}.wav', a, SR)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'_{k}.wav', '-af',
        f'asetrate={SR}*1.16,aresample={SR},atempo={1/1.16:.4f},equalizer=f=3500:t=q:w=1:g=2,loudnorm=I=-16:TP=-1.5,afade=t=in:d=0.01',
        '-ac', '1', '-ar', '24000', '-b:a', '64k', f'/home/claude/vex-home/voice/{k}.mp3'], check=True)
    meta['lines'][k] = t; meta['dur'][k] = round(len(a) / SR, 2); print(k, meta['dur'][k])
json.dump(meta, open('/home/claude/vex-home/voice/lines.json', 'w'), indent=1)
