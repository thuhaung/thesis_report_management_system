import { Request, Response } from "express";
import Student from "../../../database/Student";
import { Model } from "sequelize";

const getStudentInfo = async (req: Request, res: Response) => {
    const studentId: string = req.body.student_id.toUpperCase();

    const student: Model | null = await Student.findOne({where: {student_id: studentId}});

    if (!student) {
        res.status(400).send("User not found.");
    }
    else {
        res.status(200).send(student.dataValues);
    }
}

export default getStudentInfo;