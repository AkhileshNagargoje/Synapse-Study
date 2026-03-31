# Phase 1 Schema Plan

## Goal
This schema is designed to turn the current frontend shell into a real product foundation for Phase 1.

It supports:
- account-based usage
- spaces
- subjects
- topics
- topic-level uploads
- extracted text storage
- saved study packs
- topic-level AI chat
- progress tracking
- sticky notes

## Core Entity Flow
- auth.users
- profiles
- spaces
- subjects
- topics
- uploads
- study_packs
- chat_threads
- chat_messages
- topic_progress
- sticky_notes

## Table Purposes

### profiles
Stores app-level user profile data linked to Supabase Auth.

Fields:
- id (uuid, same as auth.users.id)
- full_name
- avatar_url
- created_at
- updated_at

### spaces
Top-level academic containers like semester, year, exam sprint, or prep phase.

Fields:
- id
- user_id
- name
- label
- description
- progress_percent
- focus_note
- created_at
- updated_at

### subjects
Subjects inside a space.

Fields:
- id
- user_id
- space_id
- name
- code
- description
- progress_percent
- created_at
- updated_at

### topics
Topic-level study workspaces inside a subject.

Fields:
- id
- user_id
- space_id
- subject_id
- title
- summary
- status
- progress_percent
- confidence_level
- created_at
- updated_at

### uploads
Stores metadata for uploaded files.

Phase 1 direction:
- topic-level upload is primary
- subject-level upload is also allowed

Fields:
- id
- user_id
- space_id
- subject_id
- topic_id nullable
- file_name
- storage_path
- mime_type
- file_size_bytes
- upload_level
- upload_status
- extracted_text
- extracted_summary
- created_at
- updated_at

### study_packs
Saved generated pack for a topic.

Phase 1 simplification:
- one active pack row per topic
- pack content stored in JSONB

Fields:
- id
- user_id
- topic_id
- source_upload_ids jsonb
- pack_body jsonb
- generation_status
- model_name
- created_at
- updated_at

Suggested pack_body shape:
- overview
- key_points
- simple_explanation
- flashcards
- quiz
- viva_questions
- source_notes

### chat_threads
Topic-level AI chat threads.

Fields:
- id
- user_id
- topic_id
- title
- mode
- created_at
- updated_at

mode values:
- normal
- live_tutor

### chat_messages
Messages inside a topic chat thread.

Fields:
- id
- thread_id
- user_id
- role
- content
- metadata jsonb
- created_at

role values:
- user
- assistant
- system

### topic_progress
Tracks topic progress as the main progress model.

Fields:
- id
- user_id
- topic_id
- progress_percent
- confidence_level
- is_studied
- revision_status
- last_reviewed_at
- last_quiz_score
- last_viva_score
- created_at
- updated_at

### sticky_notes
Contextual notes for student, space, or topic.

Phase 1 rule:
- student-level note
- space-level note
- topic-level note
- subject-level note excluded for now

Fields:
- id
- user_id
- scope_type
- scope_id nullable
- content
- created_at
- updated_at

scope_type values:
- student
- space
- topic

## Relations
- profile belongs to one auth user
- user has many spaces
- space has many subjects
- subject has many topics
- topic has many uploads
- topic has one main study pack in phase 1
- topic has many chat threads
- chat thread has many chat messages
- topic has one progress row per user

## Phase 1 Notes
- search can be built later using spaces, subjects, topics, uploads, and study packs
- subject-level upload intelligence can be layered on top of uploads later
- embeddings and semantic retrieval can be added later using pgvector
- app-wide analytics are intentionally excluded from phase 1 schema
