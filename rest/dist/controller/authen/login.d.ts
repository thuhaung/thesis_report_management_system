import { Request, Response } from "express";
declare const login: (req: Request, res: Response) => Promise<void>;
export default login;
