# Cursor IDE Workshop - Complete Materials Package

## Overview

This package contains everything needed to deliver a comprehensive 90-minute workshop on Cursor IDE, with emphasis on the latest 2026 features including Composer 1.5, Subagents, Skills, Memory Bank, and MCP integration.

Created: February 11, 2026

---

## Files in This Package

### 📋 Primary Materials

#### **NEW: `_docs/progressive_cursor_lesson_plan.md`** ⭐⭐⭐ HIGHLY RECOMMENDED
**90-minute progressive workshop building a Team Task Manager**
- Format: Demo-focused with hands-on building approach
- Progressive complexity: Each module introduces one new Cursor feature
- Complete application: Goes from empty project to production-ready app
- Features covered in order:
  1. Cursor Rules (project standards)
  2. Rules for CRUD operations
  3. Cursor Skills (authentication workflow)
  4. Memory Bank (project context)
  5. Subagents (testing, docs, refactoring)
  6. Documentation Indexing (external docs)
  7. MCP Playwright (E2E testing)
- Includes: Code examples, mermaid diagrams, instructor notes, timing guidance
- Best for: Showing how Cursor features integrate in real development

**Use this if:**
- You want to demonstrate complete workflow
- You prefer teaching through building
- You want to show feature integration
- Mixed audience experience levels

#### 1. **`lesson_plan_demo_focused.md`** ⭐ RECOMMENDED
**90-minute live demonstration workshop**
- Format: Instructor demonstrates, students observe (no Cursor installation required)
- Heavy focus on latest features:
  - Composer 1.5 (Feb 2026)
  - Subagents system (Jan 2026)
  - Skills marketplace (Jan 2026)
- Builds on your existing 20-minute presentation
- 25 minutes dedicated to new features
- Live build demo with parallel subagent execution
- Includes your Research → PRD → Implementation workflow

**Use this if:**
- You want maximum content coverage
- Students haven't installed Cursor yet
- You want to showcase cutting-edge features
- You prefer demonstration over hands-on

#### 2. **`lesson_plan.md`** (Alternative)
**90-minute hands-on workshop**
- Format: Students follow along with Cursor installed
- 25-minute practical exercise
- More traditional workshop structure
- Good for smaller groups with prepared environments

**Use this if:**
- Students have Cursor pre-installed
- You want hands-on practice during session
- You have TAs to help with issues
- Smaller group size (<20 people)

### 📊 Supporting Documents

#### 3. **`student_cheatsheet.md`**
Quick reference guide for students
- Keyboard shortcuts
- Mode selection flowchart
- When to use each feature
- Troubleshooting common issues
- Getting started checklist
- Resources and links

**Distribute:** Print or share link before workshop

#### 4. **`instructor_timeline.md`**
Detailed instructor guide
- Minute-by-minute breakdown
- Demo scripts with backups
- Common issues and recovery strategies
- Timing adjustments
- Post-workshop checklist

**Use for:** Preparation and during workshop

#### 5. **`quick_reference_timeline.md`**
At-a-glance timeline
- One-page visual timeline
- Demo quick reference
- Emergency time adjustments
- Key messages to repeat

**Keep visible:** During workshop delivery

#### 6. **`SUMMARY.md`**
This overview document
- Explains all materials
- Recommendations
- Preparation checklist

### 🎨 Original Content

#### 7. **`Building Value With Cursor.pptx`**
Your original 20-minute presentation
- Foundation for the extended workshop
- Can be used as opening slides
- Content integrated throughout lesson plans

---

## Recommended Approach

### Best Choice: `lesson_plan_demo_focused.md`

**Why this one?**
1. No installation friction - workshop starts immediately
2. Maximum content coverage in 90 minutes
3. Showcases latest 2026 features prominently
4. Builds directly on your existing presentation structure
5. Students can try at home after seeing full capabilities
6. Focuses on what you requested: Subagents and Skills

