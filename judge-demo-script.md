Judge demo setup

Use these exact demo entities:
- Space: Semester 2
- Subject: Engineering Physics
- Topic: Laws of Motion

Best demo order:
1. Log in
2. Open or create Semester 2
3. Open or create Engineering Physics
4. Open or create Laws of Motion
5. Go to Uploads
6. Upload demo-assets/laws-of-motion-note.pdf or demo-assets/laws-of-motion-note.svg
7. Click Generate study pack
8. Open Study pack and show overview, key points, quiz, viva
9. Open AI chat and ask:
   - Explain Newton's second law in simple words
   - Ask me one viva question from this topic
   - Give me 3 quick revision points

30-second pitch:
Synapse Study is an AI study workspace for college students. Students organize learning into spaces, subjects, and topics, upload handwritten notes or PDFs, generate saved study packs, and then ask doubts from that exact topic like a personal tutor.

If judges ask what is real right now:
- auth
- spaces, subjects, topics
- upload one PDF or image at topic level
- Gemini study-pack generation
- saved study pack
- topic-level AI doubt chat

Judge Q and A: Progress tracking

Q: How will you track student progress?
A: We use a mixed progress model, not only manual and not only automatic.

Automatic signals:
- topic created
- notes uploaded
- study pack generated
- topic reopened
- quiz or viva attempted
- AI chat used

Manual control:
- mark studied or not
- mark revision done
- set confidence level
- mark weak topic

Why mixed:
- only automatic can be wrong
- only manual becomes tiring
- mixed tracking gives convenience plus honesty

Short answer:
We track progress through a mix of automatic study signals and manual student feedback. The system observes actions like uploads, pack generation, and AI usage, while the student can still mark confidence and revision status so progress reflects actual understanding.

If asked whether it is fully implemented now:
The structure is already planned in our schema, and the prototype already has the right data model for it. In this hackathon version, we focused first on the core loop: upload, generate, save, and ask doubts.