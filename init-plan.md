# AI Study Companion - Initial Plan

## Status
- Stage: planning complete, implementation started
- Planning style: slow, chat-sized bursts
- Source of truth: this file will be updated as we refine the product together
- Current focus: product structure, feature flow, and implementation direction
- High-level stack direction is now locked

## Core Product Idea
An AI study companion for college and university students where they organize their academic life into spaces, subjects, and topics. They can upload handwritten notes and study assets, convert them into useful study material, save everything into a growing study base, and interact with the AI like a personal study tutor.

## Version 1 Audience Focus
Version 1 should stay general for college and university students.

Locked direction:
- The product is not being optimized only for engineering students in version 1.
- Engineering remains a strong fit, but not the only lens.
- The structure should work broadly for college study across many subjects and streams.

## First Target User
The first target user is college and university students.

Initial strongest fit:
- Engineering students
- Students managing multiple technical subjects at once
- Students who work from handwritten class notes, PDFs, lab material, and topic-wise preparation

Why this matters:
- They usually study in subjects and units/topics already, so the hierarchy fits naturally.
- They often need summaries, viva practice, quick explanations, and revision help.
- They usually have a mix of handwritten notes, slides, PDFs, and practical material.

## Planning Direction We Agreed On
- We are going slow.
- We are planning in small chat bursts.
- We are not rushing into architecture or APIs yet.
- This session is mainly for figuring out:
  - what the product provides
  - how the user moves through it
  - what the hierarchy and flow should be

## Main User Flow So Far
1. Student opens the app
2. Student creates an account
3. Student lands on a student dashboard
4. Student creates one or more spaces
5. Each space can represent something like an academic year, semester, exam phase, or learning track
6. Inside each space, student creates subjects
7. Clicking a subject opens a subject dashboard
8. Inside each subject, student creates topics
9. Clicking a topic opens a topic dashboard
10. Inside the topic, student uploads notes, images, PDFs, and other learning assets
11. The app extracts useful data from those assets and adds it to the study base for that topic
12. Student can study, review progress, chat with AI, and use live AI help based on that study base

## Sticky Notes Placement
Sticky notes should not exist at every level.

Locked direction:
- Student level: yes
- Space level: yes
- Subject level: no for now
- Topic level: yes

Why this fits:
- Student notes help with personal reminders.
- Space notes help with semester or phase-level planning.
- Topic notes help with actual studying and revision.
- Subject notes are less distinct and may add clutter.

## Student Dashboard Direction
The student dashboard should be mainly about spaces and tracking.

Locked direction:
- The dashboard should show spaces first.
- The dashboard should give overall study tracking and orientation.
- It should not feel overloaded with deep subject or topic details.

Main purpose of the student dashboard:
- Show all spaces
- Show overall study status
- Show what needs attention
- Help the student quickly continue work

Best-fit dashboard elements:
- Spaces grid or list
- Overall progress summary
- Space-wise progress
- Pending revision summary
- Continue studying
- Important sticky notes
- Small AI quick action area

Design principle:
- Spaces first
- Tracking second
- Quick resume third

## Main Working Screen
The main working screen should be the student dashboard.

Locked direction:
- After login, the student lands on a student dashboard first.
- From there, the student can move into spaces, subjects, and topics.
- Subject dashboards and topic dashboards still exist, but they sit under the student dashboard.

What the student dashboard may show:
- Spaces overview
- Recent subjects
- Recent topics
- Continue studying
- Progress summary
- Pending revisions
- Upcoming focus areas
- Sticky notes
- Recent AI activity
- Quick upload or quick add actions

UX structure now:
- Student dashboard = main home and control center
- Subject dashboard = subject-level organization and progress
- Topic dashboard = focused study and AI learning workspace

## Search Result Structure
Search results should be grouped by type.

Locked direction:
- Search results should not be one flat mixed list.
- Results should be grouped into clear categories.

Suggested main result groups:
- Spaces
- Subjects
- Topics
- Uploads
- Study packs

Why this fits:
- The product has multiple hierarchy levels.
- Grouping makes results easier to scan.
- Students can find the right kind of result faster.

## Search Requirement
The product should include search.

Locked direction:
- Students should be able to search across the workspace.
- Search should help find spaces, subjects, topics, uploaded material, and study packs.

Why this is important:
- The product has multiple layers of hierarchy.
- Students will build up a large amount of study material over time.
- Search will help them return to the right content quickly instead of navigating manually every time.

