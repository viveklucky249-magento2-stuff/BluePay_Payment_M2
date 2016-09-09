/**
 * Copyright © 2016 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */
/*browser:true*/
/*global define*/
define(
    [
        'underscore',
        'Magento_Checkout/js/view/payment/default',
        //'Magento_Payment/js/model/credit-card-validation/credit-card-data',
        //'Magento_Payment/js/model/credit-card-validation/credit-card-number-validator',
        'mage/translate',
        'jquery',
        'jquery/ui',
    ],
    function (_, Component, $t, $) {
        return Component.extend({
            defaults: {
                creditCardType: '',
                creditCardExpYear: '',
                creditCardExpMonth: '',
                creditCardNumber: '',
                creditCardSsStartMonth: '',
                creditCardSsStartYear: '',
                creditCardVerificationNumber: '',
                selectedCardType: null,
                echeckAccountType: '',
                echeckRoutingNumber: '',
                echeckAccountNumber: '',
                paymentType: '',
                storedPaymentAccounts: '',
                result : '',
                message : '',
                cardType : '',
                authCode : '',
                avs : '',
                cvv2 : '',
                token: '',
                saveInfo: '0'
            },

            initObservable: function () {
                this._super()
                    .observe([
                        'creditCardType',
                        'creditCardExpYear',
                        'creditCardExpMonth',
                        'creditCardNumber',
                        'creditCardVerificationNumber',
                        'creditCardSsStartMonth',
                        'creditCardSsStartYear',
                        'selectedCardType',
                        'echeckAccountType',
                        'echeckRoutingNumber',
                        'echeckAccountNumber',
                        'paymentType',
                        'storedPaymentAccounts',
                        'token',
                        'saveInfo'
                    ]);
                return this;
            },

            initialize: function () {
                var self = this;
                this._super();
                this.result = '';
                this.message = '';
                this.cardType = '';
                this.authCode = '';
                this.avs = '';
                this.cvv2 = '';
                this.creditCardNumber = '';
                this.expirationMonth = '';
                this.expirationYear = '';
                this.echeckAccountType = '';
                this.echeckRoutingNumber = '';
                this.echeckAccountNumber = '';
                window.addEventListener("message", receiveMessage, false);
            function receiveMessage(event)
            {
                this.cardType = '';
                this.authCode = '';
                this.avs = event.data["AVS"];
                this.cvv2 = '';
                this.token = '';
                var response = event.data;
                if (typeof(response) === 'string') {
                    this.result = "ERROR";
                    this.message = event.data;
                } else {
                    this.result = event.data["Result"];
                    this.message = event.data["MESSAGE"];
                    this.cardType = event.data["CARD_TYPE"];
                    this.authCode = event.data["AUTH_CODE"];
                    this.avs = event.data["AVS"];
                    this.cvv2 = event.data["CVV2"];
                    this.token = event.data["RRNO"];

                    if (event.data["PAYMENT_TYPE"] == "CREDIT") {
                        this.creditCardNumber = event.data["PAYMENT_ACCOUNT"];
                        this.expirationMonth = event.data["CARD_EXPIRE"].substring(0, 2);
                        this.expirationYear = event.data["CARD_EXPIRE"].substring(2, 4);                       
                    } else if (event.data["PAYMENT_TYPE"] == "ACH") {
                        this.echeckAccountType = event.data["ACH_ACCOUNT_TYPE"];
                        this.echeckRoutingNumber = event.data["ACH_ROUTING"];
                    }
                }
                self.placeOrder();
                jQuery('#submitBtn').attr('disabled',false);
            }

                function initIframe() {
                    var iframeFields = "&AMOUNT=" + window.checkoutConfig.payment.bluepay_payment.quoteData['base_grand_total'] +
                    "&PAYMENT_TYPE=" + jQuery("#bluepay_payment_payment_type").value +
                    "&TRANSACTION_TYPE=" + window.checkoutConfig.payment.bluepay_payment.transType +
                    "&NAME1=" + window.checkoutConfig.payment.bluepay_payment.quoteData['customer_firstname'] +
                    "&NAME2=" + window.checkoutConfig.payment.bluepay_payment.quoteData['customer_lastname'] +
                    "&COMPANY_NAME=" + window.checkoutConfig.payment.bluepay_payment.customerCompany +
                    "&EMAIL=" + window.checkoutConfig.payment.bluepay_payment.quoteData['customer_email'] +
                    "&ADDR1=" + window.checkoutConfig.payment.bluepay_payment.customerStreet +
                    "&CITY=" + window.checkoutConfig.payment.bluepay_payment.customerCity +
                    "&STATE=" + window.checkoutConfig.payment.bluepay_payment.customerRegion +
                    "&ZIPCODE=" + window.checkoutConfig.payment.bluepay_payment.customerZip +
                    "&MERCHANT=" + window.checkoutConfig.payment.bluepay_payment.accountId + 
                    "&TAMPER_PROOF_SEAL=" + window.checkoutConfig.payment.bluepay_payment.tps +
                    "&TPS_DEF=" + window.checkoutConfig.payment.bluepay_payment.tpsDef;
                $("#iframe").attr('src', window.checkoutConfig.payment.bluepay_payment.iframeUrl + iframeFields);
                $("#iframe").height(230);
                $("#iframe").width(600);
                }

                //this.paymentType = window.checkoutConfig.payment.bluepay_payment.paymentTypes;
                //this.paymentType = 'CC';



                this.paymentType.subscribe(function (value) {
                    initIframe();
                });

                this.storedPaymentAccounts.subscribe(function (value) {
                    if (value === undefined) {
                        this.token = '';
                        this.creditCardExpMonth = '';
                        this.creditCardExpYear = '';
                        jQuery("#bluepay_payment_payment_type").attr('disabled', false);
                        jQuery("#bluepay_payment_stored_acct_cb").attr('disabled', false);
                        iframePaymentFields = '';
                        initIframe();
                        return;
                    }
                    jQuery("#bluepay_payment_payment_type").attr('disabled', true);
                    jQuery("#bluepay_payment_stored_acct_cb").attr('disabled', true);
                    window.checkoutConfig.payment.bluepay_payment.storedAccounts.forEach(function (acct) {
                        if (acct.value == value) {
                            this.token = value;
                            if (!acct.label.split('-')[1].match("eCheck")) {
                                jQuery("#bluepay_payment_payment_type").val('CC');
                                iframePaymentFields = "&PAYMENT_TYPE=CREDIT" + 
                                    "&CC_NUM=" + acct.label.substring(0, acct.label.indexOf('-')) +
                                    "&CARD_EXPIRE=" + acct.label.split('[')[1].split('/')[0] + acct.label.split('[')[1].split('/')[1].split([']'])[0] +
                                    "&ACH_ACCOUNT_TYPE=C" +
                                    "&ACH_ACCOUNT="
                                    "&ACH_ROUTING=";
                                /*document.getElementById("bluepay_payment_cc_number").value = acct.label.substring(0, acct.label.indexOf('-'));
                                document.getElementById("bluepay_payment_expiration").value = acct.label.split('[')[1].split('/')[0];
                                document.getElementById("bluepay_payment_expiration_yr").value = acct.label.split('[')[1].split('/')[1].split([']'])[0];
                                document.getElementById("bluepay_payment_echeck_acct_type").value = 'C';
                                document.getElementById("bluepay_payment_echeck_acct_number").value = '';
                                document.getElementById("bluepay_payment_echeck_routing_number").value = '';*/
                                this.creditCardNumber = acct.label.substring(0, acct.label.indexOf('-'));
                                this.expirationMonth = acct.label.split('[')[1].split('/')[0];
                                this.expirationYear = acct.label.split('[')[1].split('/')[1].split([']'])[0];
                            } else {
                                iframePaymentFields = "&PAYMENT_TYPE=ACH" +
                                    "&CC_NUM=" +
                                    "&CC_EXPIRE=" +
                                    "&ACH_ACCOUNT_TYPE=" + acct.label.split(':')[0] +
                                    "&ACH_ACCOUNT=" + acct.label.split('-')[0].split(':')[2] +
                                    "&ACH_ROUTING=" + acct.label.split(':')[1];
                                /*document.getElementById("bluepay_payment_payment_type").value = 'ACH';
                                document.getElementById("bluepay_payment_echeck_acct_type").value = acct.label.split(':')[0]
                                document.getElementById("bluepay_payment_echeck_acct_number").value = acct.label.split('-')[0].split(':')[2];
                                document.getElementById("bluepay_payment_echeck_routing_number").value = acct.label.split(':')[1];
                                document.getElementById("bluepay_payment_cc_number").value = '';
                                document.getElementById("bluepay_payment_expiration").selectedIndex = 0;
                                document.getElementById("bluepay_payment_expiration_yr").selectedIndex = 0;*/
                                this.creditCardNumber = '';
                                this.expirationMonth = '';
                                this.expirationYear = '';
                            }
                        }
                        iframeFields = "&AMOUNT=" + window.checkoutConfig.payment.bluepay_payment.quoteData['base_grand_total'] +
                            "&TRANSACTION_TYPE=" + window.checkoutConfig.payment.bluepay_payment.transType +
                            "&RRNO=" + this.token +
                            "&NAME1=" + window.checkoutConfig.payment.bluepay_payment.quoteData['customer_firstname'] +
                            "&NAME2=" + window.checkoutConfig.payment.bluepay_payment.quoteData['customer_lastname'] +
                            "&COMPANY_NAME=" + window.checkoutConfig.payment.bluepay_payment.customerCompany +
                            "&EMAIL=" + window.checkoutConfig.payment.bluepay_payment.quoteData['customer_email'] +
                            "&ADDR1=" + window.checkoutConfig.payment.bluepay_payment.customerStreet +
                            "&CITY=" + window.checkoutConfig.payment.bluepay_payment.customerCity +
                            "&STATE=" + window.checkoutConfig.payment.bluepay_payment.customerRegion +
                            "&ZIPCODE=" + window.checkoutConfig.payment.bluepay_payment.customerZip +
                            "&MERCHANT=" + window.checkoutConfig.payment.bluepay_payment.accountId + 
                            "&TAMPER_PROOF_SEAL=" + window.checkoutConfig.payment.bluepay_payment.tps +
                            "&USE_CVV2=" + window.checkoutConfig.payment.bluepay_payment.useCvv2 +
                            "&TPS_DEF=" + window.checkoutConfig.payment.bluepay_payment.tpsDef;
                            $("#iframe").attr('src', window.checkoutConfig.payment.bluepay_payment.iframeUrl + iframeFields + iframePaymentFields);
                    });
                });

                this.saveInfo.subscribe(function (value) {
                    this.saveInfo = value;
                });

            },

            getCode: function () {
                return 'bluepay_payment';
            },
            getData: function () {
                saveInfo = jQuery("#bluepay_payment_stored_acct_cb").value;
                return {
                    'method': this.item.method,
                    'additional_data': {
                        'cc_cid': this.creditCardVerificationNumber(),
                        'cc_ss_start_month': this.creditCardSsStartMonth(),
                        'cc_ss_start_year': this.creditCardSsStartYear(),
                        'cc_type': this.creditCardType,
                        'cc_exp_month': this.expirationMonth,
                        'cc_exp_year': this.expirationYear,
                        'cc_number': this.creditCardNumber,
                        'payment_type': this.getPaymentType(),
                        'iframe': 1,
                        'echeck_acct_type' : this.echeckAccountType,
                        'echeck_acct_number' : this.echeckAccountNumber,
                        'echeck_routing_number' : this.echeckRoutingNumber,
                        'result' : result,
                        'message' : message,
                        'card_type' : cardType,
                        'auth_code' : authCode,
                        'avs' : avs,
                        'cvv2' : cvv2,
                        'token': token,
                        'save_payment_info': saveInfo
                    }
                };
            },
            getCcAvailableTypes: function () {
                //return window.checkoutConfig.payment.ccform.availableTypes[this.getCode()];
                return window.checkoutConfig.payment.bluepay_payment.availableTypes;
            },
            getIcons: function (type) {
                return window.checkoutConfig.payment.ccform.icons.hasOwnProperty(type)
                    ? window.checkoutConfig.payment.ccform.icons[type]
                    : false
            },
            getCcMonths: function () {
                //return window.checkoutConfig.payment.ccform.months[this.getCode()];
                return window.checkoutConfig.payment.bluepay_payment.months;
            },
            getCcYears: function () {
                //return window.checkoutConfig.payment.ccform.years[this.getCode()];
                return window.checkoutConfig.payment.bluepay_payment.years;
            },
            hasVerification: function () {
                //return window.checkoutConfig.payment.ccform.hasVerification[this.getCode()];
                return window.checkoutConfig.payment.bluepay_payment.hasVerification;
            },
            hasSsCardType: function () {
                //return window.checkoutConfig.payment.ccform.hasSsCardType[this.getCode()];
                return window.checkoutConfig.payment.bluepay_payment.hasSsCardType;
            },
            getCvvImageUrl: function () {
                //return window.checkoutConfig.payment.ccform.cvvImageUrl[this.getCode()];
                return window.checkoutConfig.payment.bluepay_payment.cvvImageUrl;
            },
            getCvvImageHtml: function () {
                return '<img src="' + this.getCvvImageUrl()
                    + '" alt="' + $t('Card Verification Number Visual Reference')
                    + '" title="' + $t('Card Verification Number Visual Reference')
                    + '" />';
            },
            getSsStartYears: function () {
                //return window.checkoutConfig.payment.ccform.ssStartYears[this.getCode()];
                return window.checkoutConfig.payment.bluepay_payment.ssStartYears;
            },
            getCcAvailableTypesValues: function () {
                return _.map(this.getCcAvailableTypes(), function (value, key) {
                    return {
                        'value': key,
                        'type': value
                    }
                });
            },
            getCcMonthsValues: function () {
                return _.map(this.getCcMonths(), function (value, key) {
                    if (key < 10) {
                        key = '0' + key;
                    }
                    return {
                        'value': key,
                        'month': value
                    }
                });
            },
            getCcYearsValues: function () {
                return _.map(this.getCcYears(), function (value, key) {
                    return {
                        'value': key.substring(2,4),
                        'year': value
                    }
                });
            },
            getSsStartYearsValues: function () {
                return _.map(this.getSsStartYears(), function (value, key) {
                    return {
                        'value': key,
                        'year': value
                    }
                });
            },
            isShowLegend: function () {
                return false;
            },
            getCcTypeTitleByCode: function (code) {
                var title = '';
                _.each(this.getCcAvailableTypesValues(), function (value) {
                    if (value['value'] == code) {
                        title = value['type'];
                    }
                });
                return title;
            },
            formatDisplayCcNumber: function (number) {
                return 'xxxx-' + number.substr(-4);
            },
            getInfo: function () {
                return [
                    {'name': 'Credit Card Type', value: this.getCcTypeTitleByCode(this.creditCardType())},
                    {'name': 'Credit Card Number', value: this.formatDisplayCcNumber(this.creditCardNumber())}
                ];
            },
            getPaymentTypes: function () {
                return window.checkoutConfig.payment.bluepay_payment.paymentTypes;
            },
            getStoredAccounts: function () {
                return window.checkoutConfig.payment.bluepay_payment.storedAccounts;
            },
            getStoredAccountsValue: function () {
                return _.map(this.getStoredAccounts(), function (value, key) {
                    return {
                        'value': value.value,
                        'label': value.label
                    }
                });
            },
            getPaymentType: function () {
                if (jQuery("#bluepay_payment_payment_type")) {
                    return jQuery("#bluepay_payment_payment_type").val(); }
                else
                    return 'CC';
            },
            initPaymentFields: function () {
                if (!window.checkoutConfig.payment.bluepay_payment.isCustomerLoggedIn ||
                    window.checkoutConfig.payment.bluepay_payment.allowAccountsStorage == '0') {
                    jQuery("#bluepay_payment_stored_acct_div").hide();
                    jQuery("#bluepay_payment_stored_acct_cb_div").hide();
                }
                if (window.checkoutConfig.payment.bluepay_payment.paymentTypes == 'CC') {
                    jQuery("#bluepay_payment_payment_type").val('CC');
                    jQuery("#bluepay_payment_payment_type_div").hide();
                } else if (window.checkoutConfig.payment.bluepay_payment.paymentTypes == 'ACH') {
                    jQuery("#bluepay_payment_payment_type").val('ACH');
                    jQuery("#bluepay_payment_payment_type_div").hide();
                }
                jQuery("#bluepay_payment_stored_acct_cb").val('1');
                //showHidePaymentFields();
            },
            initIframe: function () {
                iframeFields = "&AMOUNT=" + window.checkoutConfig.payment.bluepay_payment.quoteData['base_grand_total'] +
                    "&TRANSACTION_TYPE=" + window.checkoutConfig.payment.bluepay_payment.transType +
                    "&NAME1=" + window.checkoutConfig.payment.bluepay_payment.quoteData['customer_firstname'] +
                    "&NAME2=" + window.checkoutConfig.payment.bluepay_payment.quoteData['customer_lastname'] +
                    "&COMPANY_NAME=" + window.checkoutConfig.payment.bluepay_payment.customerCompany +
                    "&EMAIL=" + window.checkoutConfig.payment.bluepay_payment.quoteData['customer_email'] +
                    "&ADDR1=" + window.checkoutConfig.payment.bluepay_payment.customerStreet +
                    "&CITY=" + window.checkoutConfig.payment.bluepay_payment.customerCity +
                    "&STATE=" + window.checkoutConfig.payment.bluepay_payment.customerRegion +
                    "&ZIPCODE=" + window.checkoutConfig.payment.bluepay_payment.customerZip +
                    "&MERCHANT=" + window.checkoutConfig.payment.bluepay_payment.accountId + 
                    "&TAMPER_PROOF_SEAL=" + window.checkoutConfig.payment.bluepay_payment.tps +
                    "&TPS_DEF=" + window.checkoutConfig.payment.bluepay_payment.tpsDef;
                    $("#iframe").attr('src', window.checkoutConfig.payment.bluepay_payment.iframeUrl + iframeFields + iframePaymentFields);
                    $("#iframe").height(230);
                    $("#iframe").width(600);
            },
            getResult: function() {
                return this.result;
            }
        });
    }
);

