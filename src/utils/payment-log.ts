export interface PaymentRecord { timestamp: string; agent: string; endpoint: string; amountUsd: string; txSignature: string|null; network: string; status: 'settled'|'failed'|'pending'; }
class PaymentLog {
 private records: PaymentRecord[] = [];private totalSettledUsd = 0;
 record(entry: Omit<PaymentRecord,'timestamp'>) {
 const r = { ...entry, timestamp: new Date().toISOString() };
 this.records.push(r);
 if (entry.status === 'settled') this.totalSettledUsd += parseFloat(entry.amountUsd.replace('$',''));
 if (this.records.length > 10000) this.records = this.records.slice(-5000);
 }
 getStats() {
 const now = Date.now();
 const day = this.records.filter(r => r.status==='settled' && Date.now()-new Date(r.timestamp).getTime()<86400000);
 const week = this.records.filter(r => r.status==='settled' && Date.now()-new Date(r.timestamp).getTime()<604800000);
 const sum = (rs: PaymentRecord[]) => rs.reduce((s,r) => s+parseFloat(r.amountUsd.replace('$','')),0);
 return { totalSettledUsd: this.totalSettledUsd, last24h: { count: day.length, usd: sum(day) }, last7d: { count: week.length, usd: sum(week) }, totalRecords: this.records.length };
 }
 getRecent(n=50) { return this.records.slice(-n).reverse(); }
 toJournalEntry() { const s=this.getStats(); return `## x402 Revenue ${new Date().toISOString().split('T')[0]}\nTotal: $${s.totalSettledUsd.toFixed(4)}\n24h: ${s.last24h.count} payments`; }
}
export const paymentLog = new PaymentLog();
