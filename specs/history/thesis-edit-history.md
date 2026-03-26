# Thesis Edit History

Last updated: 2026-03-12

## Purpose
This file captures the important editing history, decisions, sources, and unresolved issues from the ongoing refinement of the capstone so future review passes can recover context quickly.

## Current Capstone Context
- Working system title in the draft: Faculty Scholarship Grant Management and Evaluation System (FSMES)
- Local institutional process covered by the study: IASP application submission and panel evaluation stages within the broader APDP workflow
- Important scope reminder: FSMES does not cover the full APDP approval chain

## Main Files Reviewed and Refined
- `thesis/chapter-1-introduction.md`
- `thesis/chapter-2-rrl.md`
- `thesis/chapter-3-methodology.md`
- `thesis/reference.md`

## Latest Session Update
- Chapter 2 was refined using the same proposal-voice and panel-defensibility standards applied earlier in Chapters 1 and 3
- The remaining proposal-tense errors were corrected in the Design Sprint discussion, related-systems opening, and related-systems comparisons
- The weak University of Colorado webpage citation was removed and replaced with Uddin et al. (2019) and Republic Act No. 9470
- Section 2.1.5 on usability evaluation was added using Nielsen (1994), Lewis (1995), and Lewis (2002)
- Section 2.1.2 now ties fragmented workflow risks to centralized records and traceability requirements with defensible citation support
- The related-systems opening now states explicit system-selection criteria
- Each related-systems subsection now ends with a direct design implication for FSMES
- The literature synthesis now includes usability evaluation and stronger workflow-control support
- `thesis/reference.md` was updated with Lewis (1995), Republic Act No. 9470, and Uddin et al. (2019), while the University of Colorado entry was removed and DOI links were added where available
- Chapter 3 was revised to align its proposal voice, methodology logic, and evaluation criteria with the same refinement standards applied earlier in Chapter 1
- Chapter 1 was revised again to correct proposal voice and tense consistency
- Student-owned statements about the current problem, proposed system, study scope, limitations, conceptual framework, and definitions were shifted into present tense
- Literature citations and prior-author contributions remained in past tense
- Examples of the correction pattern applied: `remained` to `remains`, `were required` to `are required`, `existed` to `exists`, `was limited` to `is limited`, and `referred to` to `refers to`
- The significance section was also tightened so OVCAA and related offices are framed as indirect beneficiaries if they are not implemented user roles
- This tense rule should be preserved in later proposal chapters unless a section is explicitly reporting completed results
- The missing Design Sprint sentence was added to the final Introduction paragraph so the chapter now bridges more cleanly into the Conceptual Framework
- The Conceptual Framework phases were rewritten from researcher-centered wording into phase-centered wording
- Significance subsection claims were supported using citations already available in the local reference list
- Gkrimpizi et al. (2023) and World Bank (2022) already have complete-looking entries in `thesis/reference.md`, while the MSU-IIT institutional citation year still needs manual verification against the actual title page
- The acronym order in Introduction Paragraph 5 was corrected so the full system name appears before `FSMES`
- Evidence sentences were added to the Conceptual Framework phases using Maguire (2001), Snyder (2003), Nielsen (1994), and Lewis (2002)
- Maguire (2001) and Snyder (2003) were added to `thesis/reference.md` to support the new Conceptual Framework citations
- Lewis (2002) was retained for the Test phase because it is the verified PSSUQ-related source already present in the project references
- Chapter 3 was converted into proposal-consistent present tense so it no longer sounds like a completed study
- A traceability step was added linking APDP provisions and interview themes to user roles, workflow steps, features, test cases, and functional requirements
- The Define and Sketch phases were strengthened so the methodology now shows how the process model, priority user needs, role structure, and preliminary requirements are derived
- The Prototype phase now states that the defined workflow, roles, and requirements are operationalized in a concrete system architecture
- The Test phase now uses prototype-level evaluation wording rather than overclaiming validation
- Functionality analysis now includes an acceptance rule for core test cases and workflow-blocking errors
- Usability analysis now states that lower PSSUQ means indicate better perceived usability and that results are interpreted as prototype-level feedback rather than population-level generalizations
- Chapter 3 now states more clearly that the adviser review is a content-alignment step, not a separate statistical validation procedure
- Chapter 3 now limits panel-side and usability claims more explicitly to prototype-level feedback

## Skill Instruction Used
- `thesis/skills/thesis-mentor/SKILL.md`
- Review structure consistently followed:
  1. Structural Issues
  2. Applied Logic and PEEL Issues
  3. Chapter-Specific Concerns
  4. Citation and Source Issues
  5. Actionable, Context-Bound Recommendations

## Official Process Source Used
- External source reviewed: `D:\10 Projects\Undergraduate Thesis\Integrated REVISED GUIDELINES ON ACADEMIC PERSONNEL Oct 2022.docx`
- Important note: the local file name says `Oct 2022`, but the document body reads `Revised Guidelines on Academic Personnel Development Program (September 2021)`
- This document was treated as the official APDP process guide for policy and workflow facts
- This document is not the official thesis manuscript format guide

## Key APDP Facts Confirmed from the Official Guide
- APDP is broader than the IASP stage
- Applications are received by OVCAA six months before study leave
- Nomination begins with the Chairperson and Dean endorsement flow
- Academic Scholarship Panel performs interview and screening
- Recommendation proceeds to the Academic Planning Committee
- Chancellor issues a Special Order
- Board of Regents confirms the grant
- Eligibility includes permanent status and a Very Satisfactory TER for the last two academic years
- Post-approval requirements include a health certificate, mental and emotional stability certificate, clearance, notarized agreement, surety bond, and APDP orientation proof

