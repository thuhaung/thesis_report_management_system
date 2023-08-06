import { Request, Response } from "express";
import Student from "../../../database/Student";
import User from "../../../database/User";
import { Model } from "sequelize";

const getInstructor = async (req: Request, res: Response) => {
    const studentId: string = req.body.student_id.toUpperCase();

    const student: Model | null = await Student.findOne({where: {student_id: studentId}});

    if (!student) {
        res.status(400).send("User not found.");
    }
    else {
        const instructorId: string = student.dataValues.instructor_id;
        const instructor: Model | null = await User.findOne({where: {id: instructorId}});

        res.status(200).send({instructor_id: instructorId, instructor_name: instructor?.dataValues.full_name});
    }
}

export default getInstructor;