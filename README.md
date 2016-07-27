# BluePay_Payment_M2

BluePay credit card &amp; ACH payment extension for Magento 2. If you are looking for the Magento 1.x.x.x payment modules, [Click here for the Credit Card module](https://www.magentocommerce.com/magento-connect/bluepay-creditcard-2-1.html), or [Click here for the ACH module](https://www.magentocommerce.com/magento-connect/bluepay-echeck.html)

Since this module links your Magento store to the BluePay gateway, a gateway account is required. If you don't already have one, [Click here](https://www.bluepay.com/contact-us/get-started/) to start the sign up process.

# Installation
1. First, navigate to your Magento 2 root directory
2. Enter the following commands:

```cmd
composer config repositories.bluepay_payment git https://github.com/jslingerland/BluePay_Payment_M2.git
composer require bluepay/payment:dev-master
```

Once the dependencies have finished installing, enter the next commands:

```cmd
php bin/magento module:enable BluePay_Payment --clear-static-content
php bin/magento setup:upgrade
```

At this point, the module should be fully installed. Finally, log into your Magento admin section and navigate to Stores -> Configuration -> Sales -> Payment Methods -> BluePay Credit Card & eCheck to finish the setup.
