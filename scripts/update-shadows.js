const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Pattern to match shadow styles
  const shadowPattern = /(shadowColor:\s*['"]#[0-9a-fA-F]+['"],\s*shadowOffset:\s*\{\s*width:\s*([-0-9.]+),\s*height:\s*([-0-9.]+)\s*\},\s*shadowOpacity:\s*([0-9.]+),\s*shadowRadius:\s*([0-9.]+)(,\s*elevation:\s*([0-9]+))?)/g;
  
  // Replace shadow styles with boxShadow
  const newContent = content.replace(shadowPattern, (match, p1, width, height, opacity, radius, p6, elevation) => {
    const shadowX = parseFloat(width);
    const shadowY = parseFloat(height);
    const shadowOpacity = parseFloat(opacity);
    const shadowRadius = parseFloat(radius);
    
    // Convert to boxShadow format
    const boxShadow = `boxShadow: '${shadowX}px ${shadowY}px ${shadowRadius}px rgba(0, 0, 0, ${shadowOpacity})'`;
    
    // Keep elevation if it exists
    const elevationStr = elevation ? `,\n    elevation: ${elevation} // Keep elevation for Android` : '';
    
    return `${boxShadow}${elevationStr}`;
  });
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated shadows in ${path.relative(projectRoot, filePath)}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.includes('node_modules') && !file.name.startsWith('.')) {
      processDirectory(fullPath);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.jsx') || file.name.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

// Start processing from the project root
processDirectory(projectRoot);
console.log('Shadow update complete!');
