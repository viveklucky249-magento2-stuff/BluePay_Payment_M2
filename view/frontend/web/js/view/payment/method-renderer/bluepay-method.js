/**
 * Inchoo_Stripe Magento JS component
 *
 * @category    Inchoo
 * @package     Inchoo_Stripe
 * @author      Ivan Weiler & Stjepan Udovičić
 * @copyright   Inchoo (http://inchoo.net)
 * @license     http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */
/*browser:true*/
/*global define*/
define(
    [
        'BluePay_Payment/js/view/payment/payment-form',
        //'BluePay_ECheck/js/view/payment/bluepay-payments',
        //'Magento_Checkout/js/view/payment/default',
        //'Magento_Payment/js/view/payment/cc-form',
        //'Magento_Payment/js/view/payment/iframe',
        'jquery',
        //'Magento_Payment/js/model/credit-card-validation/validator',
        'Magento_Checkout/js/action/set-payment-information'
    ],
    function (Component, $, setPaymentInformationAction) {
        'use strict';

        return Component.extend({
            defaults: {
                template: 'BluePay_Payment/payment/payment-form'
            },

            getCode: function() {
                return 'bluepay_payment';
            },

            isActive: function() {
                return true;
            },

            validate: function() {
                var $form = $('#' + this.getCode() + '-form');
                return $form.validation() && $form.validation('isValid');
            }
        });
    }
);
