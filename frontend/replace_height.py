import os
import glob

replacements = {
    'min-h-screen bg-background': 'w-full',
    'min-h-screen flex flex-col items-center justify-center bg-background': 'w-full flex flex-col items-center justify-center',
    'h-screen bg-background flex': 'w-full flex',
    'min-h-screen bg-background flex': 'w-full flex',
}

files = [
    'src/app/pages/skill-gap.tsx',
    'src/app/pages/resume-analyzer.tsx',
    'src/app/pages/chatbot.tsx',
    'src/app/pages/career-results.tsx',
    'src/app/pages/assessment-form.tsx'
]

count = 0
for filepath in files:
    if os.path.exists(filepath):
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
            
print(f"Updated {count} files matching inner pages context.")
