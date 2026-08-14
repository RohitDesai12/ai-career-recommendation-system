import os
import glob

replacements = {
    'bg-[#07080F]': 'bg-background',
    'bg-[#0E0F1A]': 'bg-card',
    'bg-[#161728]': 'bg-muted',
    'border-[#2C2E4A]': 'border-border',
    'text-[#EEEEF8]': 'text-foreground',
    'text-[#6B6D99]': 'text-muted-foreground',
    'bg-[#4F8EF7]': 'bg-primary',
    'text-[#4F8EF7]': 'text-primary',
    'border-[#4F8EF7]': 'border-primary',
    'bg-[#4FF7B0]': 'bg-success',
    'text-[#4FF7B0]': 'text-success',
    'border-[#4FF7B0]': 'border-success',
    'bg-[#F7934F]': 'bg-secondary',
    'text-[#F7934F]': 'text-secondary',
    'border-[#F7934F]': 'border-secondary',
    'bg-[#F74F8E]': 'bg-destructive',
    'text-[#F74F8E]': 'text-destructive',
    'border-[#F74F8E]': 'border-destructive',
    
    # Opacity variants
    'bg-[#4F8EF7]/20': 'bg-primary/20',
    'bg-[#4F8EF7]/10': 'bg-primary/10',
    'bg-[#4F8EF7]/5': 'bg-primary/5',
    'bg-[#4F8EF7]/90': 'bg-primary/90',
    'border-[#4F8EF7]/30': 'border-primary/30',
    'bg-[#4F8EF7]/30': 'bg-primary/30',
    'from-[#4F8EF7]/20': 'from-primary/20',
    'to-[#9D7FF7]/20': 'to-indigo-500/20',
    'to-[#9D7FF7]': 'to-indigo-500',
    'from-[#4F8EF7]': 'from-primary',
    
    'text-[#9D7FF7]': 'text-indigo-500',
    'bg-[#9D7FF7]': 'bg-indigo-500',
    
    'bg-[#07080F]/80': 'bg-background/80',
    'border-[#2C2E4A]/30': 'border-border/30',
    'bg-[#4FF7B0]/20': 'bg-success/20',
    'border-[#4FF7B0]/30': 'border-success/30',
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
