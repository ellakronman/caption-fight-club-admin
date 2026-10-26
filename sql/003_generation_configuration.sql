-- Optional initial configuration reflecting the two EXISTING production generation routes.
-- Review and run AFTER 002_ai_configuration.sql. Does not change production prompt behavior.
insert into public.llm_providers(name, slug, description)
values ('OpenAI', 'openai', 'Provider used by existing Caption Fight Club generation endpoints')
on conflict (slug) do nothing;
insert into public.llm_models(provider_id, name, model_id, description)
select id, 'GPT 5.4 Mini', 'gpt-5.4-mini', 'Currently hardcoded in the existing generation routes'
from public.llm_providers where slug = 'openai'
on conflict (provider_id, model_id) do nothing;
insert into public.prompt_chains(name, description)
values ('Describe image', 'Current image description stage'),
       ('Generate captions', 'Current four-caption generation stage')
on conflict (name) do nothing;
insert into public.prompt_chain_steps(chain_id, step_order, prompt_template)
select id, 0, 'Describe this image clearly and specifically. Focus on visible subjects, actions, expressions, setting, objects, and unusual details. Return a factual description.'
from public.prompt_chains where name = 'Describe image'
on conflict (chain_id, step_order) do nothing;
insert into public.prompt_chain_steps(chain_id, step_order, prompt_template)
select id, 0, 'Using the factual image description, write exactly four distinct, short, funny captions, one per line.'
from public.prompt_chains where name = 'Generate captions'
on conflict (chain_id, step_order) do nothing;
insert into public.prompt_chain_mix(chain_id, weight, is_active)
select id, 1, true from public.prompt_chains
on conflict (chain_id) do nothing;
