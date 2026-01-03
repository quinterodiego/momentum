/**
 * Script para verificar que las variables de entorno estén configuradas
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

console.log('🔍 Verificando configuración de variables de entorno...\n');

if (!fs.existsSync(envPath)) {
  console.error('❌ No se encontró el archivo .env.local');
  console.log('\n📝 Crea un archivo .env.local en la raíz del proyecto con:');
  console.log(`
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secret_aqui
  `);
  process.exit(1);
}

require('dotenv').config({ path: envPath });

const requiredVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
];

let allSet = true;

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value || value.includes('aqui') || value.includes('tu_')) {
    console.error(`❌ ${varName} no está configurado correctamente`);
    allSet = false;
  } else {
    console.log(`✅ ${varName} está configurado`);
  }
});

if (allSet) {
  console.log('\n✨ ¡Todas las variables están configuradas!');
  console.log('\n🚀 Puedes ejecutar: npm run dev');
} else {
  console.log('\n⚠️  Por favor, completa todas las variables en .env.local');
  console.log('\n📚 Consulta SETUP.md para más información');
  process.exit(1);
}

