# DevvDeck

DevvDeck is an automation first developer project management platform designed to synchronize real development activity with project tasks.

Instead of manually updating project boards, DevvDeck automatically updates tasks when developers push commits, open pull requests, or merge code. The goal is to eliminate manual project tracking and ensure project status always reflects the real state of the codebase.

---

# Table of Contents

1. Introduction
2. Product Vision
3. Problem Statement
4. Solution
5. Core Concepts
6. Core Features
7. System Architecture
8. Technical Architecture
9. Event Processing Architecture
10. Real Time Updates
11. Domain Model
12. Database Design
13. API Design
14. WebSocket Communication
15. Example Workflows
16. Repository Structure
17. Local Development Setup
18. Environment Configuration
19. Development Roadmap
20. Scalability Strategy
21. Security Model
22. Future Vision
23. Target Users
24. Contributing
25. License

---

# 1. Introduction

DevvDeck is a developer focused project management platform that automatically links software development activity with project management tasks.

Traditional project management tools require developers to constantly update tasks, move cards between columns, and manually link commits to issues. This creates friction and causes project boards to become outdated.

DevvDeck removes this manual work by connecting directly to GitHub repositories and processing development events automatically.

When developers perform actions such as:

- pushing commits
- opening pull requests
- merging pull requests

DevvDeck processes these events and updates the associated project tasks automatically.

---

# 2. Product Vision

The mission of DevvDeck is to eliminate manual project management updates for development teams.

Instead of forcing developers to manage tasks manually, DevvDeck ensures that project status reflects real development progress.

Key principles:

- tasks update automatically from commits
- pull requests update task states
- activity timelines track development events
- project boards stay synchronized with repository activity

The long term vision is a platform where development workflow and project management are fully integrated.

---

# 3. Problem Statement

Modern engineering teams use project management platforms such as:

- Jira
- Linear
- Trello
- Asana

However development work happens inside:

- Git repositories
- commit history
- pull requests
- CI pipelines
- code review systems

This separation creates several problems.

Outdated boards

Developers forget to update tasks after finishing work.

Manual overhead

Developers waste time managing boards instead of writing code.

Missing context

Commits and pull requests are disconnected from tasks.

Poor visibility

Managers cannot easily see real development progress.

---

# 4. Solution

DevvDeck integrates directly with GitHub repositories using webhooks.

Example commit message:

git commit -m "fix login bug (#42)"

DevvDeck parses the commit message and extracts the task identifier.

Once detected the system will:

- link the commit to the task
- create an activity timeline entry
- update the task metadata
- optionally update task status

This eliminates the need for manual updates.

---

# 5. Core Concepts

Organizations

Organizations represent team workspaces. Each organization can contain multiple projects and users.

Projects

Projects are containers that hold tasks and repository integrations.

Tasks

Tasks represent units of work and contain:

- title
- description
- status
- activity timeline
- associated commits
- associated pull requests

Activity Events

Activity events track actions inside the system such as commits or merges.

---

# 6. Core Features

GitHub Integration

DevvDeck integrates with GitHub repositories through webhooks. Supported events include:

- push events
- commit messages
- pull request opened
- pull request merged

Automatic Task Updates

Developers reference tasks directly in commit messages.

Example:

git commit -m "implement auth system (#18)"

DevvDeck automatically associates the commit with task 18.

Kanban Boards

Projects are organized using Kanban boards.

Typical workflow states:

Backlog
Todo
In Progress
Review
Done

Activity Timeline

Each task contains a full activity timeline that records:

- commits
- pull requests
- merges
- task updates

Real Time Dashboard

The dashboard updates instantly when events occur using WebSocket communication.

---

# 7. System Architecture

DevvDeck uses an event driven architecture.

Major components:

Frontend

Next.js dashboard application responsible for displaying projects, tasks, and activity feeds.

Backend

NestJS API server responsible for authentication, project management, and event ingestion.

Queue System

Redis based queue used for asynchronous event processing.

Workers

