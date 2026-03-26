# Thesis Master Log

Last updated: 2026-03-12
Status: Active working context

## Purpose
This is the canonical master log for the capstone refinement work. Future editing, review, and revision passes should use this file first to recover the project context, major decisions, prior changes, validated sources, and remaining issues.

## Project Snapshot
- Working title in the draft: Faculty Scholarship Grant Management and Evaluation System (FSMES)
- Study context: faculty scholarship application handling under the institutional APDP process
- Implemented study scope: IASP application submission and panel evaluation stages
- Explicit boundary: the system does not automate the full APDP approval chain

## Core Scope Position
The manuscript should consistently present FSMES as a system that supports the IASP-focused portion of the broader APDP workflow. It should not imply that the system covers later endorsement, approval, and post-award compliance stages unless those are actually implemented.

## Main Thesis Files
- `thesis/chapter-1-introduction.md`
- `thesis/chapter-2-rrl.md`
- `thesis/chapter-3-methodology.md`
- `thesis/reference.md`

## Review Framework Used
Primary local instruction source:
- `thesis/skills/thesis-mentor/SKILL.md`

Standard critique structure used in prior reviews:
1. Structural Issues
2. Applied Logic and PEEL Issues
3. Chapter-Specific Concerns
4. Citation and Source Issues
5. Actionable, Context-Bound Recommendations

## Standing Writing Rule
Use present tense when the manuscript describes:
- the current institutional problem
- the proposed system
- the study purpose, scope, limitations, framework, and definitions
- ongoing institutional conditions or workflow realities

Use past tense when the manuscript reports:
- findings, claims, or contributions of prior authors and prior studies
- literature-based methods or instruments developed by earlier researchers

Applied note:
- This rule was explicitly enforced in Chapter 1 on 2026-03-11 to correct completed-study wording in a proposal chapter while preserving valid past-tense literature citations

## Official Institutional Source Used
Reviewed file:
- `D:\10 Projects\Undergraduate Thesis\Integrated REVISED GUIDELINES ON ACADEMIC PERSONNEL Oct 2022.docx`

Important note:
- The filename suggests `Oct 2022`
- The document body reads `Revised Guidelines on Academic Personnel Development Program (September 2021)`

Interpretation used in prior edits:
- This document is treated as the authoritative source for APDP workflow facts, actors, eligibility requirements, and documentary requirements
- This document is not the official thesis manuscript formatting guide

## APDP Facts Confirmed from the Official Guide
- APDP is broader than the IASP stage
- Applications are received by OVCAA six months before study leave
- Nomination starts from the Chairperson and Dean endorsement flow
- The Academic Scholarship Panel handles interview and screening
- Recommendations move to the Academic Planning Committee
- The Chancellor issues a Special Order
- The Board of Regents confirms the grant
- Eligibility includes permanent status and a Very Satisfactory TER for the last two academic years
- Post-approval requirements include a health certificate, mental and emotional stability certificate, clearance, notarized agreement, surety bond, and APDP orientation proof

## Actual Technology Stack
Current stack stated by the user for Chapter 3:
- Frontend: React with TanStack libraries
- Backend: Hono
- Database: Appwrite
- Authentication: Appwrite

## Edits Already Completed

### Chapter 1
- Removed AI-sounding and meta wording
- Humanized the tone and improved the introduction flow
- Clarified that FSMES supports the IASP application and panel evaluation stages only
- Grounded the background in actual APDP policy details
- Numbered research questions and specific objectives
- Strengthened the scope and limitations section
- Added clearer exclusions for non-implemented APDP stages
- Updated institutional citation use to align with the APDP document body year used in the manuscript
- Converted Chapter 1 from completed-study past tense into proposal-appropriate present tense for the problem, study, scope, limitations, conceptual framework, and definition of terms while preserving correct past tense for literature citations
- Tightened the significance section so non-implemented offices are framed as indirect rather than direct beneficiaries
- Added the missing Design Sprint bridge sentence in the Introduction so Step 5 now connects more clearly to the conceptual framework
- Rewrote the Conceptual Framework phase descriptions using phase-centered language rather than researcher-centered methodology language
- Added supporting citations to the significance subsections using sources already present in the reference list
- Corrected the acronym order in Introduction Paragraph 5 so the full system name appears before `FSMES`
- Added evidence sentences to the Conceptual Framework phases using Maguire (2001), Snyder (2003), Nielsen (1994), and Lewis (2002)

