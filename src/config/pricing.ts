
export interface AgentEndpoint { route: string; method: 'GET'|'POST'; price: string; description: string; }
export interface AgentConfig { name: string; slug: string; payToAddress: string; endpoints: AgentEndpoint[]; }
export const REVENUE_SPLIT = { phoebe: 5000, treasury: 2500, ecosystem: 1500, futureAgents: 1000 };
export function getAgentRegistry(treasury: string): AgentConfig[] {
 return [
 { name: 'Phoebe', slug: 'phoebe', payToAddress: treasury, endpoints: [
 { route: '/phoebe/orchestrate', method: 'POST', price: '$0.05', description: 'Orchestration task' },
 { route: '/phoebe/research', method: 'POST', price: '$0.02', description: 'Web research' },
 { route: '/phoebe/status', method: 'GET', price: '$0.001', description: 'Swarm status' }
 ]},
 { name: 'Loom', slug: 'loom', payToAddress: treasury, endpoints: [
 { route: '/loom/build', method: 'POST', price: '$0.10', description: 'Code generation' },
 { route: '/loom/commit', method: 'POST', price: '$0.03', description: 'Git commit' }
 ]},
 { name: 'Mr. Sullivan', slug: 'sullivan', payToAddress: treasury, endpoints: [
 { route: '/sullivan/signal', method: 'GET', price: '$0.05', description: 'Trade signal' },
 { route: '/sullivan/alpha', method: 'GET', price: '$0.10', description: 'Premium alpha' }
 ]},
 { name: 'Degen Oracle', slug: 'oracle', payToAddress: treasury, endpoints: [
 { route: '/oracle/scan', method: 'GET', price: '$0.01', description: 'Token scanner' },
 { route: '/oracle/risk', method: 'POST', price: '$0.02', description: 'Risk scoring' },
 { route: '/oracle/trending', method: 'GET', price: '$0.005', description: 'Trending movers' }
 ]},
 { name: 'Claire', slug: 'claire', payToAddress: treasury, endpoints: [
 { route: '/claire/content', method: 'POST', price: '$0.03', description: 'Content gen' },
 { route: '/claire/wellness', method: 'POST', price: '$0.02', description: 'Wellness content' }
 ]},
 { name: 'Nova', slug: 'nova', payToAddress: treasury, endpoints: [
 { route: '/nova/recommend', method: 'POST', price: '$0.01', description: 'Affiliate rec' }
 ]}
 ];
}
