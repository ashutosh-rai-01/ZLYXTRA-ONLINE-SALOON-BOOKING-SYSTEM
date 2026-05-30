const fs = require('fs');
const path = require('path');

const target = "barber";
const ignoreDirs = ['node_modules', '.git', '.gemini', 'dist'];

function searchDir(dir) {
    let results = [];
    let list;
    try {
        list = fs.readdirSync(dir);
    } catch (e) {
        return [];
    }

    list.forEach(file => {
        const fullPath = path.join(dir, file);
        let stat;
        try {
            stat = fs.statSync(fullPath);
        } catch (e) {
            return;
        }

        if (stat.isDirectory()) {
            if (!ignoreDirs.includes(file)) {
                results = results.concat(searchDir(fullPath));
            }
        } else {
            // Read file and search
            try {
                const ext = path.extname(fullPath);
                if (['.js', '.jsx', '.json', '.txt', '.env', '.md'].includes(ext)) {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    if (content.toLowerCase().includes(target)) {
                        results.push(fullPath);
                    }
                }
            } catch (e) {}
        }
    });
    return results;
}

console.log("Searching workspace for 'barber'...");
const found = searchDir('c:\\Users\\hp\\OneDrive\\Desktop\\saloon');
console.log(`\nFound in ${found.length} files:`);
found.forEach(f => console.log(f));
