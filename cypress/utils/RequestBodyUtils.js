export const setClientSecret=(requestBody,clientSecret)=>{
    requestBody["client_secret"] = clientSecret;
}
export const setCardNo=(requestBody,cardNo)=>{
    // pass confirm body here to set CardNo
    requestBody["payment_method_data"]["card"]["card_number"]=cardNo
}


