#!/usr/bin/env python3
"""Genera index.html a partir de dev.html inlineando los <script type="text/babel" src>.

Por qué: los navegadores bloquean el XHR de Babel sobre file://, así que el
index.html final tiene que llevar el código adentro para abrir con doble click.
Flujo de trabajo: editar los .jsx / dev.html → correr `python3 build.py`.
"""
import re

html = open('dev.html').read()

def inline(m):
    src = m.group(1)
    code = open(src).read()
    return f'<script type="text/babel">\n// ── {src} (inline generado por build.py — editar el .jsx, no esto) ──\n{code}\n</script>'

html2, n = re.subn(r'<script type="text/babel" src="([^"]+)"></script>', inline, html)
open('index.html', 'w').write(html2)
print(f'index.html regenerado: {n} scripts inline, {len(html2)//1024} KB')
