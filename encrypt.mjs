import 'dotenv/config'

function modExp(base, exponent, modulus) {
  if (modulus === 1n) return 0; // Any number modulo 1 is 0

  let result = 1n;
  base %= modulus; // Reduce base modulo modulus

  while (exponent > 0n) {
    if (exponent % 2n === 1n) { // If exponent is odd
      result = (result * base) % modulus;
    }
    base = (base * base) % modulus; // Square the base and take modulo
    exponent = BigInt(exponent / 2n); // Halve the exponent
  }
  return result;
}

function encrypt_character(c){
    let n = 5424487271082625687n;
    let e = 2961270702444359377n;
    let step = 20;

    //encrypt chacater
    let s = (modExp(BigInt(c.charCodeAt(0)), e, n)).toString(); 
    
    //pad 0's - makes it easier to decrypt, 20 character chunks -> 1 character
    while(s.length < step){ s = '0' + s; }
    return s;
}

//d > 0 - important
function decrypt_character(c){
    let n = 5424487271082625687n;
    let d = 1413938138571718593n;

    let s = modExp(BigInt(c), d, n);
    return String.fromCharCode(Number(s));
}

function encrypt_json(data){
    //parse data in JSON format
    data = JSON.parse(JSON.stringify(data));
    let encrypted = {};

    //for everything in the object
    Object.keys(data).forEach(key => {        
        let new_data = "";
        let new_key = "";

        //encrypt key
        for (let char of key) {
            new_key += encrypt_character(char);
        }

        //encrypt value
        for (let char of data[key]) {
            new_data += encrypt_character(char);
        }
        
        //add the encrypted data
        encrypted[new_key] = new_data;
    });
    return encrypted;
}

function decrypt_json(data){
    let step = 20;

    //parse data in JSON format
    data = JSON.parse(JSON.stringify(data));
    let decrypted = {};

    //for everything in the object
    Object.keys(data).forEach(key => {        
        //remove plaintext entry
        let new_data = "";
        let new_key = "";

        //decrypt key
        for (let i = 0; i < key.length; i += step) {
            new_key += decrypt_character(key.substring(i, i + step));
        }

        //decrypt data
        for (let i = 0; i < data[key].length; i += step) {
            new_data += decrypt_character(data[key].substring(i, i + step));
        }
        
        //add the decrypted data
        decrypted[new_key] = new_data;
    });
    return decrypted;
}

let json_ex = {
    username: "John Doe",
    password: "12345",
}

console.log(json_ex)
json_ex = encrypt_json(json_ex);
console.log(json_ex)
json_ex = decrypt_json(json_ex);
console.log(json_ex)