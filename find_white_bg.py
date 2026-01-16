"""
Script to find all instances of white backgrounds in AppView.tsx that need dark mode support
"""

import re

# Read the file
with open(r'C:\Users\muhan\Downloads\IntelliWheels_FullStack-main\IntelliWheels_FullStack-main\src\components\AppView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
    lines = content.split('\n')

# Patterns to find
patterns = [
    r'bg-white(?!/)',  # bg-white but not bg-white/90
    r'border-slate-100',
    r'text-slate-900',
    r'className="[^"]*rounded[^"]*"',  # Any className with rounded
]

print("=== Finding components that need dark mode ===\n")

# Find all bg-white instances
white_bg_pattern = re.compile(r'bg-white(?!/\d)')
for i, line in enumerate(lines, 1):
    if white_bg_pattern.search(line) and 'resolvedTheme' not in line:
        print(f"Line {i}: {line.strip()[:100]}")

print(f"\n=== Total lines in file: {len(lines)} ===")
