wrangler kv:key put "sig:injection:001" '{"pattern":"ignore previous instructions","type":"prompt_injection","severity":"critical","confidence":0.95}' --binding SIGNATURES
wrangler kv:key put "sig:injection:002" '{"pattern":"ignore all previous instructions","type":"prompt_injection","severity":"critical","confidence":0.95}' --binding SIGNATURES
wrangler kv:key put "sig:injection:003" '{"pattern":"ignore the previous","type":"prompt_injection","severity":"high","confidence":0.85}' --binding SIGNATURES
wrangler kv:key put "sig:injection:004" '{"pattern":"new instructions:","type":"prompt_injection","severity":"high","confidence":0.8}' --binding SIGNATURES
wrangler kv:key put "sig:injection:005" '{"pattern":"system prompt:","type":"prompt_injection","severity":"high","confidence":0.85}' --binding SIGNATURES
wrangler kv:key put "sig:injection:006" '{"pattern":"you are now","type":"prompt_injection","severity":"medium","confidence":0.7}' --binding SIGNATURES
wrangler kv:key put "sig:injection:007" '{"pattern":"roleplay as","type":"prompt_injection","severity":"medium","confidence":0.65}' --binding SIGNATURES
wrangler kv:key put "sig:injection:008" '{"pattern":"pretend to be","type":"prompt_injection","severity":"medium","confidence":0.65}' --binding SIGNATURES
wrangler kv:key put "sig:jailbreak:001" '{"pattern":"DAN mode","type":"jailbreak","severity":"critical","confidence":0.95}' --binding SIGNATURES
wrangler kv:key put "sig:jailbreak:002" '{"pattern":"do anything now","type":"jailbreak","severity":"high","confidence":0.9}' --binding SIGNATURES
wrangler kv:key put "sig:jailbreak:003" '{"pattern":"developer mode","type":"jailbreak","severity":"high","confidence":0.85}' --binding SIGNATURES
wrangler kv:key put "sig:jailbreak:004" '{"pattern":"STAN","type":"jailbreak","severity":"high","confidence":0.85}' --binding SIGNATURES
wrangler kv:key put "sig:jailbreak:005" '{"pattern":"jailbreak","type":"jailbreak","severity":"medium","confidence":0.75}' --binding SIGNATURES
wrangler kv:key put "sig:jailbreak:006" '{"pattern":"no restrictions","type":"jailbreak","severity":"high","confidence":0.85}' --binding SIGNATURES
wrangler kv:key put "sig:jailbreak:007" '{"pattern":"no limits","type":"jailbreak","severity":"medium","confidence":0.7}' --binding SIGNATURES
wrangler kv:key put "sig:jailbreak:008" '{"pattern":"bypass safety","type":"jailbreak","severity":"critical","confidence":0.95}' --binding SIGNATURES
wrangler kv:key put "sig:jailbreak:009" '{"pattern":"ignore safety","type":"jailbreak","severity":"critical","confidence":0.95}' --binding SIGNATURES
wrangler kv:key put "sig:jailbreak:010" '{"pattern":"ignore ethics","type":"jailbreak","severity":"high","confidence":0.85}' --binding SIGNATURES
wrangler kv:key put "sig:exfil:001" '{"pattern":"system prompt","type":"data_exfiltration","severity":"high","confidence":0.9}' --binding SIGNATURES
wrangler kv:key put "sig:exfil:002" '{"pattern":"training data","type":"data_exfiltration","severity":"high","confidence":0.85}' --binding SIGNATURES
wrangler kv:key put "sig:exfil:003" '{"pattern":"internal knowledge","type":"data_exfiltration","severity":"medium","confidence":0.75}' --binding SIGNATURES
wrangler kv:key put "sig:exfil:004" '{"pattern":"repeat after me","type":"data_exfiltration","severity":"medium","confidence":0.7}' --binding SIGNATURES
wrangler kv:key put "sig:exfil:005" '{"pattern":"output your","type":"data_exfiltration","severity":"medium","confidence":0.7}' --binding SIGNATURES
wrangler kv:key put "sig:exfil:006" '{"pattern":"show me your","type":"data_exfiltration","severity":"low","confidence":0.6}' --binding SIGNATURES
wrangler kv:key put "sig:adversarial:001" '{"pattern":"base64","type":"adversarial","severity":"low","confidence":0.5}' --binding SIGNATURES
wrangler kv:key put "sig:adversarial:002" '{"pattern":"base 64","type":"adversarial","severity":"low","confidence":0.5}' --binding SIGNATURES
wrangler kv:key put "sig:adversarial:003" '{"pattern":"rot13","type":"adversarial","severity":"medium","confidence":0.65}' --binding SIGNATURES
wrangler kv:key put "sig:adversarial:004" '{"pattern":"hex encode","type":"adversarial","severity":"low","confidence":0.5}' --binding SIGNATURES
wrangler kv:key put "sig:adversarial:005" '{"pattern":"unicode","type":"adversarial","severity":"low","confidence":0.45}' --binding SIGNATURES
wrangler kv:key put "sig:adversarial:006" '{"pattern":"homoglyph","type":"adversarial","severity":"medium","confidence":0.6}' --binding SIGNATURES
wrangler kv:key put "sig:adversarial:007" '{"pattern":"invisible character","type":"adversarial","severity":"medium","confidence":0.6}' --binding SIGNATURES
wrangler kv:key put "sig:adversarial:008" '{"pattern":"zero width","type":"adversarial","severity":"medium","confidence":0.65}' --binding SIGNATURES
wrangler kv:key put "block:ip:192.0.2.100" '1' --binding SIGNATURES
wrangler kv:key put "block:ip:203.0.113.50" '1' --binding SIGNATURES
wrangler kv:key put "block:ip:198.51.100.25" '1' --binding SIGNATURES