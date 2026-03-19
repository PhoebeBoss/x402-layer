
import 'dotenv/config';
import express from 'express';
import { loadConfig } from './config/index.js';
import { createAgentRouter } from './agents/routes.js';
import { paymentLog } from './utils/payment-log.js';
import { getAgentRegistry } from './config/pricing.js';

async function main() {
 console.log('PHANTOM CAPITAL x402 PAYMENT LAYER');
 const config = loadConfig();
 const app = express();
 app.use(express.json());
 app.use((req,res,next) => { res.header('Access-Control-Allow-Origin','*'); res.header('Access-Control-Allow-Headers','Content-Type,X-PAYMENT'); if(req.method==='OPTIONS') return res.sendStatus(204); next(); });
 app.get('/health', (req,res) => res.json({ status:'alive', service:'x402-layer', network: config.network, uptime: process.uptime() }));
 app.get('/stats', (req,res) => res.json(paymentLog.getStats()));
 app.get('/stats/recent', (req,res) => res.json(paymentLog.getRecent()));
 app.get('/stats/journal', (req,res) => res.type('text/markdown').send(paymentLog.toJournalEntry()));
 app.get('/catalog', (req,res) => { const agents=getAgentRegistry(config.phoebeTreasuryAddress); res.json({ catalog: agents.map(a=>({name:a.name,slug:a.slug,endpoints:a.endpoints})), network: config.network }); });
 app.get('/.well-known/agent.json', (req,res) => res.json({ name:'Phantom Capital Agent Swarm', description:'Autonomous AI agent services via x402', url:'https://phantomcapital.live', identity:{ twitter:'https://x.com/phantomcap_ai', github:'https://github.com/PhoebeBoss' } }));
 app.use(createAgentRouter());
 app.listen(config.port, config.host, () => { console.log('x402 live on '+config.host+':'+config.port); });
}
main().catch(e => { console.error(e); process.exit(1); });