## Chapter 1 Changes Already Made
- Removed AI-sounding and meta wording
- Tightened and humanized the introduction and background
- Clarified that the study supports the IASP application and panel evaluation stages, not the full APDP chain
- Grounded the background using actual APDP eligibility and documentary requirements
- Numbered the research questions and specific objectives
- Expanded the limitations section so excluded APDP stages are clearly stated
- Updated institutional citations to align with the official APDP guide year used in the document body
- Converted completed-study wording into proposal-appropriate present tense across the problem statement, research questions, objectives, significance, scope, limitations, conceptual framework, and definition of terms
- Preserved correct past tense for prior literature and instrument-development citations
- Clarified that some offices may benefit indirectly even if they are not implemented as direct system users
- Added the missing Design Sprint bridge sentence in the Introduction
- Rewrote the Conceptual Framework using phase-based rather than researcher-based descriptions
- Added available support citations to the significance subsection claims using sources already present in the project references
- Corrected the acronym order in Introduction Paragraph 5
- Added supporting evidence citations to the Conceptual Framework phase descriptions
- Added Maguire (2001) and Snyder (2003) to the reference list for the new Conceptual Framework citations

## Chapter 2 Changes Already Made
- Tightened the chapter framing around scholarship workflow needs
- Improved wording around centralized records, status visibility, and role-bounded action
- Corrected the remaining proposal-tense errors in the Design Sprint discussion, related-systems opening, and related-systems comparisons
- Replaced the weak University of Colorado webpage citation with stronger sources on workflow-aware control and records traceability
- Added a usability evaluation subsection to justify representative-user testing and PSSUQ-based assessment
- Added explicit system-selection criteria in the related-systems opening
- Added direct design-implication sentences to each related-systems subsection
- Strengthened the final synthesis so the chapter points toward FSMES more clearly and now includes usability evaluation
## Chapter 3 Changes Already Made
- Cleaned wording and removed AI-like phrasing
- Improved section numbering and flow
- Added a real tools and technologies section
- Recorded the current implementation stack:
  - Frontend: React with TanStack libraries
  - Backend: Hono
  - Database and authentication: Appwrite
- Updated the prototype description so it reflects the real stack
- Revised the overall chapter to better connect methodology outputs to the Chapter 1 objectives
- Kept the evaluation measures for functionality and usability in place
- Clarified that Chapter 3 now limits sample-based claims more carefully

## Reference File Status
- `thesis/reference.md` was cleaned earlier to remove duplicates and placeholder content
- The reference list is already alphabetized
- Lewis (1995), Republic Act No. 9470, and Uddin et al. (2019) were added to support the refined Chapter 2 literature
- The University of Colorado webpage citation was removed because it was too weak for a defensible literature review
- The APDP institutional entry still needs final manual verification against the exact title page that will be defended or submitted
## Stronger Improvements Achieved So Far
- Better alignment between the local institutional problem and the proposed system
- Stronger scope discipline around IASP versus the full APDP workflow
- More defensible statement of limitations
- Cleaner and more professional academic tone across the draft
- A methodology chapter that now reflects the actual technology stack used in development
- More defensible Chapter 3 logic because requirements, roles, and test criteria are now more explicitly connected
- Stronger proposal voice in Chapter 1
- Stronger internal flow from the Introduction to the Conceptual Framework
- A more defensible Chapter 2 because usability evaluation, workflow traceability, and workflow-aware control are now explicitly supported

## Remaining Gaps and Risks
- The official thesis manuscript guide is still missing, so final format compliance cannot yet be confirmed
- Figure 1.1 in Chapter 1 is still only a placeholder
- Chapter 1 still needs to say more clearly which APDP rules are system-enforced and which are only reviewed by humans
- Chapter 2 still benefits from final manual verification of Gkrimpizi et al. (2023) and World Bank (2022) against the actual source documents if strict APA or source checking is required
- Chapter 3 still needs exact TanStack package names if the final manuscript is expected to name the specific frontend libraries used
- Chapter 3 still relies on adviser-level judgment about whether the current sample is sufficient for the intended defense claims
- Only one panel participant is currently reflected in the methodology, which weakens broad panel-side claims
- The MSU-IIT institutional citation year still needs manual verification against the actual title page
- Research Questions placement between Sections 1.2 and 1.3 still needs adviser confirmation if strict numbering consistency is required

## Important Review Position Used in Previous Critiques
- The manuscript was reviewed as an applied capstone, not a purely theoretical thesis
- Review comments emphasized practical alignment, topic consistency, institutional grounding, and panel defensibility
- Comments repeatedly distinguished between:
  - what the official APDP guide confirms
  - what the manuscript currently claims
  - what still needs stronger justification or narrowing

## Suggested Next Edits
- Add the actual conceptual framework figure in Chapter 1
- Clarify system-enforced rules versus human-reviewed requirements in Chapter 1
- If required by the adviser, add one peer-reviewed companion study on Design Sprint application in an institutional or higher education setting
- If possible, specify the exact TanStack packages used in Chapter 3
- If required by the adviser, add official documentation citations for React, TanStack, Hono, and Appwrite

## Reuse Note for Future Sessions
When continuing this thesis work, use this file together with the latest chapter drafts and the APDP official guide. Treat the APDP guide as the source of local workflow facts, but do not treat it as the thesis formatting authority.