## Product Hierarchy
- Account
- Spaces
- Subjects inside each space
- Topics inside each subject
- Study base inside each topic
- AI interactions connected to that study base

## Product Scope Direction
We are planning this as a full-fledged product, not just a tiny demo tool.

What this means:
- The vision includes the full student workspace experience.
- We are not thinking in terms of a bare minimum throwaway app.
- We want proper organization, persistence, dashboards, study generation, and AI tutor features.

Important clarification:
- Even though the product vision is full-fledged, we should still think in build phases.
- Build phases help us decide what comes first without shrinking the ambition.

## Phase 1 Direction
Phase 1 should include both of these together from the beginning:
- structure + uploads + study generation
- structure + uploads + AI tutor/chat

Reasoning:
- The real value of the product comes from both creation and interaction.
- If we only generate content, it feels incomplete.
- If we only chat, the organized study base becomes weaker.
- The product promise is stronger when students can both build study material and learn from it immediately.

## Platform Direction
The product should work on both laptop/desktop and mobile from the beginning.

Locked decision:
- Version 1 will be a responsive web app.
- It should be built as a PWA.
- It should work well on both laptop and mobile.
- We are not planning separate native mobile apps in the beginning.

Why this fits:
- College students naturally switch between laptop and phone.
- Deep study and organization feel better on laptop.
- Quick revision, doubts, flashcards, and AI chat fit mobile well.
- A PWA gives one cross-device product without splitting early effort.
## Accounts From Day One
Yes, student accounts are required from version 1.

Why accounts are important here:
- The product is personal and long-term.
- Students need saved spaces, subjects, and topics.
- Study packs must be stored and reopened later.
- Progress tracking needs persistence.
- Sticky notes, chats, and practice history should stay linked to the student.
- The app should feel like a private academic workspace, not a one-time tool.

## Space Dashboard Direction
The space dashboard should stay simple.

Locked core blocks:
- Subjects
- Progress
- Continue studying
- Sticky notes

Meaning:
- Subjects = what belongs inside this space
- Progress = how much work is done in this space
- Continue studying = where the student should resume
- Sticky notes = reminders and important thoughts for this study phase

## What A Space Means
A space is a container for a student's academic context.

Examples:
- First Year
- Second Year
- Semester 3
- UPSC Prep
- NEET Revision
- Final Exams 2026

This helps students separate different study phases cleanly.

## Subject Dashboard Direction
The subject dashboard should focus on the most useful study-management blocks.

Locked core blocks:
- Topics
- Progress
- Uploads
- Continue studying

Meaning:
- Topics = the main structure inside the subject
- Progress = how much of the subject is covered
- Uploads = broader subject-level study material
- Continue studying = quick resume into active work

## What A Subject Contains
Each subject should likely have its own dashboard and working area.

Possible subject dashboard elements:
- Overall study progress
- Topics covered
- Topics pending
- Recent uploads
- Upcoming revision areas
- Sticky notes
- Quick actions
- Recent AI chats
- Flashcard count
- Quiz attempts
- Viva practice activity
- Weak areas detected by AI
- Strong areas detected by AI

## Topic Page Layout Direction
The topic page should use separate sections or tabs.

Locked direction:
- The topic should not be one long combined page.
- It should separate the main topic blocks clearly.
- The core sections remain:
  - Study pack
  - Uploads
  - AI chat
  - Progress

Why this fits:
- Topic pages will become heavy quickly.
- Separate sections keep the workspace cleaner.
- Students can move between learning, uploading, asking, and tracking without overload.

## Topic Dashboard Direction
The topic dashboard should be the core study workspace.

Locked core blocks:
- Study pack
- Uploads
- AI chat
- Progress

Meaning:
- Study pack = generated material for this topic
- Uploads = notes, PDFs, images, and topic assets
- AI chat = doubt solving and tutor interaction for this topic
- Progress = study status, revision status, and confidence level

## What A Topic Contains
Each topic is where the real study material gets built and used.

Possible topic page elements:
- Topic progress
- Topic summary
- Uploaded assets
- Extracted text
- Generated study material
- Key points
- Flashcards
- Quiz questions
- Viva questions
- Simple explanation
- Doubt chat for this topic
- Practice history
- Sticky notes
- Revision status
- Confidence level

## Subject Creation Direction
Subject creation should be mostly manual.

Locked direction:
- Students should mainly create subjects themselves.
- AI can help later in small ways, but subject structure should not depend on AI.

