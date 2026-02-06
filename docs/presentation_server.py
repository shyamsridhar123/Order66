"""
Simple Flask app to serve the Nodus presentation as slides.
Uses reveal.js for slide rendering.

Usage:
    pip install flask markdown
    python presentation_server.py
    
Then open http://localhost:5000
"""

from flask import Flask, render_template_string
import markdown
import re

app = Flask(__name__)

PRESENTATION_PATH = "PRESENTATION.md"

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nodus - Multi-Agent AI Platform</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.6.1/dist/reveal.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.6.1/dist/theme/black.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.6.1/plugin/highlight/monokai.css">
    <style>
        :root {
            --r-background-color: #0a0a0a;
            --r-main-color: #e0e0e0;
            --r-heading-color: #00a4ef;
            --r-link-color: #00a4ef;
        }
        .reveal {
            font-family: 'Segoe UI', system-ui, sans-serif;
            font-size: 28px;
        }
        .reveal h1, .reveal h2, .reveal h3 {
            text-transform: none;
            font-weight: 600;
        }
        .reveal h1 {
            color: #00a4ef;
            font-size: 1.8em;
        }
        .reveal h2 {
            color: #7fba00;
            font-size: 1.3em;
        }
        .reveal h3 {
            color: #f25022;
            font-size: 1.1em;
        }
        .reveal p, .reveal li {
            font-size: 0.85em;
            line-height: 1.4;
        }
        .reveal pre {
            width: 100%;
            font-size: 0.5em;
        }
        .reveal code {
            background: #1e1e1e;
            padding: 0.2em 0.4em;
            border-radius: 4px;
        }
        .reveal pre code {
            padding: 0.8em;
            max-height: 400px;
        }
        .reveal table {
            margin: 0 auto;
            font-size: 0.65em;
        }
        .reveal table th {
            background: #00a4ef;
            color: white;
            padding: 0.3em 0.8em;
        }
        .reveal table td {
            padding: 0.25em 0.8em;
            border-bottom: 1px solid #333;
        }
        .reveal ul, .reveal ol {
            display: block;
            text-align: left;
            margin-left: 1em;
        }
        .reveal li {
            margin: 0.3em 0;
        }
        .reveal blockquote {
            background: rgba(0, 164, 239, 0.1);
            border-left: 4px solid #00a4ef;
            padding: 0.8em;
            font-style: italic;
            font-size: 0.9em;
        }
        .reveal .slide-number {
            font-size: 14px;
            background: rgba(0, 164, 239, 0.8);
            padding: 5px 10px;
            border-radius: 4px;
        }
        .reveal section {
            padding: 20px;
        }
        /* Microsoft colors accent */
        .microsoft-colors {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
        }
        .microsoft-colors span {
            width: 20px;
            height: 20px;
            display: inline-block;
        }
        .ms-red { background: #f25022; }
        .ms-green { background: #7fba00; }
        .ms-blue { background: #00a4ef; }
        .ms-yellow { background: #ffb900; }
    </style>
</head>
<body>
    <div class="reveal">
        <div class="slides">
            {{ slides | safe }}
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.6.1/dist/reveal.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.6.1/plugin/markdown/markdown.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.6.1/plugin/highlight/highlight.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.6.1/plugin/notes/notes.js"></script>
    <script>
        Reveal.initialize({
            hash: true,
            slideNumber: true,
            transition: 'slide',
            plugins: [ RevealMarkdown, RevealHighlight, RevealNotes ],
            width: 1200,
            height: 800,
            margin: 0.04,
            minScale: 0.2,
            maxScale: 2.0,
            center: true,
        });
    </script>
</body>
</html>
"""


def parse_presentation():
    """Read and parse the markdown presentation into slides."""
    with open(PRESENTATION_PATH, "r") as f:
        content = f.read()
    
    # Remove the markdown code fence wrapper if present
    content = re.sub(r'^```markdown\n', '', content)
    content = re.sub(r'\n```$', '', content)
    
    # Split on horizontal rules (---) which separate slides
    slides = re.split(r'\n---\n', content)
    
    # Convert each slide's markdown to HTML
    md = markdown.Markdown(extensions=['tables', 'fenced_code'])
    
    html_slides = []
    for slide in slides:
        slide = slide.strip()
        if slide:
            md.reset()
            slide_html = md.convert(slide)
            html_slides.append(f"<section>{slide_html}</section>")
    
    return "\n".join(html_slides)


@app.route("/")
def presentation():
    """Serve the presentation."""
    slides = parse_presentation()
    return render_template_string(HTML_TEMPLATE, slides=slides)


@app.route("/print")
def print_view():
    """Serve a print-friendly version."""
    slides = parse_presentation()
    print_template = HTML_TEMPLATE.replace(
        "transition: 'slide'",
        "transition: 'none', pdfMaxPagesPerSlide: 1"
    )
    return render_template_string(print_template, slides=slides)


if __name__ == "__main__":
    print("🚀 Nodus Presentation Server")
    print("=" * 40)
    print("Open: http://0.0.0.0:5000 (LAN accessible)")
    print("Print: http://0.0.0.0:5000/print")
    print("=" * 40)
    print("\nControls:")
    print("  → / ← : Navigate slides")
    print("  Space  : Next slide")
    print("  Esc    : Overview mode")
    print("  F      : Fullscreen")
    print("  S      : Speaker notes")
    print("=" * 40)
    app.run(debug=True, host="0.0.0.0", port=5000)