### Chapter 2
- Tightened chapter framing around scholarship workflow needs
- Improved wording around centralized records, status visibility, and role-bounded action
- Fixed the remaining proposal-tense drift in the Design Sprint discussion, related-systems opening, and related-systems comparisons
- Strengthened the literature on fragmented workflows so status visibility, document completeness, and traceability are tied to defensible sources
- Replaced the weak University of Colorado webpage citation with Uddin et al. (2019) and Republic Act No. 9470
- Added a usability evaluation subsection to justify representative-user testing and the use of the PSSUQ
- Added explicit selection criteria to the related-systems opening
- Added design-implication sentences to each related-systems discussion so the chapter connects more directly to FSMES
- Improved synthesis so the literature points more directly to FSMES and now includes usability evaluation
### Chapter 3
- Cleaned wording and removed AI-like phrasing
- Improved section numbering and readability
- Added a real tools-and-technologies section
- Reflected the actual stack: React with TanStack, Hono, and Appwrite
- Updated the prototype description so it matches the actual implementation stack
- Preserved the functionality and usability evaluation structure
- Converted Chapter 3 into proposal-consistent present tense to align with the refined proposal voice used in Chapter 1
- Added clearer traceability from APDP provisions and interview themes to user roles, process model, features, test cases, and functional requirements
- Strengthened the Define, Sketch, Prototype, and Test phases so Chapter 3 now explains how outputs connect to Objectives 2 to 5
- Added interpretation rules for functionality results and PSSUQ usability means
- Replaced overstrong validation wording with prototype-level evaluation wording
- Added clearer limits on sample-based claims, adviser review scope, and prototype-level interpretation in Chapter 3

### References
- Removed duplicate and placeholder entries earlier
- Confirmed that `thesis/reference.md` is already alphabetized
- Retained a caution that the APDP institutional entry still needs final manual verification against the exact document title page to be cited in the final manuscript
- Confirmed that the local reference file already contains full entries for Gkrimpizi et al. (2023) and World Bank (2022), although final APA verification still depends on the actual source documents
- Added local reference entries for Maguire (2001) and Snyder (2003) to support the Conceptual Framework phase citations
- Added Lewis (1995) to support the original PSSUQ justification in Chapter 2 while retaining Lewis (2002) for later psychometric support
- Added Republic Act No. 9470 and Uddin et al. (2019) to support workflow traceability and workflow-aware access control in Chapter 2
- Removed the University of Colorado webpage citation because it was too weak for a defensible literature review
- Added DOI links to Lewis (2002) and Sandhu et al. (1996) in the reference list
## Strongest Improvements So Far
- Better institutional grounding of the study problem
- Better alignment between the problem, users, and proposed system
- Stronger scope discipline between IASP and the broader APDP process
- Cleaner and more defensible academic tone
- More defensible Chapter 2 literature because usability evaluation, workflow traceability, and workflow-aware control are now explicitly supported
- Stronger Chapter 2 links between reviewed systems and actual FSMES design decisions
- More accurate Chapter 3 methodology because it now reflects the real implementation stack
- More defensible Chapter 3 logic because requirements, roles, and test criteria are now more explicitly connected
- Clearer prototype-level limits on functionality, usability, and panel-side claims in Chapter 3
- More consistent proposal voice in Chapter 1
- Stronger alignment between the Introduction and the Conceptual Framework

## Current Gaps to Watch
- The official thesis manuscript guide is still missing, so final formatting compliance cannot yet be confirmed
- Figure 1.1 in Chapter 1 is still only a placeholder
- Chapter 1 still needs a clearer distinction between rules enforced by the system and rules checked manually by humans
- Chapter 2 still benefits from final manual verification of Gkrimpizi et al. (2023) and World Bank (2022) against the actual source documents if strict APA or source checking is required
- Chapter 3 still needs exact TanStack package names if the final manuscript is expected to name the specific frontend libraries used
- Chapter 3 still relies on adviser-level confirmation for whether the current sample is sufficient for the intended defense claims
- The methodology currently reflects only one panel participant, which weakens broad panel-side claims
- The MSU-IIT institutional citation year still requires manual verification against the physical or official title page used for submission
- Research Questions placement between Sections 1.2 and 1.3 still needs adviser confirmation if strict Main Guide numbering is expected

## High-Risk Overclaim Areas
Avoid drifting into these claims unless the manuscript explicitly proves them:
- That FSMES automates the full APDP process
- That OVCAA and other later-stage offices are direct system users if they are not implemented roles
- That the system fully enforces all APDP eligibility and documentary rules if some checks remain manual
- That panel-side usability findings are broadly generalizable from a very small panel sample

## Recommended Next Edits
- Replace the Figure 1.1 placeholder with the actual conceptual framework figure
- Clarify system-enforced rules versus human-reviewed requirements in Chapter 1
- If required by the adviser, add one peer-reviewed companion study on Design Sprint application in an institutional or higher education setting
- If possible, specify the exact TanStack packages used in Chapter 3
- If required by the adviser, add official documentation citations for React, the exact TanStack packages, Hono, and Appwrite

## Working Rule for Future Sessions
When continuing this capstone, read this file first. Then check the latest chapter drafts and the APDP guideline document. Use the APDP guide as the authority for local process facts, but do not use it as a substitute for the official thesis manuscript formatting guide.

## Related Context File
A separate session-oriented summary also exists:
- `thesis/history/thesis-edit-history.md`




