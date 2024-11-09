

export interface TransactionObjModel {
    userId: string,
    eventId?: string,
    amount:number,
    transactionType: 'purchase' | 'refund',
    paymentId: string,
    status: 'pending' | 'completed',
    productName: string,
    productDesc: string,
    expiresAt: Date | null,
    createdAt?: any,
    updatedAt?:any
}
