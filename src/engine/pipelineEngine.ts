import {
  ClaimCategory,
  Confidence,
  RegistryProvision,
  ReviewQueueItem,
} from '../types/schema';
import { REGULATORY_PROVISIONS } from '../data/regulatoryProvisions';
import { CONFIDENCE_THRESHOLD_MEDIUM } from './cardBuilder';

export interface ExtractedClaimResult {
  claim_text: string;
  claim_context: string;
  claim_category: ClaimCategory[];
  source_quote: string;
  source_url: string;
  language: string;
  confidence: number;
  quote_verified: boolean;
}

export interface ClassificationResult {
  claim_text: string;
  claim_category: ClaimCategory;
  confidence: number;
  reasoning: string;
}

export interface MatchResult {
  claim_text: string;
  matched_provision_id: string | null;
  matched_provision?: RegistryProvision | null;
  match: boolean;
  confidence: number;
  reasoning: string;
  method: 'exact_normalized' | 'semantic_lexical' | 'none';
  exception_applies: boolean;
  banned: boolean;
}

export interface PipelineExecutionReport {
  timestamp: string;
  raw_input: string;
  extracted_claims: ExtractedClaimResult[];
  classifications: ClassificationResult[];
  matches: MatchResult[];
  queued_reviews: ReviewQueueItem[];
}

const KNOWN_PATTERNS = [
  /100%\s+recyclable/i,
  /carbon\s+neutral/i,
  /net[\s-]?zero/i,
  /clinically\s+proven/i,
  /dermatologically\s+tested/i,
  /dermatological\s+formula/i,
  /gentle\s+flake\s+removal/i,
  /anti[\s-]?dandruff/i,
  /flakes?\s+(control|removal)/i,
  /scalp[\s-]?(balancing|soothing|calming)/i,
  /normalizes?\s+scalp/i,
  /#\s*1\s+dermatologist/i,
  /natural\s+power/i,
  /cruelty[\s-]?free/i,
  /salicylic\s+acid/i,
  /selenium\s+sulfide/i,
  /zinc\s+pyrithione/i,
  /piroctone\s+olamine/i,
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\w\s%]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractClaimsFromText(
  rawText: string,
  sourceUrl: string = 'https://registry.audit/source'
): ExtractedClaimResult[] {
  const sentences = rawText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const results: ExtractedClaimResult[] = [];

  for (const sentence of sentences) {
    const hasPattern = KNOWN_PATTERNS.some((pat) => pat.test(sentence));
    const quoteVerified = rawText.includes(sentence);

    let categories: ClaimCategory[] = ['other'];
    let context = 'product_page_hero';
    let baseConfidence = 0.88;

    if (/recyclab/i.test(sentence)) {
      categories = ['recyclability_claim'];
      context = 'package_back';
      baseConfidence = 0.95;
    } else if (/carbon|climate|offset/i.test(sentence)) {
      categories = ['carbon_claim', 'offset_claim'];
      context = 'corporate_sustainability';
      baseConfidence = 0.92;
    } else if (/dermatological\s+formula/i.test(sentence)) {
      categories = ['brand_dermatological_claim', 'safety_positioning_claim'];
      context = 'package_front';
      baseConfidence = 0.85;
    } else if (/flake\s+removal|anti-dandruff/i.test(sentence)) {
      categories = ['efficacy_claim'];
      if (/sensitive|dry\s+scalp/i.test(sentence)) {
        categories.push('targeting_claim');
      }
      context = 'product_page_hero';
      baseConfidence = 0.91;
    } else if (/soothing|calm|normaliz/i.test(sentence)) {
      categories = ['wellness_claim', 'efficacy_claim'];
      context = 'product_page_body';
      baseConfidence = 0.82;
    } else if (/natural/i.test(sentence)) {
      categories = ['natural_claim'];
      context = 'product_marketing';
      baseConfidence = 0.78;
    } else if (/#\s*1/i.test(sentence)) {
      categories = ['superlative_claim'];
      context = 'pharmacy_listing';
      baseConfidence = 0.86;
    }

    if (hasPattern || sentence.length > 15) {
      results.push({
        claim_text: sentence,
        claim_context: context,
        claim_category: categories,
        source_quote: sentence,
        source_url: sourceUrl,
        language: 'en',
        confidence: quoteVerified ? baseConfidence : 0.4,
        quote_verified: quoteVerified,
      });
    }
  }

  return results;
}

