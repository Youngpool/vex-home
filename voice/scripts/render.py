import json, subprocess, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
K = Kokoro('models/kokoro-v1.0.onnx', 'models/voices-v1.0.bin')
ST = K.get_voice_style('af_bella') * 0.7 + K.get_voice_style('jf_gongitsune') * 0.3
LINES = {
  'hi':    "I'm Vex. I trade inside your limits.",
  'swap1': "Route found. Checking your limits.",
  'swap2': "Cleared. Your call.",
  'swap3': "Signed by you. Sent.",
  'ape1':  "Checking against your limits.",
  'ape2':  "Blocked. Over your limits. Nothing signed.",
  'btc1':  "Higher lows on the 4h. Watching the blue level.",
  'nudge': "Ready for the next one.",
  'spam':  "Okay, okay. I'm going.",
  'poke':  "Hey!",
}
SPOKEN = {k: v.replace('vEXIT', 'vex it').replace('4h', 'four hour') for k, v in LINES.items()}
SR = 24000; dur = {}
for k, t in SPOKEN.items():
    a, _ = K.create(t, voice=ST, speed=1.0, lang='en-us'); sf.write(f'_{k}.wav', a, SR)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'_{k}.wav', '-af',
        f'asetrate={SR}*1.16,aresample={SR},atempo={1/1.16:.4f},equalizer=f=3500:t=q:w=1:g=2,loudnorm=I=-16:TP=-1.5,afade=t=in:d=0.01',
        '-ac', '1', '-ar', '24000', '-b:a', '64k', f'/home/claude/vex-home/voice/{k}.mp3'], check=True)
    dur[k] = round(len(a) / SR, 2); print(k, dur[k])
json.dump({'lines': LINES, 'dur': dur}, open('/home/claude/vex-home/voice/lines.json', 'w'), indent=1)
