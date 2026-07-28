# AI Governance & Security Baseline: GDPR + EU AI Act

> **Not legal advice.** This is an operational planning baseline for a solo founder, compiled from public regulatory text and 2024–2026 secondary sources. Treat every claim as a starting point for a real lawyer or DPO review before contracts, marketing claims, or high-risk use cases are involved. Flagged uncertainties below are genuinely unsettled — do not over-index on them.

## Why this applies to PrimeCircle

PrimeCircle sells AI-automation services (n8n workflows, chatbots, LLM-backed tools) built on Hostinger, Twilio, OpenRouter/LLM APIs, and Supabase, to small-business customers. The moment PrimeCircle stores a prospect's email, runs a chatbot for a customer, or processes an EU resident's data through any of these tools, GDPR applies — regardless of the founder's location. The EU AI Act applies in parallel wherever PrimeCircle's product outputs AI-generated content or runs an AI chat interface used by people in the EU.

---

## 1. GDPR Essentials

**Legal basis (Art. 6).** Every use of personal data needs one of six lawful bases. For a service business, the two that matter almost daily:
- *Contract*: processing needed to deliver a paid service to a customer.
- *Legitimate interest*: cautious B2B marketing/outreach to prospects, provided a documented balancing test shows the interest doesn't override the individual's rights. Cold B2C outreach generally needs *consent* instead; national e-privacy/ePrivacy rules on unsolicited email add a second layer on top of GDPR.