function showHidePaymentFields()
{
    if (jQuery("#bluepay_payment_payment_type").val() == 'ACH') {
        jQuery("#bluepay_payment_cc_types_div").hide();
        jQuery("#bluepay_payment_cc_number_div").hide();
        jQuery("#bluepay_payment_cc_type_exp_div").hide();
        jQuery("#bluepay_payment_cc_type_cvv_div").hide();
        jQuery("#bluepay_payment_echeck_acct_type_div").show();
        jQuery("#bluepay_payment_echeck_acct_number_div").show();
        jQuery("#bluepay_payment_echeck_routing_number_div").show();
    } else {
        jQuery("#bluepay_payment_echeck_acct_type_div").hide();
        jQuery("#bluepay_payment_echeck_acct_number_div").hide();
        jQuery("#bluepay_payment_echeck_routing_number_div").hide();
        jQuery("#bluepay_payment_cc_types_div").show();
        jQuery("#bluepay_payment_cc_number_div").show();
        jQuery("#bluepay_payment_cc_type_exp_div").show();
        jQuery("#bluepay_payment_cc_type_cvv_div").show();
    }
}

function test()
{
    jQuery('#submitBtn').attr('disabled',true);
    var win = document.getElementById("iframe").contentWindow;
    win.postMessage("Submit", "*");
    //if (false)
    return false;
}