Why this fits:
- College students already know their subjects clearly.
- Subjects are stable and predictable compared to topics.
- Manual subject creation keeps the structure clean and under the student's control.

## Topic Creation Direction
Topic creation should be mixed.

Locked direction:
- Students should be able to create topics manually.
- AI should also help suggest or create topics from uploaded material.

Why mixed works well:
- Students often already know the topic they want.
- Sometimes uploaded material is broad or unsorted and AI can help organize it.
- This keeps the student in control while still using AI to reduce setup effort.

## Subject Upload Handling
Subject-level uploads should stay as subject material, but AI can suggest topic organization.

Locked direction:
- Subject uploads remain valid broad material inside the subject.
- The system should not force them into topics immediately.
- AI can suggest possible topics based on the uploaded material.
- The student can decide whether to organize them further.

Why this fits:
- It keeps subject uploads useful as a broad intake layer.
- It reduces friction for students who want to upload first and sort later.
- It uses AI to help organize without taking control away from the student.

## Upload Placement
Uploads should be allowed at both levels:
- Subject level
- Topic level

Locked direction:
- Topic-level upload is the main study workflow.
- Subject-level upload is also allowed for broader or unsorted material.

Good use of subject-level uploads:
- Syllabus documents
- Unit-wise PDFs
- Lab manuals
- Broad reference material
- Material that the student has not sorted into a topic yet

Good use of topic-level uploads:
- Handwritten notes for a specific topic
- Topic-specific PDFs
- Focused study material for extraction, generation, and AI tutoring

Working idea:
- Subject upload acts like a broader intake or inbox layer.
- Topic upload acts like the focused learning layer.

## Upload Scope For Phase 1
Phase 1 should support both:
- Image uploads
- PDF uploads

Why this should be included from the beginning:
- College students use both handwritten note photos and PDF material regularly.
- Engineering and university study is rarely only image-based.
- Topics may need class notes, slides, lab manuals, assignments, and reference PDFs together.
- Supporting both makes the topic study base much more realistic and useful.

## Practice History Direction
Quiz and viva results should be saved only as lightweight records.

Locked direction:
- Save marks or score summaries for each topic.
- Save the fact that practice happened.
- Do not save the full list of questions asked for now.

Why this fits:
- Students still get progress and performance tracking.
- Topic history stays lighter and cleaner.
- We avoid cluttering the product with too much old practice detail.

## Revision Placement
Revision should stay inside the existing dashboards and topics.

Locked direction:
- Revision does not need its own separate app area for now.
- Revision should appear inside student, space, subject, and topic flows where relevant.
- This keeps revision connected to the actual study structure.

Why this fits:
- Revision is part of studying, not a disconnected system.
- Students should see revision in context of their spaces, subjects, and topics.
- Keeping it inside the main flow reduces fragmentation.

## Progress Tracking
Progress tracking should be mixed.

Locked direction:
- The system can track progress automatically from student activity.
- The student can manually adjust and confirm important progress states.

Automatic signals may include:
- Uploads added
- Text extracted
- Study pack generated
- Flashcards reviewed
- Quiz attempted
- Viva practiced
- Chat activity

Manual controls may include:
- Mark topic as studied
- Mark revision done
- Set confidence level
- Mark weak topic
- Mark not understood yet

Why mixed is best:
- Fully automatic progress can be misleading.
- Fully manual progress creates too much friction.
- Mixed tracking gives helpful signals while keeping the student in control.

## Study Base Idea
Each topic should build its own study base from uploaded material.

The study base may include:
- Raw uploaded files
- OCR extracted text
- Cleaned text
- AI-generated explanations
- Summaries
- Flashcards
- Quiz sets
- Viva sets
- Student notes
- Doubts asked by the student
- AI responses
- Practice history

This study base then becomes the context for tutoring features.

## Topic AI Capabilities
Inside a topic, the AI chat should be able to do much more than simple conversation.

Locked capabilities:
- Analyze uploaded handwritten notes
- Analyze uploaded PDFs
- Analyze mixed topic material
- Use topic notes, extracted text, and study pack as context
- Answer doubts from the uploaded material
- Give broader study help when needed
- Explain concepts simply and step by step
- Summarize whole topics or selected content
- Generate key points, flashcards, quiz, and viva questions
- Test the student like a tutor
- Run viva-style practice
- Help identify weak areas and revision needs
- Work from source notes directly
- Support later live tutor mode using the same topic context

Short summary:
Topic AI should analyze, explain, generate, test, and tutor.

