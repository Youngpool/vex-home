"""Build the VEX home page into dist/.

    python3 build.py          # dist/index.html loads its libraries from dist/lib (works offline)
    python3 build.py --cdn    # loads them from jsdelivr instead (the published artifact)

Everything else is inlined: CSS, scripts, the Hairline figures, fonts and Vex's voice lines.
The Live2D model (Kimm) is copied to dist/kimm and fetched at runtime, so serve dist/ over http.
"""
import base64, json, pathlib, shutil, sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC, DIST = ROOT / 'src', ROOT / 'dist'
CDN = '--cdn' in sys.argv
read = lambda p: pathlib.Path(p).read_text(encoding='utf-8')

t = read(SRC / 'index.html')
t = t.replace('{{CSS}}', read(SRC / 'v16.css')).replace('{{MARK}}', read(SRC / 'mark.svg.html'))

# Hairline line figures: the kernel, then each figure wrapped in its own scope
figs = ''.join('\n(() => {\n' + read(SRC / 'hl' / f'{n}.js').strip() + '\n})();\n' for n in ('gate', 'cap', 'clock', 'stamp', 'keybox', 'coins'))
hl = ('<script id="hl-kernel">\n' + read(SRC / 'vendor' / 'hairline-kernel.js').strip() + '\n</script>\n'
      '<script id="hl-figures">\n' + read(SRC / 'hl' / 'host.js').replace('/*FIGS*/', figs) + '</script>')
t = t.replace('{{HAIRLINE}}', hl)

# Vex's voice: every mp3 in voice/ becomes window.VEX_VOICE[name]
vo = {p.stem: 'data:audio/mpeg;base64,' + base64.b64encode(p.read_bytes()).decode() for p in sorted((ROOT / 'voice').glob('*.mp3'))}
av = 'data:image/webp;base64,' + base64.b64encode((SRC / 'user-avatar.webp').read_bytes()).decode()
t = t.replace('{{VOICE}}', '<script>window.VEX_VOICE=' + json.dumps(vo) + ';window.VEX_USER_AVATAR="' + av + '"</script>')

t = t.replace('{{SCRIPT}}', ''.join('<script>\n' + read(SRC / f) + '</script>\n' for f in ('v7.js', 'rail.js', 'dial.js', 'ds-data.js', 'ds.js', 'cursor.js', 'reel.js', 'gradient-ascii.js', 'kimm.js')))

fonts = [('Be Vietnam Pro', f'be-vietnam-pro-latin-{w}-normal.woff2', w) for w in (300, 400, 600)] + [('Roboto Mono', 'roboto-mono-latin-400-normal.woff2', 400)]
t = t.replace('/*FONTS*/', ''.join(
    f'@font-face{{font-family:"{n}";font-style:normal;font-weight:{w};font-display:swap;'
    f'src:url(data:font/woff2;base64,{base64.b64encode((SRC / "fonts" / f).read_bytes()).decode()}) format("woff2")}}\n' for n, f, w in fonts))

if not CDN:
    t = t.replace('https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/', 'lib/').replace('https://cdn.jsdelivr.net/npm/mouse-follower@1.1.2/dist/', 'lib/')
    t = t.replace('<head>', '<head><script>window.KIMM_LIBS=["lib/live2dcubismcore.min.js","lib/pixi.min.js","lib/cubism4.min.js"]</script>', 1)

DIST.mkdir(exist_ok=True)
(DIST / 'index.html').write_text(t, encoding='utf-8')
shutil.copytree(ROOT / 'model', DIST / 'kimm', dirs_exist_ok=True)
shutil.copytree(ROOT / 'reel', DIST / 'reel', dirs_exist_ok=True)
print('built dist/index.html', len(t) // 1024, 'KB', '(cdn libraries)' if CDN else '(local libraries in dist/lib)')
