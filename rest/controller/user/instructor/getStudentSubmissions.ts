import { Request, Response } from "express";
import User from "../../../database/User";
import Thesis from "../../../database/Thesis";
import { Model } from "sequelize";
import { json } from "body-parser";


const getStudentSubmissions = async (req: Request, res: Response) => {
    const instructorId = req.body.instructor_id.toUpperCase();
    const instructor: Model | null = await User.findOne({where: {id: instructorId}});

    if (!instructor) {
        res.status(400).send("Instructor doesn't exist.");
    }
    else {
        const submissions: Model[] | null = await Thesis.findAll({where: {instructor_id: instructorId}});
        const finalSubmissions: Model[] | null = [];

        const students: string[] = [];

        for (let i = 0; i < submissions.length; i++) {
            if (!students.includes(submissions[i].dataValues.student_id)) {
                const studentId: string = submissions[i].dataValues.student_id;
                students.push(studentId);
                
                const studentSubmissions = submissions.filter(submission => submission.dataValues.student_id === studentId);
                let newestSubmission: Model | null = studentSubmissions[0];
    
                for (let j = 0; j < studentSubmissions.length; j++) {
                    if (new Date(studentSubmissions[j].dataValues.submitted_time) > new Date(newestSubmission.dataValues.submitted_time)) {
                        newestSubmission = studentSubmissions[j];
                    }
                }
    
                finalSubmissions.push(newestSubmission);
            }
        }

        for (let i = 0; i < finalSubmissions.length; i++) {
            const user: Model | null = await User.findOne({where: {id: finalSubmissions[i].dataValues.student_id}});
            finalSubmissions[i].dataValues.full_name = user?.dataValues.full_name;
        }

        const submissionData = {
            submissions: finalSubmissions,
            count: finalSubmissions.length
        }

        res.status(200).send(submissionData);
    }
}

export default getStudentSubmissions;
