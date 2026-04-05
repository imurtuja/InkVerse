const fs = require('fs');
const base64 = fs.readFileSync('public/default-avatar.jpg', 'base64');
fs.writeFileSync('src/lib/defaultAvatarBase64.js', `export const DEFAULT_AVATAR_B64 = "data:image/jpeg;base64,${base64}";`);
console.log("Done");
