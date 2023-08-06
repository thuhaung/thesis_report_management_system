import { Express } from "express";
import uploadThesis from "./controller/file_upload/uploadThesis";
import { uploadFile } from "./middleware/uploadFile";
import getReport from "./controller/report/getReport";
import pollReport from "./controller/report/pollReport";
import getStudentSubmissions from "./controller/user/instructor/getStudentSubmissions";
import login from "./controller/authen/login";
import getThesisInfo from "./controller/report/getThesisInfo";
import getUserInfo from "./controller/user/getUserInfo";
import getStudentInfo from "./controller/user/student/getStudentInfo";
import getAllSubmissions from "./controller/user/student/getAllSubmissions";
import downloadFile from "./controller/file_upload/downloadFile";
import giveFeedback from "./controller/user/instructor/giveFeedback";
import getFeedback from "./controller/report/getFeedback";
import getGuidelines from "./controller/report/getGuidelines";
import editDeadline from "./controller/user/admin/editDeadline";
import sendNotification from "./controller/user/admin/sendNotification";
import viewNotification from "./controller/user/viewNotification";
import getDeadline from "./controller/user/admin/getDeadline";
import getAllNotifications from "./controller/user/admin/getAllNotifications";
import getSubmissionStatus from "./controller/analysis/getSubmissionStatus";
import getNewNotification from "./controller/user/getNewNotification";
import getInstructor from "./controller/user/student/getInstructor";

const Router = (app: Express) => {
    app.post("/login", login);
    app.post("/upload-thesis", uploadFile, uploadThesis);
    app.post("/download-file", downloadFile);
    app.post("/get-thesis-info", getThesisInfo);
    app.post("/get-user-info", getUserInfo);
    app.post("/get-instructor", getInstructor);
    app.post("/get-student-info", getStudentInfo);
    app.post("/get-all-submissions", getAllSubmissions);
    app.post("/get-report", getReport);
    app.post("/poll-report", pollReport);
    app.post("/give-feedback", giveFeedback);
    app.post("/get-feedback", getFeedback);
    app.post("/get-submissions", getStudentSubmissions);
    app.get("/get-guidelines", getGuidelines);
    app.get("/get-deadline", getDeadline);
    app.post("/edit-deadline", editDeadline);
    app.get("/get-all-notifications", getAllNotifications);
    app.post("/send-notification", sendNotification);
    app.post("/view-notification", viewNotification);
    app.post("/get-new-notifications", getNewNotification)
    app.get("/get-submission-status", getSubmissionStatus);
}

export default Router;