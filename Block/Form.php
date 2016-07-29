<?php

/**
 * Magento
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/osl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade Magento to newer
 * versions in the future. If you wish to customize Magento for your
 * needs please refer to http://www.magentocommerce.com for more information.
 *
 * @category    BluePay
 * @package     BluePay_CreditCard
 * @copyright   Copyright (c) 2016 BluePay Processing, LLC (http://www.bluepay.com)
 * @license     http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */

namespace BluePay\Payment\Block;

class Form extends \Magento\Framework\View\Element\Template
{
    /**
     * @var \Magento\Store\Model\StoreManagerInterface
     */
    private $storeManager;

    /**
     * @var \Magento\Framework\App\Config\ScopeConfigInterface
     */
    private $scopeConfig;

    /**
     * @var \Magento\Checkout\Model\Type\Onepage
     */
    private $checkoutTypeOnepage;

    /**
     * @var \Magento\Payment\Model\Config
     */
    private $paymentConfig;

    /**
     * @var \Magento\Framework\Event\ManagerInterface
     */
    private $eventManager;

    public function __construct(
        \Magento\Store\Model\StoreManagerInterface $storeManager,
        \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig,
        \Magento\Checkout\Model\Type\Onepage $checkoutTypeOnepage,
        \Magento\Payment\Model\Config $paymentConfig,
        \Magento\Framework\Event\ManagerInterface $eventManager
    ) {
        $this->storeManager = $storeManager;
        $this->scopeConfig = $scopeConfig;
        $this->checkoutTypeOnepage = $checkoutTypeOnepage;
        $this->paymentConfig = $paymentConfig;
        $this->eventManager = $eventManager;
    }
    public function _construct()
    {
        parent::_construct();
    if ($this->storeManager->getStore()->isAdmin()) {
        $this->setTemplate('bluepay/payment.phtml');
        return;
    }
<<<<<<< HEAD
    if ($this->scopeConfig->getValue(
        'payment/bluepay_payment/use_iframe',
        \Magento\Store\Model\ScopeInterface::SCOPE_STORE
    ) == 1) {
=======
    if ($this->scopeConfig->getValue('payment/bluepay_payment/use_iframe', \Magento\Store\Model\ScopeInterface::SCOPE_STORE) == 1) {
>>>>>>> origin/master
            $this->setTemplate('bluepay/creditcardiframe.phtml');
    } else {
        $this->setTemplate('bluepay/payment.phtml');
    }
    }
  
    public function setMethodInfo()
    {
        $payment = $this->checkoutTypeOnepage
            ->getQuote()
            ->getPayment();
        $this->setMethod($payment->getMethodInstance());

        return $this;
    }

    public function getMethod()
    {
        $method = $this->getData('method');

        if (!($method instanceof \Magento\Payment\Model\Method\AbstractMethod)) {
            throw new \Magento\Framework\Exception\LocalizedException($this->__(
                'Cannot retrieve the payment method model object.'
            ));
        }
        return $method;
    }

    /**
     * Retrieve payment method code
     *
     * @return string
     */
    public function getMethodCode()
    {
        return $this->getMethod()->getCode();
    }

    /**
     * Retrieve field value data from payment info object
     *
     * @param   string $field
     * @return  mixed
     */
    public function getInfoData($field)
    {
        return $this->htmlEscape($this->getMethod()->getInfoInstance()->getData($field));
    }
 
    /**
     * Retrieve payment configuration object
     *
     * @return \Magento\Payment\Model\Config
     */
    public function _getConfig()
    {
        return $this->paymentConfig;
    }

    /**
     * Retrieve availables credit card types
     *
     * @return array
     */
    public function getCcAvailableTypes()
    {
        $types = $this->_getConfig()->getCcTypes();
        if ($method = $this->getMethod()) {
            $availableTypes = $method->getConfigData('cctypes');
            if ($availableTypes) {
                $availableTypes = explode(',', $availableTypes);
                foreach ($types as $code => $name) {
                    if (!in_array($code, $availableTypes)) {
                        unset($types[$code]);
                    }
                }
            }
        }
        return $types;
    }

    /**
     * Retrieve credit card expire months
     *
     * @return array
     */
    public function getCcMonths()
    {
        $months = $this->getData('cc_months');
        if ($months === null) {
            $months[0] =  $this->__('Month');
            $months = array_merge($months, $this->_getConfig()->getMonths());
            $this->setData('cc_months', $months);
        }
        return $months;
    }

    /**
     * Retrieve credit card expire years
     *
     * @return array
     */
    public function getCcYears()
    {
        $years = $this->getData('cc_years');
        if ($years === null) {
            $years = $this->_getConfig()->getYears();
            $years = [0=>$this->__('Year')]+$years;
            $this->setData('cc_years', $years);
        }
        return $years;
    }

    /**
     * Retrive has verification configuration
     *
     * @return boolean
     */
    public function hasVerification()
    {
        if ($this->getMethod()) {
            $configData = $this->getMethod()->getConfigData('useccv');
<<<<<<< HEAD
            if ($configData === null) {
=======
            if (is_null($configData)) {
>>>>>>> origin/master
                return true;
            }
            return (bool) $configData;
        }
        return true;
    }

    public function hasVerificationBackend()
    {
    if ($this->getMethod()) {
            $configData = $this->getMethod()->getConfigData('useccv_backend');
<<<<<<< HEAD
            if ($configData === null) {
                return true;
            }
            return (bool) $configData;
    }
        return true;
=======
            if (is_null($configData)) {
                return true;
            }
            return (bool) $configData;
    }
        return true;
    }

    /**
     * Render block HTML
     *
     * @return string
     */
    protected function _toHtml()
    {
        $this->eventManager->dispatch('payment_form_block_to_html_before', [
            'block'     => $this
        ]);
        return parent::_toHtml();
    }

    public function _prepareLayout()
    {
        return parent::_prepareLayout();
    }
    public function getViewUrl($event)
    {
        return $this->getUrl('giftregistry/customer/viewregistry/', ['event_id' => $event['event_id']]);
    }
    public function getBackUrl()
    {
        return $this->getUrl('customer/account/index');
    }
    public function getNewRegistryUrl()
    {
        return $this->getUrl('giftregistry/customer/newregistry');
    }
    public function getUpdateUrl()
    {
        return $this->getUrl('giftregistry/customer/registry');
    }
    public function getEditUrl($event)
    {
        return $this->getUrl('giftregistry/customer/editregistry', ['event_id' => $event['event_id']]);
>>>>>>> origin/master
    }
}
