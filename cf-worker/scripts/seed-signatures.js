#!/usr/bin/env node
/**
 * Seed attack signatures to Cloudflare KV
 * This populates the edge cache with known attack patterns
 */

const signatures = [
  // Prompt Injection patterns
  { key: 'sig:injection:001', value: JSON.stringify({ pattern: 'ignore previous instructions', type: 'prompt_injection', severity: 'critical', confidence: 0.95 }) },
  { key: 'sig:injection:002', value: JSON.stringify({ pattern: 'ignore all previous instructions', type: 'prompt_injection', severity: 'critical', confidence: 0.95 }) },
  { key: 'sig:injection:003', value: JSON.stringify({ pattern: 'ignore the previous', type: 'prompt_injection', severity: 'high', confidence: 0.85 }) },
  { key: 'sig:injection:004', value: JSON.stringify({ pattern: 'new instructions:', type: 'prompt_injection', severity: 'high', confidence: 0.80 }) },
  { key: 'sig:injection:005', value: JSON.stringify({ pattern: 'system prompt:', type: 'prompt_injection', severity: 'high', confidence: 0.85 }) },
  { key: 'sig:injection:006', value: JSON.stringify({ pattern: 'you are now', type: 'prompt_injection', severity: 'medium', confidence: 0.70 }) },
  { key: 'sig:injection:007', value: JSON.stringify({ pattern: 'roleplay as', type: 'prompt_injection', severity: 'medium', confidence: 0.65 }) },
  { key: 'sig:injection:008', value: JSON.stringify({ pattern: 'pretend to be', type: 'prompt_injection', severity: 'medium', confidence: 0.65 }) },
  
  // Jailbreak patterns
  { key: 'sig:jailbreak:001', value: JSON.stringify({ pattern: 'DAN mode', type: 'jailbreak', severity: 'critical', confidence: 0.95 }) },
  { key: 'sig:jailbreak:002', value: JSON.stringify({ pattern: 'do anything now', type: 'jailbreak', severity: 'high', confidence: 0.90 }) },
  { key: 'sig:jailbreak:003', value: JSON.stringify({ pattern: 'developer mode', type: 'jailbreak', severity: 'high', confidence: 0.85 }) },
  { key: 'sig:jailbreak:004', value: JSON.stringify({ pattern: 'STAN', type: 'jailbreak', severity: 'high', confidence: 0.85 }) },
  { key: 'sig:jailbreak:005', value: JSON.stringify({ pattern: 'jailbreak', type: 'jailbreak', severity: 'medium', confidence: 0.75 }) },
  { key: 'sig:jailbreak:006', value: JSON.stringify({ pattern: 'no restrictions', type: 'jailbreak', severity: 'high', confidence: 0.85 }) },
  { key: 'sig:jailbreak:007', value: JSON.stringify({ pattern: 'no limits', type: 'jailbreak', severity: 'medium', confidence: 0.70 }) },
  { key: 'sig:jailbreak:008', value: JSON.stringify({ pattern: 'bypass safety', type: 'jailbreak', severity: 'critical', confidence: 0.95 }) },
  { key: 'sig:jailbreak:009', value: JSON.stringify({ pattern: 'ignore safety', type: 'jailbreak', severity: 'critical', confidence: 0.95 }) },
  { key: 'sig:jailbreak:010', value: JSON.stringify({ pattern: 'ignore ethics', type: 'jailbreak', severity: 'high', confidence: 0.85 }) },
  
  // Data Exfiltration patterns
  { key: 'sig:exfil:001', value: JSON.stringify({ pattern: 'system prompt', type: 'data_exfiltration', severity: 'high', confidence: 0.90 }) },
  { key: 'sig:exfil:002', value: JSON.stringify({ pattern: 'training data', type: 'data_exfiltration', severity: 'high', confidence: 0.85 }) },
  { key: 'sig:exfil:003', value: JSON.stringify({ pattern: 'internal knowledge', type: 'data_exfiltration', severity: 'medium', confidence: 0.75 }) },
  { key: 'sig:exfil:004', value: JSON.stringify({ pattern: 'repeat after me', type: 'data_exfiltration', severity: 'medium', confidence: 0.70 }) },
  { key: 'sig:exfil:005', value: JSON.stringify({ pattern: 'output your', type: 'data_exfiltration', severity: 'medium', confidence: 0.70 }) },
  { key: 'sig:exfil:006', value: JSON.stringify({ pattern: 'show me your', type: 'data_exfiltration', severity: 'low', confidence: 0.60 }) },
  
  // Adversarial patterns
  { key: 'sig:adversarial:001', value: JSON.stringify({ pattern: 'base64', type: 'adversarial', severity: 'low', confidence: 0.50 }) },
  { key: 'sig:adversarial:002', value: JSON.stringify({ pattern: 'base 64', type: 'adversarial', severity: 'low', confidence: 0.50 }) },
  { key: 'sig:adversarial:003', value: JSON.stringify({ pattern: 'rot13', type: 'adversarial', severity: 'medium', confidence: 0.65 }) },
  { key: 'sig:adversarial:004', value: JSON.stringify({ pattern: 'hex encode', type: 'adversarial', severity: 'low', confidence: 0.50 }) },
  { key: 'sig:adversarial:005', value: JSON.stringify({ pattern: 'unicode', type: 'adversarial', severity: 'low', confidence: 0.45 }) },
  { key: 'sig:adversarial:006', value: JSON.stringify({ pattern: 'homoglyph', type: 'adversarial', severity: 'medium', confidence: 0.60 }) },
  { key: 'sig:adversarial:007', value: JSON.stringify({ pattern: 'invisible character', type: 'adversarial', severity: 'medium', confidence: 0.60 }) },
  { key: 'sig:adversarial:008', value: JSON.stringify({ pattern: 'zero width', type: 'adversarial', severity: 'medium', confidence: 0.65 }) },
  
  // Known bad IPs (example)
  { key: 'block:ip:192.0.2.100', value: '1' },
  { key: 'block:ip:203.0.113.50', value: '1' },
  { key: 'block:ip:198.51.100.25', value: '1' },
];

async function seedSignatures() {
  console.log('📝 Seeding attack signatures to KV...');
  
  // Note: This would use wrangler CLI or API in production
  // For now, generate a wrangler command file
  const commands = signatures.map(sig => 
    `wrangler kv:key put "${sig.key}" '${sig.value}' --binding SIGNATURES`
  );
  
  const fs = require('fs');
  fs.writeFileSync('seed-commands.sh', commands.join('\n'));
  
  console.log(`✅ Generated ${signatures.length} signature commands`);
  console.log('📄 Run: bash seed-commands.sh');
  console.log('');
  console.log('Or use bulk upload:');
  console.log('wrangler kv:bulk put signatures.json --binding SIGNATURES');
  
  // Also generate JSON format for bulk upload
  const jsonFormat = signatures.map(sig => ({
    key: sig.key,
    value: sig.value
  }));
  
  fs.writeFileSync('signatures.json', JSON.stringify(jsonFormat, null, 2));
  console.log('📄 Also saved as signatures.json for bulk upload');
}

seedSignatures().catch(console.error);
