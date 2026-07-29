import os, re

base_path = r'd:\sohel-shaikh-portfolio\src\app\(admin)\admin\(dashboard)'

files_to_update = {
    'projects/actions.ts': {
        'old_import': \"import { revalidateTag } from 'next/cache'\",
        'new_import': \"import { revalidatePath } from 'next/cache'\",
        'replacements': [
            (r\"revalidateTag\('projects', 'max'\)\", r\"revalidatePath('/'); if (projectData && projectData.slug) { revalidatePath('/projects/' + projectData.slug); }\")
        ]
    },
    'certifications/actions.ts': {
        'old_import': \"import { revalidateTag } from 'next/cache'\",
        'new_import': \"import { revalidatePath } from 'next/cache'\",
        'replacements': [
            (r\"revalidateTag\('certifications', 'max'\)\", r\"revalidatePath('/');\")
        ]
    },
    'experiences/actions.ts': {
        'old_import': \"import { revalidateTag } from 'next/cache'\",
        'new_import': \"import { revalidatePath } from 'next/cache'\",
        'replacements': [
            (r\"revalidateTag\('experiences', 'max'\)\", r\"revalidatePath('/');\")
        ]
    },
    'messages/actions.ts': {
        'old_import': \"import { revalidateTag } from 'next/cache'\",
        'new_import': \"import { revalidatePath } from 'next/cache'\",
        'replacements': [
            (r\"revalidateTag\('messages', 'max'\)\", r\"revalidatePath('/admin/messages');\")
        ]
    }
}

for rel_path, config in files_to_update.items():
    full_path = os.path.join(base_path, rel_path)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        content = content.replace(config['old_import'], config['new_import'])
        for old_regex, new_val in config['replacements']:
            content = re.sub(old_regex, new_val, content)
            
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print('Updated ' + rel_path)
    else:
        print('File not found: ' + full_path)
