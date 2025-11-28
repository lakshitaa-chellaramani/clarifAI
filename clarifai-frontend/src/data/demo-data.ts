// Demo data for ClarifAI dashboard

export const demoTopics = [
  {
    id: "karnataka-crisis",
    title: "Karnataka Congress Leadership Crisis",
    riskScore: 8,
    sourceCount: 12,
    claimCount: 34,
    isNew: true,
  },
  {
    id: "hong-kong-fire",
    title: "Hong Kong High-Rise Fire",
    riskScore: 6,
    sourceCount: 8,
    claimCount: 21,
    isNew: false,
  },
  {
    id: "tech-layoffs",
    title: "Tech Industry Layoffs 2025",
    riskScore: 4,
    sourceCount: 15,
    claimCount: 18,
    isNew: false,
  },
  {
    id: "climate-summit",
    title: "Climate Summit Announcements",
    riskScore: 3,
    sourceCount: 20,
    claimCount: 12,
    isNew: false,
  },
];

export const demoSources = [
  {
    id: "toi",
    name: "Times of India",
    domain: "timesofindia.com",
    trustScore: 94,
    change: 3,
    verifiedClaims: 12,
    contradictions: 0,
  },
  {
    id: "ndtv",
    name: "NDTV",
    domain: "ndtv.com",
    trustScore: 87,
    change: -2,
    verifiedClaims: 9,
    contradictions: 1,
  },
  {
    id: "ht",
    name: "Hindustan Times",
    domain: "hindustantimes.com",
    trustScore: 82,
    change: 0,
    verifiedClaims: 7,
    contradictions: 0,
  },
  {
    id: "it",
    name: "India Today",
    domain: "indiatoday.in",
    trustScore: 79,
    change: 1,
    verifiedClaims: 8,
    contradictions: 1,
  },
  {
    id: "unknown",
    name: "Unknown Blog",
    domain: "unknown-blog.com",
    trustScore: 23,
    change: -5,
    verifiedClaims: 0,
    contradictions: 3,
  },
];

export const demoClaims = [
  {
    id: "claim-1",
    text: "CM Siddaramaiah has submitted resignation to high command",
    source: "Times of India",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    status: "checking" as const,
  },
  {
    id: "claim-2",
    text: "Sources confirm CM has NOT resigned and continues in office",
    source: "NDTV",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: "conflict" as const,
  },
  {
    id: "claim-3",
    text: "Congress high command summons both leaders for discussions",
    source: "Hindustan Times",
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    status: "verified" as const,
  },
  {
    id: "claim-4",
    text: "DK Shivakumar to be announced as new CM by Friday",
    source: "India Today",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: "checking" as const,
  },
  {
    id: "claim-5",
    text: "Violence reported outside Congress office in Bengaluru",
    source: "Unknown Blog",
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    status: "false" as const,
  },
];

// Enhanced graph data for impressive visualization
export const demoGraphNodes = [
  // Events (Blue)
  { id: "e1", label: "High Command Summons Leaders", type: "event" as const },
  { id: "e2", label: "Emergency Meeting Called", type: "event" as const },
  { id: "e3", label: "Press Conference", type: "event" as const },
  { id: "e4", label: "Party Workers Gather", type: "event" as const },
  { id: "e5", label: "Delhi Discussions", type: "event" as const },

  // Entities (Green)
  { id: "p1", label: "Siddaramaiah", type: "entity" as const },
  { id: "p2", label: "DK Shivakumar", type: "entity" as const },
  { id: "p3", label: "Congress High Command", type: "entity" as const },
  { id: "p4", label: "Rahul Gandhi", type: "entity" as const },
  { id: "p5", label: "Mallikarjun Kharge", type: "entity" as const },
  { id: "p6", label: "Karnataka Congress", type: "entity" as const },
  { id: "p7", label: "AICC", type: "entity" as const },

  // Claims (Amber)
  { id: "c1", label: "CM Resigned", type: "claim" as const },
  { id: "c2", label: "No Resignation Filed", type: "claim" as const },
  { id: "c3", label: "New CM by Friday", type: "claim" as const },
  { id: "c4", label: "Power Sharing Deal", type: "claim" as const },
  { id: "c5", label: "Violence at Office", type: "claim" as const },
  { id: "c6", label: "Peaceful Transition", type: "claim" as const },

  // Sources (Gray)
  { id: "s1", label: "Times of India", type: "source" as const },
  { id: "s2", label: "NDTV", type: "source" as const },
  { id: "s3", label: "Hindustan Times", type: "source" as const },
  { id: "s4", label: "India Today", type: "source" as const },
  { id: "s5", label: "The Hindu", type: "source" as const },
  { id: "s6", label: "Unknown Blog", type: "source" as const },
];

export const demoGraphEdges = [
  // Event relationships
  { source: "p3", target: "e1", relationship: "INITIATED" },
  { source: "e1", target: "e2", relationship: "TRIGGERED" },
  { source: "e2", target: "e5", relationship: "LED_TO" },
  { source: "e5", target: "e3", relationship: "FOLLOWED_BY" },

  // Entity participation
  { source: "p1", target: "e1", relationship: "SUMMONED_TO" },
  { source: "p2", target: "e1", relationship: "SUMMONED_TO" },
  { source: "p4", target: "e5", relationship: "PARTICIPATED_IN" },
  { source: "p5", target: "e5", relationship: "CHAIRED" },
  { source: "p6", target: "e4", relationship: "ORGANIZED" },

  // Entity relationships
  { source: "p1", target: "p6", relationship: "LEADS" },
  { source: "p2", target: "p6", relationship: "DEPUTY_OF" },
  { source: "p3", target: "p7", relationship: "PART_OF" },
  { source: "p4", target: "p3", relationship: "MEMBER_OF" },

  // Source reporting
  { source: "s1", target: "c1", relationship: "REPORTED" },
  { source: "s2", target: "c2", relationship: "REPORTED" },
  { source: "s3", target: "c4", relationship: "REPORTED" },
  { source: "s4", target: "c3", relationship: "REPORTED" },
  { source: "s5", target: "c6", relationship: "REPORTED" },
  { source: "s6", target: "c5", relationship: "REPORTED" },

  // Claim relationships
  { source: "c1", target: "c2", relationship: "CONTRADICTS" },
  { source: "c5", target: "c6", relationship: "CONTRADICTS" },
  { source: "c3", target: "e5", relationship: "ABOUT" },
  { source: "c4", target: "p1", relationship: "INVOLVES" },
  { source: "c4", target: "p2", relationship: "INVOLVES" },

  // Verification links
  { source: "c1", target: "p1", relationship: "CLAIMS_ABOUT" },
  { source: "c2", target: "p1", relationship: "CLAIMS_ABOUT" },
  { source: "c6", target: "e4", relationship: "DESCRIBES" },
];

export const demoStats = {
  claimsAnalyzed: 1247,
  accuracyRate: 89,
  sourcesTracked: 47,
  misinfoDetected: 12,
};
