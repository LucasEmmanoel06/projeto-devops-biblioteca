const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      try {
        execSync(`node --check "${fullPath}"`, { stdio: 'pipe' });
      } catch (err) {
        console.error(`Erro de sintaxe no arquivo: ${fullPath}`);
        if (err.stderr) console.error(err.stderr.toString());
        process.exit(1);
      }
    }
  }
}

console.log('🔍 Verificando sintaxe dos arquivos JavaScript (src, tests, public/js)...');
checkDir('src');
checkDir('tests');
checkDir('public/js');
console.log('✅ Análise de sintaxe concluída com sucesso! Nenhum erro encontrado.');

