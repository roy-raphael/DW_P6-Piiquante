import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import process from './utils/load-env.js';
import userRoutes from './routes/user.js';
import saucesRoutes from './routes/sauce.js';

const SAUCES_IMAGES_SAVE_PATH = 'images';

const app = express();

mongoose.connect(`${process.env.DB_PROTOCOL}://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/?retryWrites=true&w=majority`,
{ useNewUrlParser: true, useUnifiedTopology: true , dbName: process.env.DB_NAME})
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

app.use(helmet());
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