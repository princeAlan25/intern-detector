import { Finding } from '../types.js';

export interface RuleMatch {
  finding: Finding;
  scoreImpact: number; // Negative for red flags (reduces trust), positive for trust signals (increases trust)
  type: 'red_flag' | 'trust_signal';
}

export interface Rule {
  id: string;
  name: string;
  evaluate: (content: string) => RuleMatch | null;
}

// 1. Upfront Payment / Fees (Critical Red Flag)
export const upfrontFeeRule: Rule = {
  id: 'upfront-fee',
  name: 'Upfront Payment or Fee Required',
  evaluate: (content: string): RuleMatch | null => {
    const feeRegex = /(?:registration|training|application|processing|background check|equipment|security deposit|software license)\s+fee|(?:pay|wire|send|transfer|deposit)\s+(?:\$|usd\s*|\b\d+\b.*?(?:dollars|fee|deposit))|pay\s+(?:before|to receive|for your training)/gi;
    const matches = content.match(feeRegex);
    if (matches && matches.length > 0) {
      return {
        type: 'red_flag',
        scoreImpact: -4,
        finding: {
          reason: 'Legitimate employers never demand upfront fees, training costs, or registration payments from interns.',
          evidences: Array.from(new Set(matches.map(m => m.trim())))
        }
      };
    }
    return null;
  }
};

// 2. Unrealistic Salary / Easy Money Promises
export const unrealisticSalaryRule: Rule = {
  id: 'unrealistic-salary',
  name: 'Unrealistically High Pay for Entry-Level or Intern Tasks',
  evaluate: (content: string): RuleMatch | null => {
    const salaryRegex = /(?:\$|usd\s*)\s*(?:[5-9]\d{2}|\d{4,})\s*(?:\/|\s*per\s*)(?:hr|hour|day|week)|earn\s+(?:\$|usd\s*)\s*\d{3,}\s*(?:daily|weekly|hourly)|guaranteed\s+(?:\$|usd\s*)\s*\d+/gi;
    const matches = content.match(salaryRegex);
    if (matches && matches.length > 0) {
      return {
        type: 'red_flag',
        scoreImpact: -3,
        finding: {
          reason: 'Excessively high compensation promised for simple entry-level or student work is a common scam bait.',
          evidences: Array.from(new Set(matches.map(m => m.trim())))
        }
      };
    }
    return null;
  }
};

// 3. Unofficial Messaging Channels for Interview (Telegram / WhatsApp)
export const unofficialChannelRule: Rule = {
  id: 'unofficial-channel',
  name: 'Interviews Exclusively via Unofficial Messaging Apps',
  evaluate: (content: string): RuleMatch | null => {
    const channelRegex = /(?:interview|contact|message|reach out|connect|chat)\s+(?:via|on|through)\s+(?:telegram|whatsapp|signal)|(?:telegram|whatsapp)\s+(?:id|handle|username|number|link|chat)/gi;
    const matches = content.match(channelRegex);
    if (matches && matches.length > 0) {
      return {
        type: 'red_flag',
        scoreImpact: -3,
        finding: {
          reason: 'Directing candidates strictly to encrypted messaging platforms like Telegram or WhatsApp bypasses standard recruiting verification.',
          evidences: Array.from(new Set(matches.map(m => m.trim())))
        }
      };
    }
    return null;
  }
};

// 4. Free or Mismatched Public Email Domains for Corporate Offers
export const freeEmailDomainRule: Rule = {
  id: 'free-email-domain',
  name: 'Corporate Offer Using Free Webmail Domain',
  evaluate: (content: string): RuleMatch | null => {
    const emailRegex = /([a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook|live|icloud|protonmail)\.com)/gi;
    const matches = content.match(emailRegex);
    const mentionsCorporate = /(?:google|apple|amazon|microsoft|meta|netflix|goldman\s+sachs|mckinsey|deloitte|ibm|cisco|oracle)/i.test(content);

    if (matches && matches.length > 0) {
      const isSuspect = mentionsCorporate || /(?:hr|recruiting|hiring|careers|talent)@/i.test(matches.join(' '));
      if (isSuspect) {
        return {
          type: 'red_flag',
          scoreImpact: -3,
          finding: {
            reason: 'Recruiters representing established companies communicate from corporate domains, not generic free webmail accounts.',
            evidences: Array.from(new Set(matches.map(m => m.trim())))
          }
        };
      }
    }
    return null;
  }
};

// 5. High Urgency & Immediate Hire Without Formal Process
export const urgencyRule: Rule = {
  id: 'urgency-tactics',
  name: 'Artificial Urgency or Immediate Hire Without Interview',
  evaluate: (content: string): RuleMatch | null => {
    const urgencyRegex = /(?:act\s+now|limited\s+(?:spots|positions|slots)|urgent\s+hiring|apply\s+(?:immediately|within\s+\d+\s+hours?)|offer\s+expires\s+in\s+\d+|hired\s+immediately|start\s+today|no\s+interview\s+required)/gi;
    const matches = content.match(urgencyRegex);
    if (matches && matches.length > 0) {
      return {
        type: 'red_flag',
        scoreImpact: -2,
        finding: {
          reason: 'High-pressure urgency and offers skipping interviews are designed to prevent due diligence.',
          evidences: Array.from(new Set(matches.map(m => m.trim())))
        }
      };
    }
    return null;
  }
};

// 6. Educational Domain (Trust Signal)
export const eduDomainRule: Rule = {
  id: 'edu-domain',
  name: 'Verified Educational or Academic Domain',
  evaluate: (content: string): RuleMatch | null => {
    const eduRegex = /(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+(?:edu|ac\.uk|edu\.[a-z]{2})\b/gi;
    const matches = content.match(eduRegex);
    if (matches && matches.length > 0) {
      return {
        type: 'trust_signal',
        scoreImpact: +3,
        finding: {
          reason: 'Originated from or linked to a verified educational institution (.edu / .ac.uk).',
          evidences: Array.from(new Set(matches.map(m => m.trim())))
        }
      };
    }
    return null;
  }
};

// 7. Legitimate Applicant Tracking System or Career Portal (Trust Signal)
export const atsPortalRule: Rule = {
  id: 'ats-portal',
  name: 'Recognized Applicant Tracking System or Official Portal',
  evaluate: (content: string): RuleMatch | null => {
    const atsRegex = /(?:greenhouse\.io|lever\.co|workday\.com|myworkdayjobs\.com|smartrecruiters\.com|ashbyhq\.com|icims\.com|jobvite\.com)/gi;
    const matches = content.match(atsRegex);
    if (matches && matches.length > 0) {
      return {
        type: 'trust_signal',
        scoreImpact: +3,
        finding: {
          reason: 'Uses an established, industry-standard Applicant Tracking System (ATS).',
          evidences: Array.from(new Set(matches.map(m => m.trim())))
        }
      };
    }
    return null;
  }
};

// List of all active heuristic rules
export const activeRules: Rule[] = [
  upfrontFeeRule,
  unrealisticSalaryRule,
  unofficialChannelRule,
  freeEmailDomainRule,
  urgencyRule,
  eduDomainRule,
  atsPortalRule,
];

/**
 * Runs all active rules on the provided content and returns all matches.
 */
export function evaluateRules(content: string): RuleMatch[] {
  const matches: RuleMatch[] = [];
  for (const rule of activeRules) {
    const match = rule.evaluate(content);
    if (match) {
      matches.push(match);
    }
  }
  return matches;
}