## AI Chat Scope Priority
The main AI chat experience should be at the topic and notes level.

Locked direction for now:
- Chat should work mostly inside a topic.
- The strongest context should come from that topic's uploaded notes, PDFs, extracted text, and study pack.
- Subject-level or space-level chat can exist later, but they are not the main focus right now.

Why this is a good fit:
- Topic-level context is sharper and more useful.
- Students usually study one topic at a time.
- Doubts, quiz practice, and viva prep work better when grounded in a focused knowledge base.
- This keeps the AI tutor relevant instead of overly broad.

## AI Modes We Have In Mind
- Study pack generation from notes
- Doubt solving from uploaded material
- Topic-based chat
- Subject-based chat
- Live viva practice
- AI-led quiz mode
- Live talk mode with AI tutor

## Study Pack Sections
The study pack should stay clean and study-focused.

Locked core sections:
1. Overview
2. Key points
3. Simple explanation
4. Flashcards
5. Quiz
6. Viva questions
7. Source notes

Why this order works:
- First understand the topic
- Then simplify it
- Then remember it
- Then test it
- Then revise from the source material

## Saved Study Pack Definition
A saved study pack should be a topic-level study bundle.

Locked structure for now:
- Pack title
- Linked space, subject, and topic
- Source assets
  - Uploaded images
  - Uploaded PDFs
- Extracted text
- Cleaned or organized notes
- Summary
- Key points
- Simple explanation
- Flashcards
- Quiz
- Viva questions
- Student sticky notes
- Progress information
  - Studied or not
  - Revision status
  - Confidence level
- Last updated time

What should stay connected but not sit inside the core pack body:
- Full general chat history
- Full live voice session history
- App-wide analytics

Guiding idea:
A study pack should feel like everything important for one topic in one reusable study bundle.

## Chat Scope
Chat should not be restricted only to uploaded notes.

Locked decision:
- The student can ask questions from uploaded notes and topic study base.
- The student can also ask for general study help.
- When a topic, subject, or space context exists, the AI should prefer that context.
- The AI should still be useful even when the student asks broader academic questions.

Why this matters:
- Students do not always ask perfectly context-bound questions.
- Sometimes they want help connecting topics, clearing fundamentals, or asking side doubts.
- A personal tutor should feel flexible, not artificially limited.

## Live Tutor Input Mode
Live AI tutor mode should start as text-first with an option to toggle voice.

Locked direction:
- Default mode is text.
- Students can switch to voice when they want.
- Voice is an optional mode, not the only way to use live tutoring.

Why this fits:
- Text is easier to ship and easier to use in many study situations.
- Some students may be in classrooms, libraries, or shared spaces.
- Voice still adds value for viva-like practice and more natural tutoring.

## Live AI Tutor Mode Direction
Live AI tutor mode should be clearly different from normal topic chat.

Locked difference:
- Normal topic chat is student-led.
- Live AI tutor mode is AI-led.

Normal topic chat should:
- Answer questions on demand
- Explain doubts
- Analyze notes and PDFs
- Generate study content when asked
- Feel flexible and casual

Live AI tutor mode should:
- Guide the session actively
- Ask questions one by one
- Run viva-style interaction
- Quiz the student actively
- Check answers and give feedback
- Adjust difficulty and flow
- Suggest what to revise next
- Feel like a real guided tutoring session

Short summary:
- Chat = ask anything
- Live tutor = guided interactive study session

## Live AI Idea
You want a live conversation mode where the student can talk to the AI naturally, and the AI uses the relevant study base as context.

Current idea:
- Student opens live tutor mode
- AI gets context from the selected topic, subject, or space
- AI behaves like a personal tutor
- AI can ask questions, explain things simply, test understanding, and do viva-style interaction

## Important Product Thought
This is becoming more than a simple note summarizer.
It is closer to a structured AI learning workspace for students.

That means the product has 3 strong layers:
- Organization layer: spaces, subjects, topics
- Knowledge layer: uploads, extraction, study base, generated materials
- Tutor layer: chat, doubt solving, viva, quiz, live tutoring

## Must-Have Ideas Emerging
These feel central already:
- Saved study packs should be clean topic-level study bundles
- Chat supports both note-based help and general study help
- Phase 1 supports both image and PDF uploads
- Phase 1 includes both study generation and AI tutor/chat
- Student accounts from day one
- Account system
- Multiple spaces
- Multiple subjects per space
- Multiple topics per subject
- Topic-level upload and study base
- Saved generated study material
- Progress visibility
- AI chat based on study material
- Live tutor mode later or in advanced MVP

