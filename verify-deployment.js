#!/usr/bin/env node

/**
 * Pre-Deployment Verification Script
 * Run this before deploying to Render to catch common issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Smart Medicine - Pre-Deployment Verification\n');
console.log('━'.repeat(50));

let issuesFound = 0;
let warnings = 0;

// Check 1: Verify package.json files exist
console.log('\n✓ Checking package.json files...');
const backendPackage = path.join(__dirname, 'backend', 'package.json');
const frontendPackage = path.join(__dirname, 'frontend', 'package.json');

if (fs.existsSync(backendPackage)) {
  console.log('  ✅ Backend package.json found');
  const pkg = JSON.parse(fs.readFileSync(backendPackage, 'utf8'));
  if (!pkg.scripts || !pkg.scripts.start) {
    console.log('  ⚠️  Warning: Backend missing "start" script');
    warnings++;
  }
} else {
  console.log('  ❌ Backend package.json NOT found');
  issuesFound++;
}

if (fs.existsSync(frontendPackage)) {
  console.log('  ✅ Frontend package.json found');
  const pkg = JSON.parse(fs.readFileSync(frontendPackage, 'utf8'));
  if (!pkg.scripts || !pkg.scripts.build) {
    console.log('  ⚠️  Warning: Frontend missing "build" script');
    warnings++;
  }
} else {
  console.log('  ❌ Frontend package.json NOT found');
  issuesFound++;
}

// Check 2: Verify .env.example files exist
console.log('\n✓ Checking .env.example files...');
const backendEnvExample = path.join(__dirname, 'backend', '.env.example');
const frontendEnvExample = path.join(__dirname, 'frontend', '.env.example');

if (fs.existsSync(backendEnvExample)) {
  console.log('  ✅ Backend .env.example found');
} else {
  console.log('  ⚠️  Backend .env.example NOT found');
  warnings++;
}

if (fs.existsSync(frontendEnvExample)) {
  console.log('  ✅ Frontend .env.example found');
} else {
  console.log('  ⚠️  Frontend .env.example NOT found');
  warnings++;
}

// Check 3: Verify .env files are NOT committed
console.log('\n✓ Checking .gitignore...');
const gitignore = path.join(__dirname, '.gitignore');

if (fs.existsSync(gitignore)) {
  const gitignoreContent = fs.readFileSync(gitignore, 'utf8');
  if (gitignoreContent.includes('.env')) {
    console.log('  ✅ .env files are properly ignored');
  } else {
    console.log('  ⚠️  Warning: .env not found in .gitignore');
    warnings++;
  }
} else {
  console.log('  ⚠️  Warning: .gitignore not found');
  warnings++;
}

// Check 4: Verify render.yaml exists
console.log('\n✓ Checking Render configuration...');
const renderYaml = path.join(__dirname, 'render.yaml');

if (fs.existsSync(renderYaml)) {
  console.log('  ✅ render.yaml found (Blueprint ready)');
} else {
  console.log('  ⚠️  render.yaml not found (manual deployment required)');
  warnings++;
}

// Check 5: Verify server.js exists
console.log('\n✓ Checking server files...');
const serverJs = path.join(__dirname, 'backend', 'server.js');

if (fs.existsSync(serverJs)) {
  console.log('  ✅ Backend server.js found');
} else {
  console.log('  ❌ Backend server.js NOT found');
  issuesFound++;
}

// Check 6: Verify frontend index.html exists
const indexHtml = path.join(__dirname, 'frontend', 'public', 'index.html');

if (fs.existsSync(indexHtml)) {
  console.log('  ✅ Frontend public/index.html found');
} else {
  console.log('  ❌ Frontend public/index.html NOT found');
  issuesFound++;
}

// Check 7: Look for hardcoded localhost URLs
console.log('\n✓ Checking for hardcoded localhost URLs...');
let hardcodedUrlsFound = false;

const checkFile = (filePath, relativePath) => {
  if (fs.existsSync(filePath) && filePath.endsWith('.js') || filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('localhost:5001') || content.includes('localhost:5000')) {
      console.log(`  ⚠️  Found localhost URL in: ${relativePath}`);
      hardcodedUrlsFound = true;
      warnings++;
    }
  }
};

// Check common files
const servicePath = path.join(__dirname, 'frontend', 'src', 'services', 'api.ts');
checkFile(servicePath, 'frontend/src/services/api.ts');

if (!hardcodedUrlsFound) {
  console.log('  ✅ No hardcoded localhost URLs found');
}

// Check 8: Verify important routes exist
console.log('\n✓ Checking route files...');
const routes = [
  'auth.js',
  'medications.js',
  'health.js',
  'emergencyContacts.js',
  'careRecipients.js'
];

let allRoutesExist = true;
routes.forEach(route => {
  const routePath = path.join(__dirname, 'backend', 'routes', route);
  if (!fs.existsSync(routePath)) {
    console.log(`  ⚠️  Route missing: ${route}`);
    warnings++;
    allRoutesExist = false;
  }
});

if (allRoutesExist) {
  console.log('  ✅ All route files present');
}

// Summary
console.log('\n' + '━'.repeat(50));
console.log('\n📊 Verification Summary:');
console.log(`  Critical Issues: ${issuesFound}`);
console.log(`  Warnings: ${warnings}`);

if (issuesFound === 0 && warnings === 0) {
  console.log('\n✅ All checks passed! Ready for deployment.');
  console.log('\n📝 Next steps:');
  console.log('  1. Push your code to GitHub');
  console.log('  2. Go to render.com and create a Blueprint');
  console.log('  3. Select your repository');
  console.log('  4. Add MongoDB URI in backend environment');
  console.log('  5. Deploy! 🚀');
} else if (issuesFound === 0) {
  console.log('\n⚠️  Warnings found, but deployment should work.');
  console.log('   Review warnings above and fix if needed.');
} else {
  console.log('\n❌ Critical issues found! Please fix before deploying.');
  console.log('   See errors above for details.');
}

console.log('\n' + '━'.repeat(50));
console.log('\n💡 Tip: Check RENDER_DEPLOYMENT_CHECKLIST.md for detailed instructions\n');

process.exit(issuesFound > 0 ? 1 : 0);
