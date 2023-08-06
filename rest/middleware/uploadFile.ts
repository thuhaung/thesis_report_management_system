import { Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

const maxFileSize: number = 31457280; // 30mb
let id: string;
let destinationPath: string;

const storage = multer.diskStorage({
    destination: (
        req: Request, 
        file: Express.Multer.File, 
        callback: DestinationCallback
    ) => {
        destinationPath = path.join(process.env.ROOT_DIR!, process.env.APP_NAME!, "files");
        callback(null,  destinationPath);
    },
    filename: (
        req: Request, 
        file: Express.Multer.File, 
        callback: FileNameCallback
    ) => {
        id = uuidv4();
        callback(null, id);
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, callback : FileFilterCallback) => {
    const fileType: string = ".pdf";
    if (!file.originalname.includes(fileType)) {
        return callback(new Error("Incorrect file type."));
    }

    const fileSize = parseInt(req.headers["content-length"]!);
    if (fileSize > maxFileSize) {
        return callback(new Error("File exceeds limit."));
    }
    
    callback(null, true);
}

export const uploadFile = multer({ 
    storage: storage,
    limits: {
        fileSize: maxFileSize
    },
    fileFilter: fileFilter
}).single("file");
