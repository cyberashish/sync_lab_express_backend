export function generateSimplePassword(name, email) {
    const randomNum = Math.floor(Math.random() * 10000); // 4-digit number
    const symbols = '!@#$%^&*';
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
  
    const namePart = name.slice(0, 3).toLowerCase();        // e.g. "ali"
    const emailPart = email.split('@')[0].slice(-3).toLowerCase(); // e.g. "ice"
  
    return `${namePart}${emailPart}${randomNum}${randomSymbol}`;
  }