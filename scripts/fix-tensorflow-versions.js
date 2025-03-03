const fs = require('fs');
const path = require('path');

// Path to package-lock.json
const packageLockPath = path.resolve(__dirname, '../package-lock.json');

// Check if package-lock.json exists
if (!fs.existsSync(packageLockPath)) {
  console.log('package-lock.json not found. Run npm install first.');
  process.exit(0);
}

// Read package-lock.json
const packageLockContent = fs.readFileSync(packageLockPath, 'utf8');
const packageLock = JSON.parse(packageLockContent);

// TensorFlow packages that should have matching versions
const tfPackages = [
  '@tensorflow/tfjs',
  '@tensorflow/tfjs-core',
  '@tensorflow/tfjs-backend-cpu',
  '@tensorflow/tfjs-backend-wasm',
  '@tensorflow/tfjs-backend-webgl',
  '@tensorflow/tfjs-converter'
];

// Check target version
const targetVersion = '3.21.0';

let modified = false;

// Ensure all TensorFlow packages have the same version
if (packageLock.packages) {
  Object.keys(packageLock.packages).forEach(pkg => {
    const pkgName = pkg.replace('node_modules/', '');
    
    // If this is a TensorFlow package, ensure it has the correct version
    if (tfPackages.some(tfPkg => pkgName === tfPkg || pkgName.startsWith(`${tfPkg}@`))) {
      if (packageLock.packages[pkg].version !== targetVersion) {
        console.log(`Updating ${pkgName} to version ${targetVersion}`);
        packageLock.packages[pkg].version = targetVersion;
        modified = true;
      }
    }
    
    // Also check dependencies of this package
    if (packageLock.packages[pkg].dependencies) {
      tfPackages.forEach(tfPkg => {
        if (packageLock.packages[pkg].dependencies[tfPkg] && 
            packageLock.packages[pkg].dependencies[tfPkg] !== targetVersion) {
          console.log(`Updating dependency ${tfPkg} in ${pkgName} to version ${targetVersion}`);
          packageLock.packages[pkg].dependencies[tfPkg] = targetVersion;
          modified = true;
        }
      });
    }
  });
}

// Save changes if modifications were made
if (modified) {
  console.log('Saving changes to package-lock.json');
  fs.writeFileSync(packageLockPath, JSON.stringify(packageLock, null, 2), 'utf8');
  console.log('TensorFlow package versions have been synchronized to', targetVersion);
} else {
  console.log('All TensorFlow package versions are already consistent');
}
