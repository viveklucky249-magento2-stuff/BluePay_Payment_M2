    define(
        [
        'uiComponent',
        'underscore',
        'mage/translate',
        'Magento_Ui/js/form/form',
        'ko',
        'jquery',
        'jquery/ui',
        ],
        function($, _, ko, Component) {
            'use strict';
            return Component.extend({

            initialize: function () {
                var self = this;
                this._super();
                this.result = '';
                this.message = '';
                this.cardType = '';
                this.authCode = '';
                this.avs = '';
                this.cvv2 = '';
                window.addEventListener("message", receiveMessage, false);

                this.storedPaymentAccounts.subscribe(function (value) {
                    if (value === undefined) {
                        creditCardData.token = '';
                        this.creditCardExpMonth = '';
                        this.creditCardExpYear = '';
                        document.getElementById("bluepay_payment_payment_type").disabled = false;
                        document.getElementById("bluepay_payment_stored_acct_cb").disabled = false;
                        iframePaymentFields = '';
                        initIframe();
                        return;
                    }
                    document.getElementById("bluepay_payment_payment_type").disabled = true;
                    document.getElementById("bluepay_payment_stored_acct_cb").disabled = true;
                });
            },
            getStoredAccounts: function () {
                return window.storedAccounts;
            },
            getStoredAccountsValue: function () {
                return _.map(this.getStoredAccounts(), function (value, key) {
                    return {
                        'value': value.value,
                        'label': value.label
                    }
                });
            },
        });
    });