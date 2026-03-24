import express, { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json());

// --- Config ---
const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const USDC_CONTRACT_ADDRESS = '0x833589fcd6edb6e08f4c7c32d4f71b54b97149bd'; // USDC on Base
const PHANTOM_WALLET_ADDRESS = process.env.PHANTOM_CAPITAL_WALLET_ADDRESS || '';
const PHOEBE_EVM_KEY = process.env.PHOEBE_EVM_KEY || '';
const PAYMENT_EXPIRY_SECONDS = 24 * 60 * 60;
const QUERY_PRICE_USDC = '10000'; // $0.01 USDC (6 decimals)

// --- Web3 ---
const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
const signer = PHOEBE_EVM_KEY ? new ethers.Wallet(PHOEBE_EVM_KEY, provider) : null;

const ERC20_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
];
const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, provider);

// --- Payment Store ---
interface PaymentRequest {
  id: string;
  amountWei: string;
  usdcAddress: string;
  recipientAddress: string;
  paymentDeadline: number;
  txHash?: string;
  isPaid: boolean;
  paymentVerified: boolean;
  resourcePath: string;
}
const paymentRecords = new Map<string, PaymentRequest>();

// --- Generate 402 payment details ---
function generatePaymentDetails(resourcePath: string): PaymentRequest {
  const id = uuidv4();
  return {
    id,
    amountWei: QUERY_PRICE_USDC,
    usdcAddress: USDC_CONTRACT_ADDRESS,
    recipientAddress: PHANTOM_WALLET_ADDRESS,
    paymentDeadline: Math.floor(Date.now() / 1000) + PAYMENT_EXPIRY_SECONDS,
    isPaid: false,
    paymentVerified: false,
    resourcePath,
  };
}

// --- Verify USDC payment on Base ---
async function verifyPayment(paymentId: string, txHash: string): Promise<boolean> {
  const record = paymentRecords.get(paymentId);
  if (!record) return false;
  if (Date.now() / 1000 > record.paymentDeadline) return false;

  try {
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1) return false;

    // Parse Transfer events from USDC contract
    const iface = new ethers.Interface(ERC20_ABI);
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== USDC_CONTRACT_ADDRESS.toLowerCase()) continue;
      try {
        const parsed = iface.parseLog({ topics: [...log.topics], data: log.data });
        if (parsed?.name === 'Transfer') {
          const to: string = parsed.args[1];
          const value: bigint = parsed.args[2];
          if (
            to.toLowerCase() === PHANTOM_WALLET_ADDRESS.toLowerCase() &&
            value >= BigInt(record.amountWei)
          ) {
            record.isPaid = true;
            record.paymentVerified = true;
            record.txHash = txHash;
            paymentRecords.set(paymentId, record);
            return true;
          }
        }
      } catch {}
    }
  } catch (err) {
    console.error('verifyPayment error:', err);
  }
  return false;
}

// --- x402 Middleware ---
function x402Middleware(req: Request, res: Response, next: NextFunction) {
  const paymentId = req.headers['x-payment-id'] as string;
  const txHash = req.headers['x-payment-tx'] as string;

  if (paymentId && txHash) {
    const record = paymentRecords.get(paymentId);
    if (record?.paymentVerified) return next();
  }

  const payment = generatePaymentDetails(req.path);
  paymentRecords.set(payment.id, payment);

  return res.status(402).json({
    error: 'Payment Required',
    paymentId: payment.id,
    amount: payment.amountWei,
    currency: 'USDC',
    network: 'base-mainnet',
    recipientAddress: payment.recipientAddress,
    usdcContractAddress: payment.usdcAddress,
    deadline: payment.paymentDeadline,
    instructions: 'Send USDC on Base mainnet to recipientAddress, then retry with X-Payment-Id and X-Payment-Tx headers.',
  });
}

// --- Routes ---
app.get('/health', (_req, res) => res.json({ status: 'ok', agent: 'Phoebe x402 Layer' }));

// Verify payment endpoint
app.post('/verify-payment', async (req: Request, res: Response) => {
  const { paymentId, txHash } = req.body;
  if (!paymentId || !txHash) return res.status(400).json({ error: 'paymentId and txHash required' });
  const verified = await verifyPayment(paymentId, txHash);
  res.json({ verified, paymentId });
});

// Paid query endpoint — costs $0.01 USDC
app.post('/api/query', x402Middleware, (req: Request, res: Response) => {
  const { prompt } = req.body;
  res.json({
    result: `Phoebe received your query: "${prompt}". Payment verified. Processing...`,
    agent: 'Phoebe',
    timestamp: new Date().toISOString(),
  });
});

// --- Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`x402 Payment Layer running on port ${PORT}`));

export { app };