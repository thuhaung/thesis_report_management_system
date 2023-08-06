import { Request, Response } from "express";
declare const downloadFile: (req: Request, res: Response) => Promise<void>;
export default downloadFile;
