import { Request, Response } from "express";
declare const getUserInfo: (req: Request, res: Response) => Promise<void>;
export default getUserInfo;
