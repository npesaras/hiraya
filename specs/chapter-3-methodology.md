CHAPTER 3
METHODOLOGY

This chapter presents the methodology that guides the development and evaluation of the Faculty Scholarship Grant Management and Evaluation System (FSMES). As an applied capstone project, the study focuses on solving an actual institutional workflow problem rather than testing abstract theoretical relationships. The chapter is organized around the research design, system development tools and technologies, participants and sampling, research instruments, data collection procedure, data analysis plan, and ethical considerations. It remains anchored to the scope of FSMES, which covers the application submission and panel evaluation stages of the APDP workflow at Mindanao State University-Iligan Institute of Technology (MSU-IIT).

3.1 Research Design

This study employs an applied system development research design. The purpose of the study is not to test hypotheses or validate a theory, but to design, develop, and evaluate a web-based system that addresses the documented workflow problems of the Institute Academic Scholarship Panel (IASP) scholarship process at MSU-IIT. This design is appropriate because the identified problem involves operational inefficiencies in document submission, application monitoring, and evaluation handling, all of which require a practical digital intervention rather than a theory-driven explanatory model.

The study adopts the Design Sprint methodology proposed by Knapp et al. (2016). Design Sprint is selected because it provides a structured and user-centered process for moving from a real organizational problem to a testable prototype through five sequential phases: Understand, Define, Sketch, Prototype, and Test. This methodology is appropriate for FSMES because the system needs to respond directly to the actual experiences of its intended users, namely faculty applicants and Academic Scholarship Panel members, rather than to assumptions made by the developers. It also aligns with the prototype-oriented evaluation used in the study, which involves six participants, functionality testing, and PSSUQ-based usability assessment.

As an applied capstone, the study follows a solution-oriented logic. It begins by examining the existing IASP scholarship workflow, identifying the pain points experienced by its users, translating those pain points into system requirements, building a working prototype, and evaluating the prototype using both functional and usability-based measures. This makes the research design appropriate for the title, objectives, and scope of the project, which center on the development of a web-based workflow system for faculty scholarship management at MSU-IIT.

3.2 System Development Tools and Technologies

The development of FSMES uses a web-based architecture composed of React with TanStack libraries for the frontend, Hono for the backend, and Appwrite for database and authentication services. React is used to build the interactive user interface for faculty applicants and Academic Scholarship Panel members, while TanStack libraries support client-side data handling and responsive interface behavior within the workflow. Hono is used to implement the backend application logic and API routing needed for submission handling, role-bounded actions, and communication between the user interface and the data layer. Appwrite is used as the central service for data storage and user authentication, making it suitable for a prototype that requires centralized records management and controlled access by user role. This toolset is appropriate for FSMES because it supports rapid web-based prototype development while still allowing the researchers to implement the workflow control, access restrictions, and centralized record handling required by the IASP process.

3.3 Participants and Sampling

The study involves six (6) participants composed of five (5) faculty applicants and one (1) Academic Scholarship Panel member from MSU-IIT. These participants are selected because they represent the two primary user groups directly involved in the scoped workflow addressed by FSMES. Faculty applicants represent the application submission side of the process, while the Academic Scholarship Panel member represents the review and evaluation side of the workflow.

The study uses purposive sampling. This sampling method is appropriate because the researchers need participants who have direct experience with or involvement in the faculty scholarship process governed by the APDP. Random sampling is not suitable because the system is not intended for a general user population. Instead, it is designed for a highly specific institutional workflow involving defined stakeholders with role-specific responsibilities.

For faculty applicants, the inclusion criteria are the following:
(1) they are faculty members of MSU-IIT who have experience with, or eligibility for, the scholarship application process; and
(2) they are willing to participate in the interview and testing activities of the study.

For the Academic Scholarship Panel participant, the inclusion criterion is direct involvement in the review, evaluation, or administration of faculty scholarship applications under the IASP process.

The sample size is acceptable for a prototype-level usability evaluation. Nielsen (1994) argued that a small group of representative users is often sufficient to identify the majority of major usability issues in an interface. Therefore, the chosen participant set is appropriate for an undergraduate capstone focused on initial functionality validation and usability feedback rather than large-scale deployment testing. The sample is intended for prototype-level assessment and not for statistical generalization to all possible users of faculty scholarship systems. Because only one Academic Scholarship Panel participant is included, panel-side findings are interpreted as preliminary role-specific feedback rather than as broad evidence of panel-wide usability.

