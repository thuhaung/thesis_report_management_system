import { Request, Response } from "express";
import Student from "../../../database/Student";
import Thesis from "../../../database/Thesis";
import { Model } from "sequelize";

const getAllSubmissions = async (req: Request, res: Response) => {
    const studentId: string = req.body.student_id.toUpperCase();

    const student: Model | null = await Student.findOne({where: {student_id: studentId}});

    if (!student) {
        res.status(400).send("User not found.");
    }
    else {
        const submissions: Model[] | null = await Thesis.findAll({where: {student_id: studentId}});

        res.status(200).send(submissions);
    }
}

export default getAllSubmissions;