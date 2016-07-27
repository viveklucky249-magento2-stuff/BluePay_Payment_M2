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
        //'BluePay_CreditCard/js/view/payment/echeck-form',
        //'Magento_Payment/js/model/credit-card-validation/credit-card-data',
        //'Magento_Payment/js/model/credit-card-validation/credit-card-number-validator',
        //'mage/translate'
    ],
    function (_, Component, $t) {
        return Component.extend({
            defaults: {
                echeckAccountType: '',
                echeckRoutingNumber: '',
                echeckAccountNumber: '',
            },

            initObservable: function () {
                this._super()
                    .observe([
                        'echeckAccountType',
                        'echeckRoutingNumber',
                        'echeckAccountNumber',
                    ]);
                return this;
            },

            initialize: function() {
                var self = this;
                this._super();
            },

            getCode: function() {
                return 'echeck';
            },
            getData: function() {
                return {
                    'method': this.item.method,
                    'additional_data': {                      
                        'echeck_acct_type': document.getElementById("bluepay_echeck_echeck_acct_type").value,
                        'echeck_acct_number': document.getElementById("bluepay_echeck_echeck_acct_number").value,
                        'echeck_routing_number': document.getElementById("bluepay_echeck_echeck_routing_number").value
                    }
                };
            },
            getCcAvailableTypes: function() {
                return window.checkoutConfig.payment.ccform.availableTypes[this.getCode()];
            },
            getIcons: function (type) {
                return window.checkoutConfig.payment.ccform.icons.hasOwnProperty(type)
                    ? window.checkoutConfig.payment.ccform.icons[type]
                    : false
            },
            getCcMonths: function() {
                return window.checkoutConfig.payment.ccform.months[this.getCode()];
            },
            getCcYears: function() {
                return window.checkoutConfig.payment.ccform.years[this.getCode()];
            },
            hasVerification: function() {
                return window.checkoutConfig.payment.ccform.hasVerification[this.getCode()];
            },
            hasSsCardType: function() {
                return window.checkoutConfig.payment.ccform.hasSsCardType[this.getCode()];
            },
            getCvvImageUrl: function() {
                return window.checkoutConfig.payment.ccform.cvvImageUrl[this.getCode()];
            },
            getCvvImageHtml: function() {
                return '<img src="' + this.getCvvImageUrl()
                    + '" alt="' + $t('Card Verification Number Visual Reference')
                    + '" title="' + $t('Card Verification Number Visual Reference')
                    + '" />';
            },
            getSsStartYears: function() {
                return window.checkoutConfig.payment.ccform.ssStartYears[this.getCode()];
            },
            getCcAvailableTypesValues: function() {
                return _.map(this.getCcAvailableTypes(), function(value, key) {
                    return {
                        'value': key,
                        'type': value
                    }
                });
            },
            getCcMonthsValues: function() {
                return _.map(this.getCcMonths(), function(value, key) {
                    return {
                        'value': key,
                        'month': value
                    }
                });
            },
            getCcYearsValues: function() {
                return _.map(this.getCcYears(), function(value, key) {
                    return {
                        'value': key,
                        'year': value
                    }
                });
            },
            getSsStartYearsValues: function() {
                return _.map(this.getSsStartYears(), function(value, key) {
                    return {
                        'value': key,
                        'year': value
                    }
                });
            },
            isShowLegend: function() {
                return false;
            },
            getCcTypeTitleByCode: function(code) {
                var title = '';
                _.each(this.getCcAvailableTypesValues(), function (value) {
                    if (value['value'] == code) {
                        title = value['type'];
                    }
                });
                return title;
            },
            formatDisplayCcNumber: function(number) {
                return 'xxxx-' + number.substr(-4);
            },
            getInfo: function() {
                return [
                    {'name': 'Credit Card Type', value: this.getCcTypeTitleByCode(this.creditCardType())},
                    {'name': 'Credit Card Number', value: this.formatDisplayCcNumber(this.creditCardNumber())}
                ];
            }
        });
    }
);