## Things We Are Not Locking Yet
- Detailed database schema
- Exact auth flow UX
- Final prompt and AI pipeline design
- Pricing model
- Exact dashboard metrics
- Exact search behavior and filters
- Exact live tutor implementation depth

## Open Product Questions
- What should be phase 1 inside the full product vision?

## Onboarding And Empty State Direction
Onboarding and empty states should be simple, clear, and motivating.

Locked direction:
- Do not make the app feel overloaded with tutorials.
- Empty states should clearly show the next useful action.
- The tone should feel warm and encouraging, not complicated.

Good direction for empty states:
- Create your first space
- Add your first subject
- Create your first topic
- Upload notes to start building a study pack
- Start a topic to chat with AI

## Guided Setup Direction
A guided first-time setup flow is a good idea, but we are treating it as a later addition for now.

Locked direction:
- We want guided onboarding eventually.
- We are not locking it as a core immediate requirement yet.
- We can revisit it later when we design onboarding in more detail.

## Tech Stack Direction
This is the locked implementation direction based on current official docs and our product needs.

### Frontend
- React
- TypeScript
- Vite
- PWA setup

### UI Layer
- Tailwind CSS v4
- shadcn/ui
- Radix UI
- Lucide icons

Why this UI direction:
- Good balance of speed and product-level control
- Better for building a clean modern app feel
- Works well for a PWA and dashboard-heavy product

### Frontend App Utilities
- React Router v7 for routing
- TanStack Query for server state
- React Hook Form for forms
- Zod for validation
- vite-plugin-pwa for installable PWA behavior

### Backend
- Node.js
- Fastify

Why this backend direction:
- Fast to set up
- Good for a thin API layer
- Good fit for auth checks, uploads, AI orchestration, and app APIs

### Database, Auth, and Storage
- Supabase
  - Postgres database
  - Auth
  - Storage

Why Supabase is the best current fit:
- Easy for hackathon setup
- Free and practical to start with
- Good fit for our relational hierarchy:
  - users
  - spaces
  - subjects
  - topics
  - study packs
  - uploads
  - chat records
  - progress
  - notes
- Postgres is a better fit than document-first storage for this product structure

### Data Strategy
Use different storage styles for different data types:
- Structured app data in Postgres tables
- Images, PDFs, and future audio files in Supabase Storage
- Flexible AI outputs and pack metadata in JSONB where needed
- Optional pgvector later if we need semantic retrieval from notes

### AI Direction
- Gemini API as the main AI layer
- Use the modern JavaScript SDK: @google/genai

Suggested model usage:
- Gemini 2.5 Pro for high-quality study pack generation and heavier reasoning
- Gemini 2.5 Flash for fast topic chat and quick generation tasks
- Gemini 3.1 Flash Live Preview for live tutor mode

### OCR And Document Understanding
Current direction:
- Start by using Gemini to understand uploaded handwritten notes and PDFs
- Add Google Cloud Vision OCR as a stronger fallback or upgrade path if OCR quality becomes a problem

Why this is a good path:
- Simple initial integration
- Lower setup complexity
- Stronger OCR path available when needed

### Final Locked Stack
- React + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui + Radix + Lucide
- React Router v7
- TanStack Query
- React Hook Form + Zod
- vite-plugin-pwa
- Node.js + Fastify
- Supabase for Postgres + Auth + Storage
- Gemini API via @google/genai
- Google Vision OCR as a fallback or upgrade path

## Remaining Core Planning Questions
We have already locked most of the product foundation.

Roughly 1 important planning question remains for this product-definition pass:
- What exactly belongs in phase 1 versus later phases?

## Current Best Short Summary
We are planning an AI study workspace where a student creates an account, organizes learning into spaces, subjects, and topics, uploads study material into topics, builds a study base from those uploads, and then learns through generated content plus AI tutoring and live practice.

## Next Chat Burst Suggestion
The next useful small step is to lock one thing:
What exactly belongs in phase 1 versus later phases?


## Decision Order For Planning
We should answer these in this order so later decisions become easier.

1. Who is the first target user exactly?
   - This decides the product style, dashboards, language, and study flow.

2. Do we want student accounts from day one?
   - This decides whether the product is personal and persistent from the start.

3. Web app or mobile app first?
   - This affects the whole UX direction and what kind of MVP is realistic.