export function classifyClaimText(
  claimText: string,
  context?: string
): ClassificationResult {
  const norm = normalizeText(claimText);

  if (norm.includes('recyclab')) {
    return {
      claim_text: claimText,
      claim_category: 'recyclability_claim',
      confidence: 0.96,
      reasoning: 'Explicitly specifies recyclable packaging attributes under ECGT Annex I scope.',
    };
  }
  if (norm.includes('carbon') || norm.includes('climate')) {
    return {
      claim_text: claimText,
      claim_category: 'carbon_claim',
      confidence: 0.94,
      reasoning: 'GHG or carbon compensation/neutrality statement.',
    };
  }
  if (norm.includes('dermatological formula')) {
    return {
      claim_text: claimText,
      claim_category: 'brand_dermatological_claim',
      confidence: 0.88,
      reasoning: 'Evokes clinical dermatologist development partnership or validation.',
    };
  }
  if (norm.includes('# 1') || norm.includes('number 1') || norm.includes('leading')) {
    return {
      claim_text: claimText,
      claim_category: 'superlative_claim',
      confidence: 0.92,
      reasoning: 'Comparative superlative market share or recommendation standing.',
    };
  }
  if (norm.includes('natural power') || norm.includes('100% natural')) {
    return {
      claim_text: claimText,
      claim_category: 'natural_claim',
      confidence: 0.84,
      reasoning: 'Botanical naturalness claim subject to ECGT Directive scrutiny.',
    };
  }
  if (norm.includes('targets') && (norm.includes('microorganism') || norm.includes('yeast') || norm.includes('malassezia'))) {
    return {
      claim_text: claimText,
      claim_category: 'mechanism_claim',
      confidence: 0.91,
      reasoning: 'Explains biological antimicrobial mode of action.',
    };
  }
  if (norm.includes('flake') || norm.includes('dandruff') || norm.includes('remov')) {
    return {
      claim_text: claimText,
      claim_category: 'efficacy_claim',
      confidence: 0.89,
      reasoning: 'Direct cosmetic or OTC therapeutic performance outcome.',
    };
  }

  return {
    claim_text: claimText,
    claim_category: 'other',
    confidence: 0.52, // Below medium threshold -> triggers review queue!
    reasoning: 'General brand statement without dominant single classification trigger.',
  };
}

export function matchClaimToProvisions(
  claimText: string,
  provisions: RegistryProvision[] = REGULATORY_PROVISIONS,
  evidenceProvided: boolean = false
): MatchResult {
  const normClaim = normalizeText(claimText);

  // Exact / near-exact match
  for (const prov of provisions) {
    const normProv = normalizeText(prov.text);
    if (normClaim.includes(normProv) || normProv.includes(normClaim)) {
      const exceptionApplies = prov.banned && prov.exception_criteria && evidenceProvided ? true : false;
      return {
        claim_text: claimText,
        matched_provision_id: prov.provision_id,
        matched_provision: prov,
        match: true,
        confidence: 0.98,
        reasoning: `Exact or subset match with regulatory provision ${prov.provision_id}`,
        method: 'exact_normalized',
        exception_applies: exceptionApplies,
        banned: prov.banned && !exceptionApplies,
      };
    }
  }

  // Lexical & semantic keyword matching
  let bestMatch: RegistryProvision | null = null;
  let bestScore = 0;

  for (const prov of provisions) {
    const provTokens = normalizeText(prov.text).split(' ');
    let hits = 0;
    for (const t of provTokens) {
      if (t.length > 3 && normClaim.includes(t)) {
        hits++;
      }
    }
    const score = hits / Math.max(provTokens.length, 1);
    if (score > bestScore && score >= 0.4) {
      bestScore = score;
      bestMatch = prov;
    }
  }

  if (bestMatch) {
    const confidence = Math.min(0.65 + bestScore * 0.3, 0.94);
    const exceptionApplies = bestMatch.banned && bestMatch.exception_criteria && evidenceProvided ? true : false;
    return {
      claim_text: claimText,
      matched_provision_id: bestMatch.provision_id,
      matched_provision: bestMatch,
      match: true,
      confidence,
      reasoning: `Lexical candidate match with ${bestMatch.provision_id} (${Math.round(bestScore * 100)}% keyword overlap)`,
      method: 'semantic_lexical',
      exception_applies: exceptionApplies,
      banned: bestMatch.banned && !exceptionApplies,
    };
  }

  return {
    claim_text: claimText,
    matched_provision_id: null,
    matched_provision: null,
    match: false,
    confidence: 0.35,
    reasoning: 'No statutory prohibition or restricted monograph directly matched.',
    method: 'none',
    exception_applies: false,
    banned: false,
  };
}

export function runFullPipeline(
  rawText: string,
  sourceUrl: string = 'https://www.eucerin.de/demo',
  evidenceAvailable: boolean = false
): PipelineExecutionReport {
  const extracted = extractClaimsFromText(rawText, sourceUrl);
  const classifications: ClassificationResult[] = [];
  const matches: MatchResult[] = [];
  const reviews: ReviewQueueItem[] = [];

  for (const claim of extracted) {
    // Classification
    const cls = classifyClaimText(claim.claim_text, claim.claim_context);
    classifications.push(cls);

    if (cls.confidence < CONFIDENCE_THRESHOLD_MEDIUM) {
      reviews.push({
        id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        stage: 'classification',
        claim_text: claim.claim_text,
        reason: `Confidence ${cls.confidence.toFixed(2)} is below 0.60 threshold`,
        confidence: cls.confidence,
        payload: { claim, cls },
        created_at: new Date().toISOString(),
      });
    }

    // Matching
    const m = matchClaimToProvisions(claim.claim_text, REGULATORY_PROVISIONS, evidenceAvailable);
    matches.push(m);

    if (m.match && m.confidence < CONFIDENCE_THRESHOLD_MEDIUM) {
      reviews.push({
        id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        stage: 'matching',
        claim_text: claim.claim_text,
        reason: `Regulatory match confidence ${m.confidence.toFixed(2)} below threshold`,
        confidence: m.confidence,
        payload: { claim, match: m },
        created_at: new Date().toISOString(),
      });
    }
  }

  return {
    timestamp: new Date().toISOString(),
    raw_input: rawText,
    extracted_claims: extracted,
    classifications,
    matches,
    queued_reviews: reviews,
  };
}
