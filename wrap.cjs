const fs = require('fs');

const files = [
  'src/components/admin/ProjectForm.tsx',
  'src/components/admin/CaseStudyForm.tsx',
  'src/components/admin/CertificationForm.tsx',
  'src/components/admin/ExperienceForm.tsx',
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Add import if not exists
  if (!content.includes('ParticleWrapper')) {
    content = content.replace(
      "import { motion } from 'motion/react'",
      "import { motion } from 'motion/react'\nimport { ParticleWrapper } from './ParticleWrapper'"
    );
  }

  // Wrap inputs
  // <input ... />
  content = content.replace(/(<input[\s\S]*?\/>)/g, '<ParticleWrapper>\n$1\n</ParticleWrapper>');

  // Wrap textareas
  // <textarea ... /> or <textarea ... ></textarea>
  content = content.replace(/(<textarea[\s\S]*?\/>)/g, '<ParticleWrapper>\n$1\n</ParticleWrapper>');
  content = content.replace(/(<textarea[\s\S]*?>[\s\S]*?<\/textarea>)/g, '<ParticleWrapper>\n$1\n</ParticleWrapper>');

  // Fix checkboxes
  content = content.replace(/<ParticleWrapper>\n(<input[^>]+type="checkbox"[\s\S]*?\/>)\n<\/ParticleWrapper>/g, '$1');

  fs.writeFileSync(file, content);
}
