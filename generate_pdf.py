#!/usr/bin/env python3
"""
Generate Jordan_Bradley_CV.pdf from CV.md.
Usage: python3 generate_pdf.py
"""

import markdown
import weasyprint
import re
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
input_path  = os.path.join(script_dir, 'CV.md')
output_path = os.path.join(script_dir, 'Jordan_Bradley_CV.pdf')

with open(input_path, 'r') as f:
    raw = f.read()

# Strip the source-of-truth meta note at the top
raw = re.sub(r'^> \*\*Source.*?\n\n', '', raw, flags=re.DOTALL)

html_body = markdown.markdown(raw, extensions=['tables'])

html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
@page {{
  size: A4;
  margin: 14mm 16mm 14mm 16mm;
  background: #080d0a;
}}

* {{ box-sizing: border-box; margin: 0; padding: 0; }}

body {{
  font-family: 'Courier New', Courier, monospace;
  font-size: 8.5pt;
  line-height: 1.55;
  color: rgba(255,255,255,0.75);
  background: #080d0a;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}}

h1 {{
  font-size: 18pt;
  font-weight: 700;
  letter-spacing: 2px;
  color: #ffffff;
  margin-bottom: 4pt;
  text-transform: uppercase;
}}

h1 + p {{
  font-size: 7.5pt;
  color: rgba(0,255,100,0.6);
  letter-spacing: 1px;
  margin-bottom: 10pt;
  border-bottom: 1px solid rgba(0,255,100,0.15);
  padding-bottom: 8pt;
}}

h1 + p a {{
  color: rgba(0,255,100,0.7);
  text-decoration: none;
}}

hr {{
  border: none;
  border-top: 1px solid rgba(0,255,100,0.12);
  margin: 8pt 0;
}}

h2 {{
  font-size: 10pt;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #ffffff;
  margin-top: 12pt;
  margin-bottom: 6pt;
  padding-bottom: 3pt;
  border-bottom: 1px solid rgba(0,255,100,0.2);
}}

h3 {{
  font-size: 9pt;
  font-weight: 700;
  color: #ffffff;
  margin-top: 9pt;
  margin-bottom: 1pt;
  letter-spacing: 0.5px;
}}

h3 + p {{
  font-size: 7.5pt;
  color: rgba(0,255,100,0.55);
  margin-bottom: 3pt;
  font-style: italic;
}}

p {{
  font-size: 8.5pt;
  margin-bottom: 4pt;
  color: rgba(255,255,255,0.7);
}}

ul {{
  margin: 3pt 0 5pt 0;
  padding-left: 14pt;
  list-style: none;
}}

li {{
  font-size: 8pt;
  line-height: 1.5;
  margin-bottom: 2.5pt;
  padding-left: 8pt;
  position: relative;
  color: rgba(255,255,255,0.7);
}}

li::before {{
  content: '>';
  position: absolute;
  left: -2pt;
  color: rgba(0,255,100,0.45);
  font-weight: 700;
}}

li strong {{
  color: rgba(255,255,255,0.92);
}}

p:last-of-type {{
  font-size: 7pt;
  color: rgba(0,255,100,0.4);
  letter-spacing: 0.5px;
  margin-bottom: 2pt;
}}

table {{
  width: 100%;
  border-collapse: collapse;
  margin: 4pt 0 6pt 0;
  font-size: 8pt;
}}

th {{
  text-align: left;
  font-size: 7pt;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(0,255,100,0.5);
  border-bottom: 1px solid rgba(0,255,100,0.15);
  padding: 3pt 6pt 3pt 0;
}}

td {{
  padding: 2.5pt 6pt 2.5pt 0;
  color: rgba(255,255,255,0.7);
  vertical-align: top;
  border-bottom: 1px solid rgba(0,255,100,0.06);
}}

td:first-child {{
  color: rgba(0,255,100,0.55);
  white-space: nowrap;
  width: 28%;
  font-size: 7.5pt;
}}

a {{
  color: rgba(0,200,255,0.7);
  text-decoration: none;
}}
</style>
</head>
<body>
{html_body}
</body>
</html>"""

weasyprint.HTML(string=html).write_pdf(output_path)
print(f"Generated: {output_path}")
