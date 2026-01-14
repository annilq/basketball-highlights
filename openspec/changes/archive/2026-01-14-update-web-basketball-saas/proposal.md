# Proposal: Update Web Content for Basketball Video SaaS

**Status:** Draft
**Author:** AI Assistant
**Created:** 2025-01-14

## Summary

Update the marketing website (`apps/web/`) to reflect the basketball video SaaS product that enables media & content creators to create highlight reels. The website will showcase a side-by-side comparison of original basketball footage vs. AI-generated edited highlights, demonstrating the value proposition of automated highlight creation.

## Motivation

The current website content describes a generic "React Starter Kit" developer template, which does not match the actual product being built - a basketball video SaaS platform for content creators. The marketing materials need to accurately represent:

1. The target audience (media & content creators)
2. The core value proposition (automated basketball highlight generation)
3. Key features (original vs edited video comparison)
4. The product's purpose and capabilities

## Proposed Change

Replace all template content in `apps/web/` with basketball-focused SaaS marketing content including:

### Pages to Update:

- **index.astro**: Hero section with video comparison demo, feature highlights, CTA
- **features.astro**: Detailed feature list focused on video processing, AI highlights, export options
- **about.astro**: Company/mission focused on helping creators produce basketball content
- **pricing.astro**: Pricing tiers for different creator needs

### New Content Elements:

- Hero section with side-by-side video player (original vs highlights)
- Feature list emphasizing:
  - AI-powered highlight detection
  - Automatic play recognition
  - Multiple export formats
  - Social media optimization
  - Custom branding options
- Use cases for different creator types (YouTubers, TikTok creators, sports media)
- Technical benefits (fast processing, cloud-based, high quality)

## Success Criteria

- [ ] All pages reference basketball video SaaS (no React Starter Kit references)
- [ ] Home page includes video comparison showcase
- [ ] Content speaks to media & content creators
- [ ] Technical details remain accurate to the underlying stack
- [ ] All links and CTAs point to relevant product features
- [ ] Site validates (no broken references, proper Astro syntax)

## Related Work

- This is the initial marketing content for the basketball video SaaS
- No existing specifications to reference
- Technical stack (React, Astro, Tailwind, ShadCN UI) remains the same

## Risks & Mitigations

| Risk                                 | Mitigation                                              |
| ------------------------------------ | ------------------------------------------------------- |
| Sample videos not available for demo | Use placeholder videos with clear labeling              |
| Uncertain feature set for v1         | Focus on core value proposition; keep features flexible |
| Design doesn't match product vision  | Iterate based on stakeholder review                     |

## Alternatives Considered

1. **Keep generic template**: Rejected - doesn't match product and would confuse users
2. **Minimal content update**: Rejected - doesn't properly communicate value proposition
3. **Full redesign with custom theme**: Rejected - adds unnecessary complexity, current ShadCN/Tailwind setup is sufficient

## Timeline Estimate

- Content drafting: 2-4 hours
- Page implementation: 4-6 hours
- Review and iteration: 2-3 hours
- **Total**: 8-13 hours

## Open Questions

1. Do we have sample basketball videos for the comparison demo?
2. What are the planned pricing tiers for the SaaS?
3. Are there specific social media platforms to highlight (TikTok, YouTube, Instagram)?
4. What export formats should be emphasized?