Background workers responsible for processing events and updating tasks.

Database

PostgreSQL database storing application data.

---

# 8. Technical Architecture

Frontend

Technology stack:

- Next.js
- React
- modern UI components
- WebSocket client

Responsibilities:

- project dashboards
- Kanban board UI
- task detail views
- activity timeline interface

Backend

Technology stack:

- NestJS
- TypeScript
- REST API

Responsibilities:

- authentication
- project management
- task management
- webhook ingestion
- event dispatching

Infrastructure

Redis is used for queue processing.

PostgreSQL stores system data.

Workers process queued events.

---

# 9. Event Processing Architecture

The system processes GitHub activity through a queue based pipeline.

Event Flow

GitHub Webhook

API receives webhook

Event pushed to Redis queue

Worker consumes event

Commit parser extracts task ID

Task updated

Activity event created

WebSocket notification sent

---

# 10. Real Time Updates

Workers update tasks after processing events.

Once a task update occurs the backend emits a WebSocket event to connected clients.

The frontend receives this event and updates the UI immediately.

This ensures project boards remain synchronized with backend activity.

---

# 11. Domain Model

Core entities:

User

Organization

Project

Task

Commit

PullRequest

ActivityEvent

Relationships

Organizations contain projects.

Projects contain tasks.

Commits generate activity events.

Pull requests update tasks.

---

# 12. Database Design

DevvDeck uses PostgreSQL.

Core tables:

users

organizations

memberships

projects

tasks

activity_events

integrations

Relationships

Projects contain tasks.

Tasks generate activity events.

Integrations connect GitHub repositories to projects.

---

# 13. API Design

Authentication

POST /auth/github

GET /auth/session

Projects

POST /projects

GET /projects

Tasks

POST /tasks

GET /tasks

PATCH /tasks/{id}

Activity

GET /tasks/{id}/activity

---

# 14. WebSocket Communication

The backend maintains WebSocket connections with active clients.

When a task is updated the backend emits events to the appropriate project channel.

The frontend listens for these messages and updates the UI accordingly.

---

# 15. Example Workflow

Developer pushes commit

git commit -m "fix login bug (#1)"

Processing pipeline

Webhook received

Event queued

Worker processes commit

Task updated

Activity event generated

WebSocket update sent

Dashboard refreshes automatically

---

# 16. Repository Structure

DevvDeck

frontend

components

boards

activity

backend

auth

projects

tasks

integrations

websocket

workers

event processor

commit parser

queue

redis configuration

database

migrations

docs

---

# 17. Local Development Setup

Requirements

Node.js

PostgreSQL

Redis

Installation

npm install

Start backend

npm run start:api

Start frontend

npm run start:web

Start workers

npm run start:worker

---

# 18. Environment Configuration

Example environment variables

DATABASE_URL

REDIS_URL

GITHUB_CLIENT_ID

GITHUB_CLIENT_SECRET

JWT_SECRET

---

# 19. Development Roadmap

Phase 1

Authentication

Organizations

Projects

Phase 2

Tasks

Kanban boards

Activity feed

Phase 3

GitHub integration

Commit parsing

Automatic task updates

Phase 4

Automation rules

Sprint insights

Developer analytics

---

# 20. Scalability Strategy

The system scales horizontally.

Multiple workers can process queue jobs simultaneously.

Redis ensures reliable job processing.

WebSocket servers can scale using pubsub architecture.

---

# 21. Security Model

Security features include:

GitHub OAuth authentication

Webhook signature validation

JWT session tokens

Role based organization permissions

---

# 22. Future Vision

Future capabilities include:

CI pipeline integration

Sprint analytics

AI generated task summaries

Developer productivity insights

Cross repository project tracking

---

# 23. Target Users

DevvDeck is designed for:

Startup engineering teams

Indie hackers

Small developer teams

Open source maintainers

---

# 24. Contributing

Fork repository

Create feature branch

Commit changes

Open pull request

---

# 25. License

MIT License
