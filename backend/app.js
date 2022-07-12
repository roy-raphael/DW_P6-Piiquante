import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/user.js';
import saucesRoutes from './routes/sauce.js';

const SAUCES_IMAGES_SAVE_PATH = 'images';

dotenv.config();

// Check the dotenv file
let dotenvMissingVariables = [];
if (process.env.DB_PROTOCOL === undefined) dotenvMissingVariables.push("DB_PROTOCOL");
if (process.env.DB_USERNAME === undefined) dotenvMissingVariables.push("DB_USERNAME");
if (process.env.DB_PASSWORD === undefined) dotenvMissingVariables.push("DB_PASSWORD");
if (process.env.DB_HOST === undefined) dotenvMissingVariables.push("DB_HOST");
if (process.env.DB_NAME === undefined) dotenvMissingVariables.push("DB_NAME");
if (process.env.RSA_PRIVATE_KEY === undefined) dotenvMissingVariables.push("RSA_PRIVATE_KEY");
if (process.env.RSA_PUBLIC_KEY === undefined) dotenvMissingVariables.push("RSA_PUBLIC_KEY");
if (process.env.JWT_ISSUER === undefined) dotenvMissingVariables.push("JWT_ISSUER");
if (process.env.JWT_AUDIENCE === undefined) dotenvMissingVariables.push("JWT_AUDIENCE");
if (dotenvMissingVariables.length !== 0) {
    let errorMessage = "DOTENV file not complete (missing : ";
    dotenvMissingVariables.forEach(element => errorMessage += element + ", ");
    console.error(errorMessage.split(', ').slice(0, -1).join(', ') + ")");
    process.exit(1);
}

const app = express();

mongoose.connect(`${process.env.DB_PROTOCOL}://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/?retryWrites=true&w=majority`,
{ useNewUrlParser: true, useUnifiedTopology: true , dbName: process.env.DB_NAME})
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/images', express.static(path.join(__dirname, SAUCES_IMAGES_SAVE_PATH)));

app.use('/api/auth', userRoutes);
app.use('/api/sauces', saucesRoutes);

process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Process terminated');
    });
});

export default app;