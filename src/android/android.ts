import * as RequestPromise from 'request-promise-native';
import * as Request from 'request';

export declare interface IAPTokenMap {
    clientId: string,
    clientSecret: string,
    refreshToken: string,
    accessToken?: string,
    sandboxPkey: string,
    livePkey: string
}

export declare interface GoogleAPIAuthRequest {
    grant_type: string,
    client_id: string,
    client_secret: string,
    refresh_token: string
}

export declare interface GoogleAPIAuthResponse {
    access_token: string,
    token_type: string,
    expires_in: number,
    refresh_token: string
}

/**
 *
 * See table 7 of 'INAPP_PURCHASE_DATA'
 * @link https://developer.android.com/google/play/billing/billing_reference.html
 */
export declare interface GoogleNativeValuePurchase {
    packageName: string;
    productId: string;
    purchaseToken: string;
}

/** 
 * A ProductPurchase resource indicates the status of a user's in-app product purchase.
 * 
 * @link https://developers.google.com/android-publisher/api-ref/purchases/products#resource
*/
export declare interface GoogleAPIProductPurchaseResponse {
    kind: string,
    purchaseTimeMillis: number,
    purchaseState: GoogleAPIProductPurchaseState,
    consumptionState: GoogleAPIProductConsumptionState,
    developerPayload: string,
    orderId: string,
    purchaseType: GoogleAPIProductPurchaseType
}


/** 
 * The consumption state of the in-app product. Possible values are:
 *  0 --> Yet to be consumed
 *  1 -->Consumed
 *
 * See 'consumptionState' at
 * @link https://developers.google.com/android-publisher/api-ref/purchases/products#resource
*/
export declare type GoogleAPIProductConsumptionState = 0 | 1;


/** 
 * The purchase state of the order. Possible values are:
 * 0 --> Purchased
 * 1 --> Canceled
 * 
 * See 'purchaseState' at
 * @link https://developers.google.com/android-publisher/api-ref/purchases/products#resource
*/
export declare type GoogleAPIProductPurchaseState = 0 | 1;

/**
 * The type of purchase of the in-app product. This field is only set if this purchase was not made using the standard in-app billing flow. Possible values are:
 * 0 --> Test (i.e. purchased from a license testing account)
 * 1 --> Promo (i.e. purchased using a promo code)
 * 
 * See 'purchaseType' at
 *  @link https://developers.google.com/android-publisher/api-ref/purchases/products#resource
*/
export declare type GoogleAPIProductPurchaseType = 0 | 1;

export declare interface GoogleAPISubscriptionPurchaseResponse {
    kind: string,
    startTimeMillis: number,
    expiryTimeMillis: number,
    autoRenewing: boolean,
    priceCurrencyCode: string,
    priceAmountMicros: number,
    countryCode: string,
    developerPayload: string,
    paymentState: GoogleAPISubscriptionPaymentState,
    cancelReason: GoogleAPISubscriptionCancellationReason,
    userCancellationTimeMillis: number,
    orderId: string,
    linkedPurchaseToken: string,
    purchaseType: GoogleAPISubscriptionPurchaseType
}

/** 
 * The reason why a subscription was canceled or is not auto-renewing. Possible values are:
 * 0 --> user cancelled the subscription. The subscription remains valid until its expiration time;
 * 1 --> subscription was cancelled by the system, for example because of a billing problem;
 * 2 --> subscription was replaced with a new subscription;
 * 3 --> subscription was cancelled by the developer.
 * 
 * See 'cancelReason' at 
 * @link https://developers.google.com/android-publisher/api-ref/purchases/subscriptions
*/
export declare type GoogleAPISubscriptionCancellationReason = 0 | 1 | 2 | 3;

/**
 * The payment state of the subscription. Possible values are:
 * 0 --> Payment pending;
 * 1 --> Payment received;
 * 2 --> Free trial.
 * 
 * See 'paymentState' at 
 * @link https://developers.google.com/android-publisher/api-ref/purchases/subscriptions
 */
export declare type GoogleAPISubscriptionPaymentState = 0 | 1 | 2;

/**
 * The type of purchase of the subscription. This field is only set if this purchase was not made using the standard in-app billing flow. Possible values are:
 * 0 --> Test (i.e. purchased from a license testing account);
 * 1 --> Promo (i.e. purchased using a promo code);
 * 
 *  See 'purchaseType' at 
 * @link https://developers.google.com/android-publisher/api-ref/purchases/subscriptions
 */
export declare type GoogleAPISubscriptionPurchaseType = 0 | 1;




export class AndroidIAP {
    public validateProduct(tokenMap: IAPTokenMap, receipt: GoogleNativeValuePurchase, isSandbox?: boolean): Promise<GoogleAPIProductPurchaseResponse> {
        return this.authGoogleAPI(tokenMap)
            .then((googleAuth) => {
                let options: Request.CoreOptions = {
                    json: true
                };
                let authToken = '?access_token=' + googleAuth.access_token;
                let url = 'https://www.googleapis.com/androidpublisher/v2/applications/' + receipt.packageName + '/purchases/products/'
                    + receipt.productId + '/tokens/' + receipt.purchaseToken + authToken;
                return RequestPromise.get(url, options).then((res: GoogleAPIProductPurchaseResponse) => { return res });
            });
    }

    public validateSubscription(tokenMap: IAPTokenMap, receipt: GoogleNativeValuePurchase, isSandbox?: boolean): Promise<GoogleAPISubscriptionPurchaseResponse> {
        return this.authGoogleAPI(tokenMap)
            .then((googleAuth) => {
                let options: Request.CoreOptions = {
                    json: true
                };

                let authToken = '?access_token=' + googleAuth.access_token;

                let url = 'https://www.googleapis.com/androidpublisher/v2/applications/' + receipt.packageName + '/purchases/subscriptions/'
                    + receipt.productId + '/tokens/' + receipt.purchaseToken + authToken;
                return RequestPromise.get(url, options).then((res: GoogleAPISubscriptionPurchaseResponse) => { return res });
            });
    }

    private authGoogleAPI(tokenMap: IAPTokenMap): Promise<GoogleAPIAuthResponse> {
        let form: GoogleAPIAuthRequest = {
            grant_type: 'refresh_token',
            client_id: tokenMap.clientId,
            client_secret: tokenMap.clientSecret,
            refresh_token: tokenMap.refreshToken
        }
        let options: Request.CoreOptions = {
            form: form,
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            }
        };

        return RequestPromise.post('https://accounts.google.com/o/oauth2/token', options).then((res) => {
            return <GoogleAPIAuthResponse>JSON.parse(res);
        })
    }



}