**Data Processing Agreements (Art. 28).** Every vendor that processes personal data on PrimeCircle's behalf (Hostinger, Twilio, OpenRouter, Supabase, any LLM API) is a "processor," and PrimeCircle needs a written DPA with each one before sending them customer data. In practice this means: locate each vendor's standard DPA (most SaaS/cloud vendors publish one — check Hostinger's and Twilio's trust/legal pages, and OpenRouter's terms/DPA for API usage), accept or countersign it, and keep a copy. A DPA must, at minimum, restrict the processor to documented instructions, impose confidentiality, require sub-processor flow-down and notice of sub-processor changes (commonly a 14–30 day objection window), require deletion/return of data at contract end, and support the controller's breach-notification and audit obligations.

**International transfers.** Twilio and most LLM API providers (OpenRouter routes to US/global model providers) are US-based. Since the 2023 EU–US Data Privacy Framework (DPF), transfers to DPF-certified US recipients don't strictly need Standard Contractual Clauses (SCCs), but a "Schrems III" challenge is anticipated in EU privacy circles as of early 2026 and hasn't been resolved — best practice is to confirm DPF certification for each vendor and keep SCCs + a short Transfer Impact Assessment on file as a fallback regardless. Hostinger, if EU/EEA-based, is simpler but still needs a standard DPA.

**Records of processing (Art. 30).** The <250-employee exemption is narrow and, per EDPB guidance, essentially never applies to a business running a website, CRM, or email marketing — "occasional" excludes normal recurring business activity. Practical reading: assume PrimeCircle needs a lightweight Art. 30 record (a spreadsheet: what data, why, legal basis, who it's shared with, retention, security measures) from day one. This is low effort and doubles as the internal map needed for DPAs and breach response anyway.

**Data Protection Officer (Art. 37).** Not employee-count-based. Triggered by large-scale systematic monitoring of individuals, or large-scale processing of special-category/criminal data, as a *core* activity. A small automation vendor doing routine B2B customer data and chatbot support is very unlikely to trigger this — revisit only if PrimeCircle builds products around biometric data, health data, or large-scale behavioral profiling/monitoring as the core offering.

**Data subject rights.** Customers and their end-users can request access, correction, deletion, portability, and objection to processing. Needs at minimum a documented process (even manual) to receive, verify, and respond to such requests within one month, and an inventory of where personal data lives (Supabase tables, n8n workflow logs, Twilio message logs, LLM prompt logs) so deletion requests are actually executable.

**Breach notification (Art. 33/34).** If a breach is likely to risk individuals' rights, PrimeCircle (as controller) must notify its supervisory authority within 72 hours of becoming aware, and affected individuals "without undue delay" if the risk is high. Phased/incomplete initial notifications are explicitly allowed. Needs a one-page breach response plan and a breach log (even for non-reportable incidents) before this becomes urgent.

**EU vs. non-EU customer nuance.** GDPR's territorial reach (Art. 3) is triggered by *targeting* — offering goods/services to, or monitoring, people in the EU — not merely incidental contact with EU data. If PrimeCircle initially sells only to non-EU small businesses with no EU customers, marketing, or end-users, GDPR exposure is much lower (though vendor-level exposure via Twilio/Hostinger/OpenRouter's own EU dealings may still apply to them, not necessarily to PrimeCircle). The moment an EU-based customer or an EU end-user of a customer's chatbot appears, full GDPR applies to that relationship.

**Penalties, for calibration.** Two tiers: lower (€10M or 2% global turnover) for procedural failures like missing DPAs or breach notification; upper (€20M or 4%) for core violations like lacking a legal basis. Enforcement against genuinely small, non-negligent operators tends to start with warnings/corrective orders rather than jumping to fines, but the exposure is real once revenue and data volume grow.

---

## 2. EU AI Act Essentials

**Risk tier.** A small-business automation/chatbot vendor using third-party LLM APIs (OpenRouter, OpenAI, Anthropic, etc.) to build workflows and customer-facing chatbots is, in the overwhelming majority of cases, **minimal or limited risk**, not high-risk. High-risk status (Annex III) is triggered by specific use cases: employment/HR decisions (CV screening, candidate ranking, performance evaluation), creditworthiness/credit scoring, biometric identification or categorization, and a handful of other sensitive domains (education access, essential public/private services, law enforcement, migration). **Flag explicitly:** if PrimeCircle ever builds a client-facing product that screens job applicants, scores creditworthiness, or processes biometric data, that specific product moves into high-risk territory and triggers a materially heavier compliance regime (conformity assessment, technical documentation, human oversight, quality management system) — treat any such request as a stop-and-reassess moment, not a standard build.

**Provider vs. deployer.** PrimeCircle is a "deployer" of the underlying LLM (OpenRouter/OpenAI/Anthropic are the "providers"). Deployer obligations for GPAI-based products are lighter than provider obligations but not zero: basic vendor due diligence (confirm the model provider's compliance posture — most major LLM providers, including Anthropic and OpenAI, are signatories to the EU's GPAI Code of Practice, which creates a compliance presumption), understanding data flow through the API, and monitoring outputs for accuracy/harm relative to intended use.

**Transparency obligations (Art. 50).** This is the obligation most directly relevant to PrimeCircle's actual product line, and it applies regardless of risk tier:
- Any chatbot or conversational AI system must be designed so people are informed, in plain and accessible terms, that they are interacting with AI (typically a disclosure at the start of the interaction, e.g. "You're chatting with an AI assistant").
- AI-generated or manipulated content (image/audio/video) intended to look authentic generally needs to be marked as AI-generated/synthetic.
- These are baseline product-design requirements to build into every chatbot/automation deliverable, not optional client add-ons.

**Deadlines that matter in 2026.** Per the current (post-Omnibus, May 2026) schedule:
- General provisions, prohibited practices, AI literacy: already in force since Feb 2, 2025.
- GPAI model provider obligations: in force since Aug 2, 2025.
- **Article 50 transparency obligations (chatbot disclosure, synthetic-content marking) — apply from Aug 2, 2026**, with a further transition to Dec 2, 2026 for marking systems already on the market before Aug 2026. This is the deadline most directly relevant to PrimeCircle.
- High-risk (Annex III) obligations: deferred by the 2026 Digital Omnibus agreement from Aug 2026 to **Dec 2, 2027**.
- Full applicability across the Act: Aug 2, 2027.

**SME accommodations.** The Act (as amended by the 2026 Omnibus) gives SMEs (extended to companies up to 750 employees / €150M revenue) simplified technical documentation, proportionate quality-management requirements, free/priority access to regulatory sandboxes, and — importantly — fine caps use whichever amount is *lower* (fixed sum vs. % of turnover) rather than higher, which meaningfully caps downside for a pre-revenue or early-revenue business. This is a real advantage worth relying on but doesn't remove the underlying obligations, only softens the paperwork and penalty exposure.

**Uncertain / still evolving — flag clearly:** (a) the exact interaction between the Digital Omnibus's deferred high-risk timeline and national enforcement priorities is still settling as of mid-2026; (b) formal harmonized standards and Commission guidance for Art. 50 disclosure format (how exactly a chatbot must disclose) were still being finalized in early-to-mid 2026 — check the AI Act Service Desk for the current guidance text before finalizing a standard disclosure template; (c) whether the anticipated "Schrems III" challenge to the EU–US DPF materializes could affect the international-transfer posture in section 1.

---

## 3. Practical Checklist

### Before the first paying customer (do now, low effort)
- [ ] Adopt a privacy policy and cookie/consent notice for the website (index.html) covering what's actually collected.
- [ ] Get a signed/accepted DPA on file from each processor currently in use or planned: Hostinger, Twilio, OpenRouter (and whichever LLM API sits behind it), Supabase. Check each vendor's own DPA/legal page; most major providers self-serve this.
- [ ] Confirm each US-based vendor's EU–US DPF certification status; save SCCs as fallback documentation regardless.
- [ ] Build a one-page Art. 30 record: what personal data, why, legal basis, where stored, retention period, who it's shared with. Keep as a living doc.
- [ ] Write a one-page breach response plan: who to notify (which supervisory authority, if/when EU customers exist), 72-hour internal escalation trigger, breach log template.
- [ ] Add a standard chatbot AI-disclosure line ("You are talking to an AI assistant") to every chatbot/automation product template built for clients — bake it into the workflow template now so it's not a retrofit later.
- [ ] Decide and document legal basis for any outbound prospecting (legitimate interest with a written balancing note, or consent) before running cold outreach campaigns.
- [ ] Set data retention defaults (e.g., delete chat logs / lead data after N months) in n8n/Supabase configs rather than keeping everything indefinitely by default.

### Revisit later (once EU customers, scale, or higher-risk use cases appear)
- [ ] Formal DPO assessment: only if a client engagement moves into large-scale systematic monitoring or special-category data as a core activity.
- [ ] Full data subject rights request process/tooling, build out once request volume justifies more than a manual process (roughly: first EU customers or first real request).
- [ ] Detailed Transfer Impact Assessments per vendor: before any EU customer with sensitive data volume, or if the Schrems III challenge materializes.
- [ ] Annex III high-risk classification review: mandatory *before* accepting any client project involving HR/recruitment screening, credit/creditworthiness scoring, or biometric identification. Treat as a hard gate, not a checklist item to defer.
- [ ] EU AI Act conformity assessment, technical documentation, QMS — only if a high-risk product is actually built (unlikely for the current product line, but re-check per project).
- [ ] Formal vendor due-diligence file per GPAI provider (Code of Practice signatory status, documentation review) — worth doing once the company has multiple LLM-dependent client products in production, not for a single prototype.
- [ ] Reassess SME thresholds (employee count / turnover) annually — the accommodations in Section 2 depend on staying under them.

---

## 4. Sources

GDPR:
- [Art. 3 GDPR – Territorial scope](https://gdpr-info.eu/art-3-gdpr/) — gdpr-info.eu (consolidated regulation text)
- [Does the GDPR apply to companies outside of the EU?](https://gdpr.eu/companies-outside-of-europe/) — GDPR.eu
- [EDPB Guidelines 3/2018 on the territorial scope of the GDPR](https://www.edpb.europa.eu/sites/default/files/files/file1/edpb_guidelines_3_2018_territorial_scope_after_public_consultation_en_1.pdf) — EDPB
- [Art. 28 GDPR – Processor](https://gdpr-info.eu/art-28-gdpr/) — gdpr-info.eu
- [Art. 30 GDPR – Records of processing activities](https://gdpr-info.eu/art-30-gdpr/) — gdpr-info.eu
- [Guidance Note: Records of Processing Activities (RoPA) under Article 30 GDPR](https://www.dataprotection.ie/sites/default/files/uploads/2023-04/Records%20of%20Processing%20Activities%20(RoPA)%20under%20Article%2030%20GDPR.pdf) — Irish Data Protection Commission, 2023
- [Does my company/organisation need to have a Data Protection Officer (DPO)?](https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/obligations/data-protection-officers/does-my-companyorganisation-need-have-data-protection-officer-dpo_en) — European Commission
- [Data Protection Officer, EDPB SME data protection guide](https://www.edpb.europa.eu/sme-data-protection-guide/data-protection-officer_en) — EDPB
- [GDPR Breach Notification: The 72-Hour Rule Explained](https://www.complyjet.com/blog/gdpr-breach-notification) — 2026 secondary summary; cross-check against Art. 33/34 text on gdpr-info.eu
- [Standard Contractual Clauses (SCC), European Commission](https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/standard-contractual-clauses-scc_en) — European Commission, official SCC source
- [Standard Contractual Clauses (SCCs): GDPR Guide for 2026](https://www.legiscope.com/blog/standard-contractual-clauses-gdpr.html) — secondary summary noting DPF/Schrems III status, 2026

EU AI Act:
- [Timeline for the Implementation of the EU AI Act](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act) — European Commission AI Act Service Desk (official)
- [EU AI Act Omnibus Agreement, Postponed High-Risk Deadlines and Other Key Changes](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/) — Gibson Dunn, May 2026, on the Digital Omnibus deferral of Annex III obligations to Dec 2, 2027
- [Article 50: Transparency Obligations for Providers and Deployers of Certain AI Systems](https://artificialintelligenceact.eu/article/50/) — artificialintelligenceact.eu (EU AI Act text mirror)
- [Article 50: Transparency obligations, AI Act Service Desk](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50) — European Commission (official)
- [Limited-Risk AI—A Deep Dive Into Article 50](https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20240528-limited-risk-ai-a-deep-dive-into-article-50-of-the-european-unions-ai-act) — WilmerHale, May 2024
- [AI Act transparency obligations from 2 August](https://bratby.law/ai-act-transparency-obligations-2026/) — Bratby Law, 2026
- [Annex III: High-Risk AI Systems Referred to in Article 6(2)](https://artificialintelligenceact.eu/annex/3/) — artificialintelligenceact.eu (text mirror)
- [Annex III, AI Act Service Desk](https://ai-act-service-desk.ec.europa.eu/en/ai-act/annex-3) — European Commission (official)
- [Small Businesses' Guide to the AI Act](https://artificialintelligenceact.eu/small-businesses-guide-to-the-ai-act/) — artificialintelligenceact.eu
- [AI Act Update: EU Resolves to Change Rules and Extend Deadlines](https://www.lw.com/en/insights/ai-act-update-eu-resolves-to-change-rules-and-extend-deadlines) — Latham & Watkins, 2026, on extended SME thresholds (750 employees / €150M) and lower-of fine caps
- [EU AI Act Obligations for Companies That Use OpenAI, Gemini, or Azure AI APIs](https://www.softwareseni.com/eu-ai-act-obligations-for-companies-that-use-openai-gemini-or-azure-ai-apis/) — SoftwareSeni, on deployer obligations for GPAI API users
- [The General-Purpose AI Code of Practice](https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai) — European Commission (official), on provider signatory status incl. Anthropic/OpenAI
- [AI Act | Shaping Europe's digital future](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai) — European Commission (official landing page)

**Verification note:** All 2026-dated secondary sources above reflect the Digital Omnibus agreement of May 7, 2026, which shifted several deadlines after the Act's original 2024 text. Because the Omnibus process was still resolving through mid-2026, re-check the official [AI Act Service Desk timeline](https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act) before relying on any specific date here more than a few months out.
