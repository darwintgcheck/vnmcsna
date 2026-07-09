export default class NodeWallet {
  payer: any
  publicKey: any

  constructor(payer: any) {
    this.payer = payer
    this.publicKey = payer?.publicKey ?? null
  }

  async signTransaction(transaction: any) {
    if (typeof transaction?.partialSign === 'function' && this.payer) {
      transaction.partialSign(this.payer)
    }
    return transaction
  }

  async signAllTransactions(transactions: any[]) {
    return Promise.all(transactions.map((transaction) => this.signTransaction(transaction)))
  }
}
