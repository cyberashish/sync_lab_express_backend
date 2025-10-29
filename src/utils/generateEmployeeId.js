export function generateEmployeeId() {
    const length = 5;
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10); // generates a digit from 0–9
    }
    return result;
  }
  