3.4 Research Instruments

The study uses three primary instruments: a structured interview guide, a functionality test case checklist, and a PSSUQ-based usability questionnaire.

3.4.1 Structured Interview Guide

A structured interview guide is used during the early stage of the study to gather information about the existing scholarship application and evaluation process. The guide contains questions related to document preparation, application submission, approval routing, communication practices, status monitoring, record handling, and the common difficulties experienced by the participants. Its purpose is to identify the actual pain points of the current workflow and to generate evidence-based input for the design of FSMES.

The interview guide is appropriate because the study requires a clear understanding of how the current process operates in practice before any system design decisions can be justified. Human-centred design also emphasizes direct user input as a basis for design requirements rather than developer assumption (Maguire, 2001). Through this instrument, the researchers can collect consistent yet detailed stakeholder accounts of the process.

3.4.2 Functionality Test Case Checklist

A functionality test case checklist is used during the Test phase to determine whether the major features of FSMES perform according to their intended requirements. Each test case includes the feature or function being tested, the specific user action to be performed, the expected output, the actual output, and the corresponding pass-or-fail result.

This instrument is appropriate because the study does not only need user impressions; it also needs evidence that the core system features operate correctly.

3.4.3 PSSUQ-Based Usability Questionnaire

A usability questionnaire based on the Post-Study System Usability Questionnaire (PSSUQ) is administered after participants complete the assigned system tasks. The instrument is used to assess participant perceptions of the system in terms of system usefulness, information quality, and interface quality (Lewis, 2002).

This instrument is appropriate because FSMES is intended to be used by actual institutional stakeholders. Therefore, the system has to be not only functional, but also understandable, usable, and appropriate for the workflow it is built to support.

Before use, the research instruments are reviewed by the research adviser to ensure alignment with the objectives of the study, the actual scope of the system, and the clarity of the task and interview prompts. This review is limited to content alignment and clarity checking within the capstone context and is not presented as a separate statistical validation procedure.

3.5 Data Collection Procedure

Data collection follows the sequence of the Design Sprint methodology. Each phase produces an output that informs the succeeding phase. The process is presented below.

3.5.1 Understand Phase

In the Understand phase, the researchers examine the current IASP scholarship application and evaluation workflow. This phase involves reviewing the relevant APDP policy provisions and conducting structured interviews with the selected participants. The purpose of this phase is to identify the operational pain points experienced by both faculty applicants and Academic Scholarship Panel members.

The outputs of this phase are a documented list of workflow problems, a summary of the relevant APDP rules within the scoped process, and an initial process map of the existing scholarship application and evaluation flow.

3.5.2 Define Phase

In the Define phase, the researchers analyze the pain points gathered from the Understand phase and translate them into a clearly bounded design problem. Similar concerns are grouped into themes such as submission difficulty, lack of status visibility, fragmented records, and delayed coordination. The researchers then identify which of these issues can realistically be addressed within the scope of FSMES.

To maintain traceability, the recurring interview themes and relevant APDP provisions are mapped to user roles, workflow steps, proposed features, and corresponding test cases. This mapping serves as the basis for the proposed process model, the priority user needs, the user role structure, and the preliminary functional requirements of FSMES.

This phase produces a refined system direction, a proposed process model, a confirmed set of user needs, a defined user role structure, and the specific workflow problems that the prototype will target.

3.5.3 Sketch Phase

In the Sketch phase, the researchers translate the defined user needs into possible interface layouts, feature groupings, and workflow solutions. Low-fidelity wireframes and solution concepts are produced to determine how faculty applicants and panel members will interact with the system according to their roles. This phase also refines the process model into role-based interaction flow and screen-level interface logic.

Low-fidelity prototyping is appropriate at this stage because it allows alternative interface ideas to be explored and refined before full implementation commits the project to the wrong interaction design (Snyder, 2003). This phase ensures that no feature is included in the prototype unless it directly addresses a documented problem identified during the earlier stages. The selected interface logic, feature structure, and workflow logic become the basis of the prototype.

