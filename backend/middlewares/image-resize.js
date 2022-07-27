import fs from 'fs';
import sharp from 'sharp';

const SAUCES_IMAGES_SAVE_PATH = 'images';
const SAUCES_IMAGES_MAX_LENGTH = 500;

async function resizeImage(req, res, next) {
    if (! req.file) {
        return next();
    }
    
    const tmpFileRelativePath = `${SAUCES_IMAGES_SAVE_PATH}/resized-${req.file.filename}`;
    const fileRelativePath = `${SAUCES_IMAGES_SAVE_PATH}/${req.file.filename}`;

    let image = sharp(req.file.path);
    let meta = await image.metadata();

    if (meta.width > SAUCES_IMAGES_MAX_LENGTH && meta.height > SAUCES_IMAGES_MAX_LENGTH) {
        // Resize the image
        try {
            const format = meta.format;
            image.rotate() // rotates the image using the original orientation in the EXIF data
            image.resize(SAUCES_IMAGES_MAX_LENGTH, SAUCES_IMAGES_MAX_LENGTH, {fit: 'outside'});
            if (format === "jpg" || format === "jpeg") {
                image.jpeg({ quality: 90 });
            } else if (format === "png") {
                image.png({ compressionLevel: 9, adaptiveFiltering: true });
            }
            await image.toFile(tmpFileRelativePath);
        } catch (error) {
            console.error(error);
            return;
        }
        // Check the new file size
        let newSize = 0;
        try {
            newSize = fs.statSync(tmpFileRelativePath).size;
        } catch (error) {
            console.log(error);
        }
        // Keep only one file
        if (req.file.size > newSize) {
            // Replace the old image with the resized one
            fs.unlink(fileRelativePath, (error) => {
                if (error) {
                    console.log("Original image could not be deleted (now trying to delete resized image)");
                    console.error(error);
                    fs.unlink(tmpFileRelativePath, (error) => {
                        console.log("Resized image could not be deleted");
                        console.error(error);
                        throw error;
                    });
                    next();
                    throw error;
                } else {
                    fs.rename(tmpFileRelativePath, fileRelativePath, (error) => {
                        if (error) {
                            console.log("Resized image could not be renamed");
                            console.error(error);
                            throw error;
                        }
                        return next();
                    });
                }
            });
        } else {
            // Delete the resized image and keep the original one
            fs.unlink(tmpFileRelativePath, (error) => {
                if (error) {
                    console.log("Resized image could not be deleted");
                    console.error(error);
                    throw error;
                }
            });
        }
    } else {
        // No need to resize the image
        return next();
    }
}

export default resizeImage;