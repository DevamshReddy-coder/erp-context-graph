# 🧠 AI Session Transcript: ERP Context Graph Development

## **Project Overview**
**Project Name:** Dodge S-Tier: Advanced Graph Intelligence Hub  
**Author:** Devamsh Reddy  
**Date:** March 25, 2026 (Built for [erp-context-graph-mhkd.vercel.app](https://erp-context-graph-mhkd.vercel.app/))

---

## **Phase 1: Domain-Driven Graph Construction**

### **Prompting Strategy: ERP Modeling**
> **Prompt:** "I have a fragmented ERP dataset (Orders, Deliveries, Invoices, Partners). I need you to ingest this into an SQLite database and model it as a high-density context graph. Define nodes representing business entities and edges for their relationships using the canonical Order-To-Cash (O2C) flow."

### **AI Reasoning & Implementation:**
The AI analyzed the dataset and proposed a **7-tier relationship model**:
- **Normalized Join Logic:** Creating a recursive JOIN strategy to trace `Sales Order` → `Delivery` → `Invoice` → `Journal Entry`.
- **Database Choice (SQLite):** Decided on SQLite for its zero-latency local execution and single-file portability, making the graph traversals highly performant.

---

## **Phase 2: S-Tier UI/UX Visual Engineering**

### **The "WOW" Requirement**
> **Prompt:** "Build a visualization engine that isn't just a static graph. It should feel high-fidelity—use animated link particles for flow data, glow effects for active nodes, and an 'Isolation Focus Mode' to surgically analyze specific transaction paths."

### **Iterative Refinement:**
- **Visuals:** Integrated `react-force-graph-2d` with custom canvas rendering for concentric pulsing rings.
- **Micro-Animations:** Added particle flow speed tied to the 'relevance' of an engine-highlighted link.
- **Focus Mode:** Implemented a global state manager (`Set<string>`) to selectively render nodes, reducing cognitive load for auditors.

---

## **Phase 3: Hybrid AI Engine & Prompt Engineering**

### **Deterministic vs. Generative Routing**
> **Prompt:** "I don't want to rely 100% on the Gemini API for standard traces. Build a Hybrid Engine that intercepts forensic queries using a deterministic regex router for 0ms latency, and falls back to Gemini 2.0 Flash for complex natural language reasoning."

### **Prompt Engineering Detail:**
A structured **Bridge-Logic** prompt was crafted to ensure Gemini:
1.  **Understands Schema**: Strictly grounded in the 7-table schema provided.
2.  **Generates Execution-Ready SQL**: Returning JSON with `sql`, `intent`, and `graph_highlights`.
3.  **Strict Guardrails**: Hardwired to reject off-topic (weather, general knowledge) prompts.

---

## **Phase 4: Debugging & Production Resilience (GLIBC Fix)**

### **The Deployment Crisis**
> **Log:** `Error: /lib64/libm.so.6: version 'GLIBC_2.38' not found (required by node_sqlite3.node)`

### **Problem-Solving Workflow:**
1.  **Diagnosis:** The AI identified that `sqlite3@6.0.1` was targeting a toolchain newer than Vercel's Amazon Linux 2023 environment.
2.  **Correction:** Downgraded to `5.1.7` (a stable, broadly compatible binary) and implemented `force-dynamic` rendering for Next.js API routes to prevent build-time crashes during route-scanning.

---

## **Phase 5: Final Security Hardening**

### **Critical CVE Resolution**
> **Log:** `Vulnerable version of Next.js detected (CVE-2025-66478).`

### **AI Response:**
Proactively updated the stack to **Next.js 16.2.1** and **React 19.2.0**. This required ensuring that the previously applied native module fixes (GLIBC) remained stable during a major framework version upgrade.

---

## **Summary of Accomplishments**
- **100% Core Requirements Met.**
- **High-Density Hybrid Engine (Regex + LLM).**
- **Streaming Responses & Conversation Memory.**
- **Production-Grade Audit & Forensic Guardrails.**
- **Zero-Latency Visualization UI.**

*This transcript summarizes the end-to-end reasoning and prompting journey of the Dodge S-Tier implementation.*