4. What should be phase 1 inside the full product vision?
   - This helps us decide build order without reducing the ambition of the product.

5. Should note upload support images only first, or images plus PDF?
   - This is easier to decide after we know platform and MVP scope.

6. What should a saved study pack contain exactly?
   - This depends on what version 1 actually includes.

7. Will chat be restricted to uploaded notes, or also allow general study help?
   - This should be decided after we define the first product promise clearly.

## Current Recommendation Order
If we go very practically, our suggested answer flow should be:
- First target user
- Accounts from day one or not
- Web first or mobile first
- Phase 1 definition
- Upload types
- Saved study pack structure
- Chat boundaries
## Change Log
- 2026-03-30: Created the initial planning document with the raw concept, first MVP guess, assumptions, and next questions.
- 2026-03-30: Expanded the plan into a hierarchy-based product structure with spaces, subjects, topics, dashboards, topic study bases, and AI tutor modes.
- 2026-03-30: Locked the first target user as college and university students, with engineering students as the strongest initial fit.
- 2026-03-30: Locked student accounts as a version 1 requirement because the product depends on saved personal study data.
- 2026-03-30: Locked platform preference as a responsive PWA web app for version 1 across laptop and mobile.
- 2026-03-30: Set the product scope direction as full-fledged, while keeping phased planning for execution clarity.
- 2026-03-30: Locked phase 1 to include both study generation and AI tutor/chat from the beginning.
- 2026-03-30: Locked phase 1 upload scope to support both images and PDFs.
- 2026-03-30: Locked chat scope to allow both note-based help and broader study help, while preferring available study context.
- 2026-03-30: Locked the saved study pack as a topic-level bundle of source material, extracted content, generated study tools, notes, and progress metadata.
- 2026-03-30: Locked AI chat to be mainly topic-and-notes based, with broader subject or space chat treated as later expansion.
- 2026-03-30: Locked uploads to work at both subject and topic levels, with topic-level as the primary study workflow.
- 2026-03-30: Locked progress tracking as mixed, with automatic signals plus manual control by the student.
- 2026-03-30: Locked the main entry screen as a student dashboard, with subject and topic dashboards under it.
- 2026-03-30: Locked the student dashboard to focus mainly on spaces and study tracking.
- 2026-03-30: Locked the space dashboard to a simple structure of subjects, progress, continue studying, and sticky notes.
- 2026-03-30: Locked the subject dashboard to the core blocks of topics, progress, uploads, and continue studying.
- 2026-03-30: Locked the topic dashboard to the core blocks of study pack, uploads, AI chat, and progress.
- 2026-03-30: Locked the study pack sections as overview, key points, simple explanation, flashcards, quiz, viva questions, and source notes.
- 2026-03-30: Locked the topic AI capabilities around analyzing material, answering doubts, generating study tools, testing the student, and tutoring from topic context.
- 2026-03-30: Locked the distinction between student-led topic chat and AI-led live tutor mode.
- 2026-03-30: Locked topic creation as mixed, with both manual creation and AI-assisted topic suggestions from uploads.
- 2026-03-30: Locked subject creation as mostly manual, with AI not being central to subject structure.
- 2026-03-30: Locked the topic page to use separate sections or tabs for study pack, uploads, AI chat, and progress.
- 2026-03-30: Locked sticky notes to student, space, and topic levels, excluding subject level for now.
- 2026-03-30: Locked search as a required product feature across the student workspace.
- 2026-03-30: Locked revision to stay inside dashboards and topics instead of becoming a separate app area.
- 2026-03-30: Locked quiz and viva history as lightweight score records without storing full question history.
- 2026-03-30: Locked live tutor mode to be text-first with an optional voice toggle.
- 2026-03-30: Marked guided first-time setup as a later onboarding improvement rather than an immediate locked requirement.
- 2026-03-30: Locked version 1 to stay general for college and university students rather than optimizing only for engineering students.
- 2026-03-30: Locked subject uploads to remain broad material while allowing AI to suggest topic organization.
- 2026-03-30: Locked search results to be grouped by type across spaces, subjects, topics, uploads, and study packs.
- 2026-03-30: Locked onboarding and empty states to be simple, clear, and motivating rather than heavily guided.
- 2026-03-30: Reverted the hackathon-only scope framing and returned the plan to the broader near-full-product direction.
- 2026-03-30: Locked the researched tech stack direction around React, Vite, Tailwind, shadcn/ui, Fastify, Supabase, Gemini, and Google Vision OCR fallback.