3.5.4 Prototype Phase

In the Prototype phase, the selected solution concept is translated into a functional web-based prototype of FSMES. The frontend of the prototype is built using React with TanStack libraries, the backend services are implemented using Hono, and Appwrite is used for database and authentication services. The prototype implements the key system components required by the study, including account access, digital application submission, document uploading, centralized case organization, review handling, decision recording, and application status updating.

The prototype operationalizes the defined workflow, user roles, and functional requirements in a concrete web-based system architecture. The output of this phase is a working prototype that can be used for actual user evaluation.

3.5.5 Test Phase

In the Test phase, the functional FSMES prototype is evaluated by the six participants of the study. Faculty applicants perform submission-related tasks, while the Academic Scholarship Panel participant performs review and evaluation-related tasks. Functionality testing is conducted first using the structured test case checklist. After task execution, the participants complete the PSSUQ-based usability questionnaire.

The purpose of this phase is to determine whether FSMES works as intended and whether users perceive it as useful, understandable, and appropriate to the current scholarship workflow. This phase generates functionality results, PSSUQ usability scores, and an evaluated FSMES prototype.

3.6 Data Analysis Plan

The study uses qualitative and descriptive methods of analysis consistent with the applied and developmental nature of the project.

3.6.1 Analysis of Interview Data

Interview responses gathered during the Understand phase are analyzed through thematic grouping. The researchers first read the responses in full, identify recurring workflow concerns, and highlight repeated issues raised across participants. Similar responses are then grouped into themes such as manual document handling, delayed routing, lack of status visibility, fragmented records, and difficulty tracking application progress. The identified themes are then reviewed against the relevant APDP provisions to determine which workflow requirements are policy-driven and which user needs emerge from actual stakeholder experience.

These themes are then translated into the proposed process model, the feature set, the role-based structure, and the functional requirements of FSMES. This ensures that the proposed system remains grounded in the actual institutional problem rather than in generic assumptions.

3.6.2 Functionality Analysis

The functionality test results are analyzed using pass-or-fail determination per test case. A system feature is considered functional if the actual output matches the expected output specified in the checklist. The overall performance of the prototype is then summarized by counting the number of successfully executed test cases.

The functionality rate may be computed using the formula:

Functionality Rate = (Number of Passed Test Cases / Total Number of Test Cases) x 100

The functionality rate is interpreted descriptively as the proportion of tested features that operate as expected. At the prototype level, FSMES is considered functionally acceptable if the included core test cases pass and no workflow-blocking error occurs during task execution. This interpretation is limited to prototype performance and does not by itself establish full institutional deployment readiness.

3.6.3 Usability Analysis

The responses to the PSSUQ-based questionnaire are analyzed using descriptive statistics, particularly the mean. Mean scores are computed for system usefulness, information quality, and interface quality. An overall mean score is also computed to summarize the general usability perception of the participants.

In the PSSUQ, lower mean scores indicate more favorable usability perceptions, while higher mean scores indicate greater usability concerns (Lewis, 2002). Therefore, scores closer to 1.00 are interpreted as more positive evaluations of FSMES. Because the study involves a small and purposively selected sample, these usability results are interpreted as prototype-level feedback rather than as population-level generalizations or proof of institution-wide acceptability.

3.7 Ethical Considerations

The study observes ethical principles appropriate to capstone research involving human participants and institutional workflow information. Before participation, all participants are informed of the purpose of the study, the nature of their involvement, and the tasks they are expected to perform. Participation is voluntary, and informed consent is obtained before the conduct of interviews and system testing.

To protect participant privacy, names and personally identifying information are not disclosed in the manuscript. All responses are treated as confidential and are used solely for academic and research purposes related to the development and evaluation of FSMES.

The study also observes the principles of the Data Privacy Act of 2012 (Republic Act No. 10173) in handling participant information and workflow-related records. Because the study involves an internal institutional process at MSU-IIT, only information necessary for the study's objectives is gathered and discussed. The researchers further ensure that the study is conducted solely for academic and applied problem-solving purposes and that no conflict of interest exists in the development of the system.
