import os
import glob

replacements = {
    'bg-[#2C2E4A]': 'bg-slate-200',
    'stroke="#2C2E4A"': 'stroke="#e2e8f0"',
    '#2C2E4A 1px': '#e2e8f0 1px',
}

files = glob.glob('src/**/*.tsx', recursive=True)
count = 0
for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
        count += 1

print(f"Successfully updated {count} files.")
