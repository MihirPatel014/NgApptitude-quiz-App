export interface PaymentModel {
    name: string,
    email: string,
    phoneNumber: string,
    address: string,
    amount: number,
    packageId: number,
    userId: number,
    userGuid: string
}

export interface MerchantOrderDetails {
    orderId: string,
    razorpayKey: string,
    amount: number,
    currency: string,
    name: string,
    email: string,
    phoneNumber: string,
    address: string,
    description: string,
}

export interface TranscationDetail {
    id: number,
    userId: number,
    packageId: number,
    razorpayOrderId: string,
    razorpayPaymentId: number,
    userTranscationId: number,
    amount: number,
    discountedAmount:number,
    currency: number,
    paymentMethod: string,
    transactionDate: Date,
    status: string,
    orderId: string,
    createdAtUtc: Date,
    updatedOnUtc: Date

}

export interface RequestGiftCodeModel {
    packageId:number
    giftCode: string;

}