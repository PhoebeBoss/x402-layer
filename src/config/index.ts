export type NetworkMode = 'devnet' | 'mainnet';
export interface X402Config { network: NetworkMode; solanaRpcUrl: string; facilitatorUrl: string; phoebeTreasuryAddress: string; phantomTreasuryWallet: string; usdcMint: string; port: number; host: string; }
const USDC_MINTS: Record<string, string> = { devnet: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', mainnet: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' };
const RPC_DEFAULTS: Record<string, string> = { devnet: 'https://api.devnet.solana.com', mainnet: 'https://rpc.solanatracker.io/public' };
function optEnv(key: string, fb: string): string { return process.env[key] || fb; }
export function loadConfig(): X402Config {
 const network = optEnv('X402_NETWORK', 'devnet') as NetworkMode;
 return { network, solanaRpcUrl: optEnv('SOLANA_RPC_URL', RPC_DEFAULTS[network]), facilitatorUrl: optEnv('X402_FACILITATOR_URL', 'https://x402.org/facilitator'), phoebeTreasuryAddress: optEnv('PHOEBE_TREASURY_ADDRESS', '6yWyamHsquiUHvuBnKkgFbS57xhnX42EAcVibnK6apEa'), phantomTreasuryWallet: optEnv('PHANTOM_TREASURY_WALLET', 'CGzf9GUK8DYd2kze7CKhEU2Hmr6kTifueYaWJ1SWekVc'), usdcMint: USDC_MINTS[network], port: parseInt(optEnv('PORT', '8402'), 10), host: optEnv('HOST', '0.0.0.0') };
}
export const SOLANA_CAIP2: Record<string, string> = { devnet: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1', mainnet: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp' };