### Module Breakdown
```
00:00-00:08 (8m)  │ Introduction (builds on your slides)
00:08-00:25 (17m) │ Core Features Demo
00:25-00:50 (25m) │ ⭐ NEW FEATURES (Composer 1.5, Subagents, Skills)
00:50-01:05 (15m) │ Production Workflows (your Research→PRD workflow)
01:05-01:20 (15m) │ Live Build Demo
01:20-01:30 (10m) │ Q&A & Resources
```

### What Makes It Special

**Subagents Deep Dive (10 minutes):**
- Testing Subagent demo
- Documentation Subagent demo
- Explore Subagent with thoroughness levels
- Custom subagent explanation
- Agent-to-agent communication

**Skills System (5 minutes):**
- What skills are and why they matter
- Live demo: Using existing skill
- Live demo: Creating custom skill
- Skill marketplace introduction
- Team consistency use cases

**Composer 1.5 (7 minutes):**
- February 2026 features explained
- "Thinking tokens" demonstration
- Plan Mode → Agent Mode workflow
- Complete feature implementation

---

## Preparation Guide

### 1 Week Before
- [ ] Read `lesson_plan_demo_focused.md` completely
- [ ] Review `instructor_timeline.md` for detailed notes
- [ ] Decide on demo projects (suggestions included)
- [ ] Verify Cursor is latest version
- [ ] Check API quota is sufficient

### 3 Days Before
- [ ] Practice all demos at least once
- [ ] Create custom skills for Demo 11
- [ ] Set up Memory Bank files in demo project
- [ ] Configure sample `.cursorrules` file
- [ ] Test all subagents work correctly
- [ ] Prepare demo codebases

### 1 Day Before
- [ ] Record backup videos for each major demo
- [ ] Print/prepare student cheatsheet
- [ ] Test screen sharing and recording
- [ ] Verify internet connection
- [ ] Prepare presentation slides
- [ ] Review timing with `quick_reference_timeline.md`

### Day Of
- [ ] Have `quick_reference_timeline.md` visible
- [ ] Open all demo projects in Cursor
- [ ] Clear Composer history for clean demos
- [ ] Test API connection
- [ ] Have backup recordings ready
- [ ] Load presentation materials

---

## Demo Requirements

### Software Needed
- Cursor IDE (latest version, Feb 2026)
- Claude Sonnet 4.5 API access configured
- Git (for version control demos)
- Node.js/npm (for JavaScript/TypeScript demos)
- Optional: Python, Go, or other language for variety

### Demo Projects to Prepare

#### 1. Simple Express API
**For:** Module 5 live build (auth implementation)
- Clean, minimal starter
- No auth yet
- Basic routing structure
- Tests framework set up

#### 2. React Application
**For:** Component and UI demos
- TypeScript enabled
- Basic components
- Room for enhancements

#### 3. Legacy Codebase Sample
**For:** Explore subagent demonstration
- Older code patterns
- Inconsistent structure
- Good for showing discovery features

### Backup Materials
- Pre-recorded video of each demo
- Screenshots of expected outcomes
- Alternative simpler demos if time runs short
- Prepared answers for common Q&A

---

## Key Features Highlighted

### Latest 2026 Features (Primary Focus)

**Composer 1.5 (February 2026):**
- 20x scaled reinforcement learning
- "Thinking tokens" for complex reasoning
- Self-summarization for long tasks
- Better context maintenance

**Subagents (January 2026):**
- Testing, Documentation, Refactor, Explore, Shell, Browser-Use
- Parallel execution
- Agent-to-agent communication
- Custom subagent creation

**Skills System (January 2026):**
- SKILL.md manifest files
- Reusable workflows
- Team consistency
- Community marketplace

### Core Features (Supporting Content)

- Tab autocomplete
- Inline Edit (⌘K)
- Chat with @Codebase
- Semantic indexing (Simhash onboarding)
- Rules system (.cursor/rules/)
- Memory Bank pattern
- MCP (Model-Context-Protocol)
- YOLO mode (safe auto-run)

---

## Workflow Integration

The workshop incorporates your existing workflow:

```
Research (AI tools)
    ↓
Design & PRD (AI-generated)
    ↓
IDE Setup (Cursor rules, Memory Bank)
    ↓
Implementation (Composer + Subagents + Skills)
    ↓
Testing (Testing Subagent)
    ↓
Documentation (Documentation Subagent)
```

