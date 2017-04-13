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
        'Magento_Payment/js/model/credit-card-validation/credit-card-data',
        'Magento_Payment/js/model/credit-card-validation/credit-card-number-validator',
        'mage/translate',
        'jquery',
        'jquery/ui',
    ],
    function (_, Component, creditCardData, cardNumberValidator, $t, $) {
            function showHidePaymentFields() {
                if ($("#bluepay_payment_payment_type") && $("#bluepay_payment_payment_type").val() == 'ACH') {
                    if ($("#bluepay_payment_cc_types_div")) $("#bluepay_payment_cc_types_div").hide();
                    if ($("#bluepay_payment_cc_number_div")) $("#bluepay_payment_cc_number_div").hide();
                    if ($("#bluepay_payment_cc_type_exp_div")) $("#bluepay_payment_cc_type_exp_div").hide();
                    if ($("#bluepay_payment_cc_type_cvv_div")) $("#bluepay_payment_cc_type_cvv_div").hide();
                    if ($("#bluepay_payment_echeck_acct_type_div")) $("#bluepay_payment_echeck_acct_type_div").show();
                    if ($("#bluepay_payment_echeck_acct_number_div")) $("#bluepay_payment_echeck_acct_number_div").show();
                    if ($("#bluepay_payment_echeck_routing_number_div")) $("#bluepay_payment_echeck_routing_number_div").show();
                } else {
                    if ($("#bluepay_payment_echeck_acct_type_div")) $("#bluepay_payment_echeck_acct_type_div").hide();
                    if ($("#bluepay_payment_echeck_acct_number_div")) $("#bluepay_payment_echeck_acct_number_div").hide();
                    if ($("#bluepay_payment_echeck_routing_number_div")) $("#bluepay_payment_echeck_routing_number_div").hide();
                    if ($("#bluepay_payment_cc_types_div")) $("#bluepay_payment_cc_types_div").show();
                    if ($("#bluepay_payment_cc_number_div")) $("#bluepay_payment_cc_number_div").show();
                    if ($("#bluepay_payment_cc_type_exp_div")) $("#bluepay_payment_cc_type_exp_div").show();
                    if ($("#bluepay_payment_cc_type_cvv_div")) $("#bluepay_payment_cc_type_cvv_div").show();
                }
            }
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
                paymentType: 'CC',
                storedPaymentAccounts: '',
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

                //Set credit card number to credit card data object
                this.creditCardNumber.subscribe(function (value) {
                    var result;
                    self.selectedCardType(null);

                    if (value == '' || value == null) {
                        return false;
                    }
                    result = cardNumberValidator(value);

                    if (!result.isPotentiallyValid && !result.isValid) {
                        return false;
                    }
                    if (result.card !== null) {
                        self.selectedCardType(result.card.type);
                        creditCardData.creditCard = result.card;
                    }

                    if (result.isValid) {
                        creditCardData.creditCardNumber = value;
                        self.creditCardType(result.card.type);
                    }
                });

                //Set expiration year to credit card data object
                this.creditCardExpYear.subscribe(function (value) {
                    creditCardData.expirationYear = value;
                });

                //Set expiration month to credit card data object
                this.creditCardExpMonth.subscribe(function (value) {
                    creditCardData.expirationMonth = value;
                });

                //Set cvv code to credit card data object
                this.creditCardVerificationNumber.subscribe(function (value) {
                    creditCardData.cvvCode = value;
                });

                //this.paymentType = window.checkoutConfig.payment.bluepay_payment.paymentTypes;
                this.paymentType = 'CC';

                this.storedPaymentAccounts.subscribe(function (value) {
                    if (value === undefined) {
                        creditCardData.token = '';
                        this.creditCardExpMonth = '';
                        this.creditCardExpYear = '';
                        $("#bluepay_payment_payment_type").attr('disabled', false);
                        if ($("#bluepay_payment_cc_number")) $("#bluepay_payment_cc_number").val('');
                        if ($("#bluepay_payment_expiration")) $("#bluepay_payment_expiration").val('');
                        if ($("#bluepay_payment_expiration_yr")) $("#bluepay_payment_expiration_yr").val('');
                        if ($("#bluepay_payment_echeck_acct_type")) $("#bluepay_payment_echeck_acct_type").val('C');
                        if ($("#bluepay_payment_echeck_acct_number")) $("#bluepay_payment_echeck_acct_number").val('');
                        if ($("#bluepay_payment_echeck_routing_number")) $("#bluepay_payment_echeck_routing_number").val('');
                        if ($("#bluepay_payment_stored_acct_cb")) $("#bluepay_payment_stored_acct_cb").attr('disabled', false);
                        return;
                    }
                    $("bluepay_payment_payment_type").attr('disabled', true);
                    $("bluepay_payment_stored_acct_cb").attr('disabled', true);
                    window.checkoutConfig.payment.bluepay_payment.storedAccounts.forEach(function (acct) {
                        if (acct.value == value) {
                            creditCardData.token = value;
                            if (!acct.label.split('-')[1].match("eCheck")) {
                                $("#bluepay_payment_payment_type").val('CC');
                                $("#bluepay_payment_cc_number").val(acct.label.substring(0, acct.label.indexOf('-')));
                                $("#bluepay_payment_expiration").val(acct.label.split('[')[1].split('/')[0]);
                                $("#bluepay_payment_expiration_yr").val(acct.label.split('[')[1].split('/')[1].split([']'])[0]);
                                $("#bluepay_payment_echeck_acct_type").val('C');
                                $("#bluepay_payment_echeck_acct_number").val('');
                                $("#bluepay_payment_echeck_routing_number").val('');
                                creditCardData.creditCardNumber = acct.label.substring(0, acct.label.indexOf('-'));
                                creditCardData.expirationMonth = acct.label.split('[')[1].split('/')[0];
                                creditCardData.expirationYear = acct.label.split('[')[1].split('/')[1].split([']'])[0];
                            } else {
                                $("#bluepay_payment_payment_type").val('ACH');
                                $("#bluepay_payment_echeck_acct_type").val(acct.label.split(':')[0]);
                                $("#bluepay_payment_echeck_acct_number").val(acct.label.split('-')[0].split(':')[2]);
                                $("#bluepay_payment_echeck_routing_number").val(acct.label.split(':')[1]);
                                $("#bluepay_payment_cc_number").val('');
                                $("#bluepay_payment_expiration").selectedIndex = 0;
                                $("#bluepay_payment_expiration_yr").selectedIndex = 0;
                                creditCardData.creditCardNumber = '';
                                creditCardData.expirationMonth = '';
                                creditCardData.expirationYear = '';
                            }
                        }
                        showHidePaymentFields();
                    });
                });

                this.saveInfo.subscribe(function (value) {
                    creditCardData.saveInfo = value;
                });

            },

            getCode: function () {
                return 'bluepay_payment';
            },
            getData: function () {
                //creditCardData.saveInfo = document.getElementById("bluepay_payment_stored_acct_cb").value;
                return {
                    'method': this.item.method,
                    'additional_data': {
                        'cc_cid': this.creditCardVerificationNumber(),
                        'cc_ss_start_month': this.creditCardSsStartMonth(),
                        'cc_ss_start_year': this.creditCardSsStartYear(),
                        'cc_type': this.creditCardType(),
                        'cc_exp_month': creditCardData.expirationMonth,
                        'cc_exp_year': creditCardData.expirationYear,
                        'cc_number': creditCardData.creditCardNumber,
                        'payment_type': this.getPaymentType(),
                        //'echeck_acct_type': document.getElementById("bluepay_payment_echeck_acct_type").value,
                        //'echeck_acct_number': document.getElementById("bluepay_payment_echeck_acct_number").value,
                        //'echeck_routing_number': document.getElementById("bluepay_payment_echeck_routing_number").value,
                        'token': creditCardData.token,
                        'save_payment_info': creditCardData.saveInfo
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
                if ($("#bluepay_payment_payment_type")) {
                    this.paymentType = $("#bluepay_payment_payment_type").val(); }
                return this.paymentType;
            },
            showHidePaymentFields: function() {
                showHidePaymentFields();
        },
            initPaymentFields: function () {
                if (!window.checkoutConfig.payment.bluepay_payment.isCustomerLoggedIn ||
                    window.checkoutConfig.payment.bluepay_payment.allowAccountsStorage == '0') {
                    $("#bluepay_payment_stored_acct_div").hide();
                    $("#bluepay_payment_stored_acct_cb_div").hide();
                }
                if (window.checkoutConfig.payment.bluepay_payment.paymentTypes == 'CC') {
                    $("#bluepay_payment_payment_type").val('CC');
                    $("#bluepay_payment_payment_type_div").hide();
                } else if (window.checkoutConfig.payment.bluepay_payment.paymentTypes == 'ACH') {
                    $("#bluepay_payment_payment_type").val('ACH');
                    $("#bluepay_payment_payment_type_div").hide();
                }
                $("bluepay_payment_stored_acct_cb").val('1');
                showHidePaymentFields();
            }
        });
    }
);