<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
	<a href="https://blackboard.hcmiu.edu.vn/">
		<img 
			src="https://blackboard.hcmiu.edu.vn/themes/test/images/iu_logo.png" 
			alt="International University logo" 
			width="100" 
			height="100">
	</a>
  	<h2 align="center">
		A System for Thesis Report Management and 
		Evaluation with Event-driven Architecture
	</h2>
</div>

<!-- ABOUT THE PROJECT -->

## 1. About The Project

This project develops an event-driven system that allows for submission, storage and evaluation of undergraduate thesis reports in accordance with the guidelines provided by International University in Ho Chi Minh City, Vietnam.

By implementing Natural Language Processing techniques, the system generates relatively quick and accurate evaluation that encourages students to revise and improve their reports, as well as acts a grading checkpoint that help instructors make informed decisions. 

The event-driven microservices architecture in combination with cloud storage ensures ease of maintainability and scalability of the system, with room for more extensive evaluation services to be implemented in the future. 

#### 1.1. Features
This system consists of:
<ul>
	<li>
		A thesis submission point that allows for multiple attempts.
	</li>
	<li>
		Evaluation services that generate comprehensive feedback based on the provided thesis writing guidelines.
	</li>
	<li>
		An interface that displays information of the thesis document with their visualized evaluation, customized based on the user role.
	</li>
</ul>

#### 1.2. Built With

The primary tools that are used to develop this application are:
- Node.js
- Express.js
- React
- RabbitMQ
- Python libraries
- PostgreSQL
- Google Cloud Storage


<!-- GETTING STARTED -->

## 2. Getting Started

To set up and run the project locally, the following prerequisites should be satisfied before moving to the installation steps.

#### 2.1. Prerequisites

Make sure the tools below are installed. The instructions are given based on different operating systems:
- Docker: Encapsulates the dependencies that are needed to run the application.
https://docs.docker.com/get-docker/
- Git: Allows for cloning of this repository.
https://git-scm.com/book/en/v2/Getting-Started-Installing-Git

#### 2.2. Installation

1. Clone the repository.
```sh
git clone https://github.com/thuhaung/thesis_report_management_system.git
```
2. Create a Google Cloud Storage bucket named <a>thesis_file_bucket</a>.
3. Upload the <a>requirements</a> folder to this bucket.
4. Copy your Google Cloud credentials to <a>google_credentials.json</a>.
5. Edit the submission deadline to your preferred date at line 145 of <a>/postgresql/init.sql</a>. It is recommended that this value should be after the current date on your system, otherwise, submission will be closed.
```sh
INSERT INTO public.deadline (deadline) VALUES (deadline);
```
6. cd to the file path of this project.
```sh
cd file_path
```
7. Run Docker compose command.
```sh
docker compose up -d
```

<!-- USAGE EXAMPLES -->

## 3. Usage

Access <a href="http://localhost:3000" target="_blank">http://localhost:3000</a> on your browser. Sign in with any student ID, instructor ID or admin ID given in the <a>/postgresql/init.sql</a> file. All accounts share the same default password of 123456789.

Examples:
- Student ID: ITITIU19114
- Instructor ID: ITITEACH001
- Admin ID: ITITADMIN01

![Alt text](/readme_images/login.png)
Provide inputs to the thesis submission form. An example thesis <a>/Thesis.pdf</a> is provided for testing purposes.

![Alt text](/readme_images/submission_form.png)

Select any service on the left-hand navigation area to view the evaluation.
![Alt text](/readme_images/result.png)
![Alt text](/readme_images/chart.png)

Options to download the thesis document, services' results, viewing the guidelines and resubmission are available.
![Alt text](/readme_images/options.png)

Instructors can view the thesis reports and evaluations of students they supervise and give manual feedback.
![Alt text](/readme_images/student_submissions.png)
![Alt text](/readme_images/manual_feedback.png)

Admins can edit the deadline, access the list of student submissions, send notifications to students and instructors.
![Alt text](/readme_images/admin.png)


<!-- FUTURE WORK -->
## 4. Future Work
The architecture used to develop this system allows for ease of updating, adding or removing services due to loose coupling. 

New services can be added with the following steps. For example, a service that detects and checks figure captions: 
- Copy a folder of any service and assign it a new name, for example "figure_caption_check". 
- Add the information for this service in the <a>docker-compose.yml</a> file. 
- Add a table for it in <a>/postgresql/init.sql</a>. 
- Update the name of this service in the client's environment variable.
```sh
REACT_APP_SERVICE_LIST: "...,figure_caption_check"
```
- Update the name of this service in the backend's environment variable.
```sh
SERVICE_LIST: "...,figure_caption_check"
```
- If needed, add a requirement (guidelines) file for the service by uploading to its file path <a>/requirements/figure_caption_check/requirement.txt</a> in the cloud storage bucket.
```sh
# example requirement.txt
Figure num.num. Text text text
Correct: Figure 1.1. Tech stack
Incorrect: Figure 1-1 tech stack, Picture 1. Tech stack, 
No figure caption...
```
- The main algorithm can then be updated in <a>/figure_caption_check/processor.py</a>.

<!-- CONTACT -->

## 5. Contact

- LinkedIn: https://www.linkedin.com/in/thuhaung/
- Email: thu.ha2897@gmail.com

<!-- ACKNOWLEDEGMENT -->

## 6. Acknowledgement
First and foremost, I would like to express my gratitude to Dr. Tran Thanh Tung, my advisor. I am thankful to have been given the opportunity to carry out this project under his guidance. Dr. Tung has been incredibly helpful and provided me with valuable advice which I am deeply appreciative of.

I am grateful for the School of Computer Science and Engineering at International University for giving me the essential prerequisite knowledge to conduct this thesis with confidence. It has been a great experience being enrolled in the Computer Science program and studying under knowledgeable instructors.
