#!/usr/bin/env python3
# Server de desarrollo con cache deshabilitado: los .jsx se compilan con
# Babel en el navegador y Chrome los cacheaba (http.server no manda
# Cache-Control), sirviendo versiones viejas tras cada edición.
import http.server
import os
import sys

# puerto: argumento CLI > variable PORT (autoPort del preview) > default
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get('PORT', 4599))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()


http.server.ThreadingHTTPServer(('', PORT), NoCacheHandler).serve_forever()
