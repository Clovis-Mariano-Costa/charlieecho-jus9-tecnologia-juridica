import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const privateDrivePath = 'G:\\Meu Drive\\charlieecho-jus9-tecnologia-juridica';

const requiredFiles = [
  'ORIENTACOES/REGRA_CONTINUIDADE_PUBLICO_PRIVADO_CHARLIE_FOX_IAS.md',
  'ORIENTACOES/REGRA_REPOSITORIO_PRIVADO_GOOGLE_DRIVE_CHARLIE_ECHO.md',
  'ORIENTACOES/RECADO_PARA_PROXIMA_IA_CONTINUIDADE_PUBLICO_PRIVADO_v1_0.md',
  'GOVERNANCA/AULA_PUBLICA_SOFTWARE_LIVRE_AUTORIA_SEGREDOS_CHARLIE_ECHO.md',
  'GOVERNANCA/DIARIO_DE_EVOLUCAO_CHARLIE_ECHO.md',
  'VERSIONAMENTO_CONTINUIDADE_PUBLICO_PRIVADO_v1_0.md'
];

const requiredTerms = [
  'software livre',
  'autoria preservada',
  'PUBLICO',
  'INTERNO',
  'SIGILOSO',
  'COFRE',
  'segredo',
  'aula'
];

const missing = [];
const corpusParts = [];

for (const relativeFile of requiredFiles) {
  const absoluteFile = path.join(root, relativeFile);
  if (!fs.existsSync(absoluteFile)) {
    missing.push(relativeFile);
    continue;
  }

  const content = fs.readFileSync(absoluteFile, 'utf8');
  corpusParts.push(content);
}

const corpus = corpusParts.join('\n\n').toLowerCase();
const weak = requiredTerms
  .filter((term) => !corpus.includes(term.toLowerCase()))
  .map((term) => `corpo documental :: termo ausente: ${term}`);

const privateDriveExists = fs.existsSync(privateDrivePath);

const result = {
  ok: missing.length === 0 && weak.length === 0 && privateDriveExists,
  root,
  privateDrivePath,
  privateDriveExists,
  requiredFiles: requiredFiles.length,
  missing,
  weak
};

console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
  process.exitCode = 1;
}
