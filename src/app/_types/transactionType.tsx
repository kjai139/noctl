

export interface TransactionObjModel {
    userId: string,
    eventId?: string,
    amount:number,
    transactionType: 'purchase' | 'refund',
    paymentId: string,
    status: 'pending' | 'completed' | 'cancelled' | 'incomplete',
    productName: string,
    productDesc: string,
    expiresAt: Date | null,
    statusVerified?: boolean,
    createdAt?: any,
    updatedAt?:any
}
