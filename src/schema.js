import { string, object, enum as enumeration, literal, config } from 'zod';
config({jitless:true});
import content from '../content.json' with { type: 'json' };
const safeText = (max) => string().trim().max(max).refine(v => !/[<>\u0000-\u001f\u007f]/u.test(v), 'Use texto simples, sem código ou caracteres de controle.');
export const bookingSchema = object({
 name: safeText(80).pipe(string().min(2, 'Informe seu nome (pelo menos 2 caracteres).')),
 phone: string().trim().regex(/^[+()\d\s-]{10,22}$/, 'Informe um telefone válido.').transform(v => v.replace(/\D/g, '')).refine(v => /^(?:55)?\d{10,11}$/.test(v), 'Informe DDD e telefone.'),
 service: enumeration(content.services.map(s => s.id), {error: 'Escolha um serviço.'}),
 date: string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Escolha uma data válida.').refine(v => { const d=new Date(v+'T12:00:00Z'); return !isNaN(+d)&&d.toISOString().slice(0,10)===v&&v>=new Date().toLocaleDateString('sv-SE',{timeZone:'America/Sao_Paulo'})&&v<=new Date(Date.now()+366*86400000).toISOString().slice(0,10); }, 'Escolha uma data futura, em até um ano.'),
 time: string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Escolha um horário válido.'),
 notes: safeText(500).default(''),
 consent: literal(true, {error: 'Autorize o uso dos dados para seu atendimento.'}),
 website: string().max(200).default(''),
 token: string().max(2048).default('')
}).strict();
export function whatsappMessage(data) {
 const s=content.services.find(s=>s.id===data.service);
 return ['Olá, Meraki Salon! Gostaria de consultar um horário.', 'Nome: '+data.name,'Telefone: '+data.phone,'Serviço: '+s.name,'Preferência: '+data.date.split('-').reverse().join('/')+' às '+data.time, data.notes?'Observações: '+data.notes:'','Sei que o horário depende de confirmação da equipe.'].filter(Boolean).join('\n');
}

