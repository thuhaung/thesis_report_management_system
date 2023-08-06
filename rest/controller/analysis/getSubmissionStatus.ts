import { Request, Response } from "express";
import { Model } from "sequelize";
import Student from "../../database/Student";
import User from "../../database/User";
import Thesis from "../../database/Thesis";

const getSubmissionStatus = async (req: Request, res: Response) => {
    const data: {[key: string]: any} = {array: []};
    const students: Model[] | null = await Student.findAll();

    if (students) {
        for (let i = 0; i < students.length; i++) {
            const element: {[key: string]: any} = {
                student_id: students[i]?.dataValues.student_id
            }

            const user: Model | null = await User.findOne({where: {id: element.student_id}});
            const submissions: Model[] | null = await Thesis.findAll({where: {student_id: element.student_id}});
            
            if (submissions?.length > 0) {
                element.submitted = true;

                const latestSubmission: Model = submissions[submissions.length - 1];
                const instructor: Model | null = await User.findOne({where: {id: latestSubmission.dataValues.instructor_id}});

                element.thesis_name = latestSubmission.dataValues.thesis_name;
                element.submitted_time = latestSubmission.dataValues.submitted_time;
                element.instructor_name = instructor?.dataValues.full_name;
            }
            else {
                element.submitted = false;
                element.thesis_name = "";
                element.submitted_time = "";
                element.instructor_name = "";
            }

            element.full_name = user?.dataValues.full_name;

            data.array.push(element);
        }

        res.status(200).send(data);
    }
    else {
        res.status(500).send("Server error.");
    }
}

export default getSubmissionStatus;