This is demonstrated throughout Modules 4 and 5.

---

## Customization Options

### Extend Certain Topics

**For Technical Audience:**
- More MCP deep dive
- Custom subagent development
- Advanced Rules configurations
- CLI usage patterns

**For Enterprise Audience:**
- Legacy codebase section (your slide 12)
- Team collaboration features
- Security and privacy controls
- Deployment automation

**For Beginners:**
- More time on basics (Module 2)
- Simpler live build example
- Extended Q&A
- Step-by-step getting started

### Adjust Timing

Each module can be:
- **Reduced** (show pre-recorded, skip demos)
- **Extended** (deeper examples, more Q&A)
- **Replaced** (swap demos based on audience)

See `instructor_timeline.md` for specific guidance.

---

## Post-Workshop Actions

### Immediate (Same Day)
- Send recording link to attendees
- Share all materials (cheat sheet, templates)
- Provide demo code repositories
- Send feedback survey

### Week 1
- Email with advanced resources
- Invite to community (Discord/Slack)
- Answer follow-up questions
- Share success stories

### Month 1
- Optional office hours
- Advanced workshop invitation
- Collect adoption metrics
- Gather testimonials

### Materials to Share
- All markdown files from this package
- Memory Bank templates
- Sample .cursorrules files
- Skill examples (SKILL.md)
- Resource links document

---

## Success Metrics

**During Workshop:**
- Audience engagement (questions, reactions)
- Demo execution success rate
- Timing adherence

**Post-Workshop:**
- Satisfaction rating (target: 4.5+/5)
- Installation rate within 1 week (target: 40%+)
- Community engagement
- Follow-up questions volume

---

## Troubleshooting

### Common Issues

**Demo Fails:**
→ Show pre-recorded backup, continue

**API Quota Exhausted:**
→ Switch to recorded demos, explain concepts

**Running Behind Schedule:**
→ Use pre-recorded videos for Demos 7-8, reduce live build to 10 min

**Running Ahead:**
→ Extended Q&A, additional subagent demo (Browser-Use), deeper MCP dive

**Student Questions Derailing:**
→ "Great question for Q&A section" or "Let's discuss during break"

### Recovery Strategies

All detailed in `instructor_timeline.md` with specific guidance for each scenario.

---

## Additional Resources

### To Share With Students
- Cursor Documentation: cursor.com/docs
- Cursor Changelog: cursor.com/changelog
- Community Forum: forum.cursor.com
- Cursor Rules Repository (community)
- Palmer Wenzel's demo videos
- Reece Harding's Vibe Code Guide

### For Instructor Prep
- Practice with demo projects
- Review latest Cursor blog posts
- Join Cursor community
- Test new features as they release
- Keep materials updated

---

## Version Information

**Materials Version:** 1.0  
**Created:** February 11, 2026  
**Cursor Version:** Latest (Feb 2026)  
**Key Features:** Composer 1.5, Subagents, Skills  

**Based On:**
- Your "Building Value With Cursor" 20-min presentation
- Latest Cursor features (Jan-Feb 2026)
- Programming workshop best practices research
- AI-driven development workflows

---

## Quick Start

1. **Read** `SUMMARY.md` (this file)
2. **Choose** `lesson_plan_demo_focused.md` (recommended)
3. **Review** `instructor_timeline.md` for details
4. **Print** `quick_reference_timeline.md` for during workshop
5. **Practice** demos from lesson plan
6. **Prepare** materials to share
7. **Deliver** workshop
8. **Follow up** with attendees

---

## Questions or Modifications?

These materials are designed to be modular and customizable. Feel free to:
- Adjust timing for your audience
- Swap demos based on interest
- Add examples from your experience
- Focus more/less on specific features
- Combine with your existing materials

The lesson plans provide structure, but your expertise and presentation style will make it effective.

---

## Contact & Support

For questions about these materials or the workshop:
- Review the detailed `instructor_timeline.md`
- Check `student_cheatsheet.md` for common questions
- Consult Cursor documentation for feature updates

**Good luck with your workshop!**
