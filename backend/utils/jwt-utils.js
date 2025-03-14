import fs from 'fs';
import jwt from 'jsonwebtoken';
import process from './load-env.js';

const jwtIssuer = process.env.JWT_ISSUER;
const jwtAudience = process.env.JWT_AUDIENCE;
var privateKEY = '';
var publicKEY = '';

try {
    // use 'utf8' to get string instead of byte array
    privateKEY = fs.readFileSync(process.env.RSA_PRIVATE_KEY, 'utf8');
    publicKEY = fs.readFileSync(process.env.RSA_PUBLIC_KEY, 'utf8');
} catch(error) {
    console.error(error);
    process.kill(process.pid, 'SIGTERM');
}

export function sign(payload, userEmail) {
  var signOptions = {
      issuer:  jwtIssuer,
      subject:  userEmail,
      audience:  jwtAudience,
      expiresIn:  "12h",
      algorithm:  "RS256"    
  };
  return jwt.sign(payload, privateKEY, signOptions);
}

export function verify(token, userEmail) {
    var verifyOptions = {
        issuer:  jwtIssuer,
        subject:  userEmail,
        audience:  jwtAudience,
        expiresIn:  "12h",
        algorithms:  ["RS256"]
    };
    return jwt.verify(token, publicKEY, verifyOptions);
}

export function decode(token) {
    return jwt.decode(token, {complete: true});
    //returns null if token is invalid
}