import multer from 'multer';

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const fullName = file.originalname.split(' ').join('_');
        const name = fullName.split('.').slice(0, -1).join('.');
        const extension = MIME_TYPES[file.mimetype];
        // Get current date at the format : YYYYMMdd_hhmmss (toISOString gives YYYY-MM-ddThh:mm:ss.zzzZ)
        const dateReg = /[-:]/g;
        var date = new Date(Date.now()).toISOString().replace(dateReg, '').replace('T', '_').split('.').slice(0, -1).join();
        callback(null, name + '_' + date + '.' + extension);
    }
});

export default multer({storage: storage}).single('image');