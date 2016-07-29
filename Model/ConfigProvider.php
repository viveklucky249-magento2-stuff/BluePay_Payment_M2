<?php
namespace BluePay\Payment\Model;

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

use Magento\Checkout\Model\ConfigProviderInterface;
use Magento\Store\Model\ScopeInterface;
use Magento\Framework\Escaper;
use Magento\Payment\Helper\Data as PaymentHelper;
use Magento\Payment\Model\CcConfig;
use Magento\Framework\View\Asset\Source;
 
class ConfigProvider implements ConfigProviderInterface
{
    /**
     * @var \Magento\Framework\App\Config\ScopeConfigInterface
     */
    protected $scopeConfiguration;

    protected $ccConfig;

    protected $_customerRepository;

    protected $_coreRegistry = null;

    protected $_customerSession;


    /**
     * @param \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfiguration
     * @codeCoverageIgnore
     */
    public function __construct(
        CcConfig $ccConfig,
        Source $assetSource,
        \Magento\Customer\Model\Session $customerSession,
        \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfiguration
    ) {
        $this->ccConfig = $ccConfig;
        $this->_customerSession = $customerSession;
        $this->scopeConfiguration = $scopeConfiguration;
        $this->assetSource = $assetSource;
    }

    /**
     * {@inheritdoc}
     */
    public function getConfig()
    {
        $paymentAcctString = $this->_customerSession->getCustomerDataObject()->getCustomAttribute('bluepay_stored_accts') ? $this->_customerSession->getCustomerDataObject()->getCustomAttribute('bluepay_stored_accts')->getValue() : '';
        $options = [];
        if (strpos($paymentAcctString, '|') !== false) {
                $paymentAccts = explode('|', $paymentAcctString);
                foreach ($paymentAccts as $paymentAcct) {
                    if (strlen($paymentAcct) < 2) {
                        continue;
                    }
                    $paymentAccount = explode(',', $paymentAcct);
                    $val = ['label' => __($paymentAccount[0]), 'value' => $paymentAccount[1]];
                    array_push($options, $val);
                }
        }
        $config = [
            'payment' => [
                'bluepay_payment' => [
                    'cctypes' => $this->scopeConfiguration->getValue('payment/bluepay_payment/cctypes', \Magento\Store\Model\ScopeInterface::SCOPE_STORE),
                    'availableTypes' => $this->getCcAvailableTypes('bluepay_payment'),
                    'months' => $this->getCcMonths(),
                    'years' => $this->getCcYears(),
                    'hasVerification' => $this->hasVerification('bluepay_payment'),
                    'hasSsCardType' => $this->hasSsCardType('bluepay_payment'),
                    'ssStartYears' => $this->getSsStartYears(),
                    'cvvImageUrl' => $this->getCvvImageUrl(),
                    'active' => $this->scopeConfiguration->getValue('payment/bluepay_payment/active', \Magento\Store\Model\ScopeInterface::SCOPE_STORE),
                    'paymentTypes' => $this->scopeConfiguration->getValue('payment/bluepay_payment/payment_type', \Magento\Store\Model\ScopeInterface::SCOPE_STORE),
                    'allowAccountsStorage' => $this->scopeConfiguration->getValue('payment/bluepay_payment/tokenization', \Magento\Store\Model\ScopeInterface::SCOPE_STORE),
                    'storedAccounts' => $options,
                    'isCustomerLoggedIn' => $this->_customerSession->isLoggedIn()
                ],
                'test' => "OK"
                ],
                'ccform' => [
                    'icons' => $this->getIcons(),
                    'availableTypes' => ['bluepay_payment' => $this->getCcAvailableTypes('bluepay_payment')],
                ],
            ];
        return $config;
    }

    /**
     * Get instructions text from config
     *
     * @param string $code
     * @return string
     */
    protected function getInstructions($code)
    {
        return nl2br($this->escaper->escapeHtml($this->methods[$code]->getInstructions()));
    }

    /**
     * Solo/switch card start years
     *
     * @return array
     */
    protected function getSsStartYears()
    {
        return $this->ccConfig->getSsStartYears();
    }

    /**
     * Retrieve credit card expire months
     *
     * @return array
     */
    protected function getCcMonths()
    {
        return $this->ccConfig->getCcMonths();
    }

    /**
     * Retrieve credit card expire years
     *
     * @return array
     */
    protected function getCcYears()
    {
        return $this->ccConfig->getCcYears();
    }

    /**
     * Retrieve CVV tooltip image url
     *
     * @return string
     */
    protected function getCvvImageUrl()
    {
        return $this->ccConfig->getCvvImageUrl();
    }

    /**
     * Retrieve availables credit card types
     *
     * @param string $methodCode
     * @return array
     */
    protected function getCcAvailableTypes($methodCode)
    {
        $types = $this->ccConfig->getCcAvailableTypes();
        $availableTypes = $this->scopeConfiguration->getValue('payment/bluepay_payment/cctypes', \Magento\Store\Model\ScopeInterface::SCOPE_STORE);
        if ($availableTypes) {
            $availableTypes = explode(',', $availableTypes);
            foreach (array_keys($types) as $code) {
                if (!in_array($code, $availableTypes)) {
                    unset($types[$code]);
                }
            }
        }
        return $types;
    }

    /**
     * Retrieve has verification configuration
     *
     * @param string $methodCode
     * @return bool
     */
    protected function hasVerification($methodCode)
    {
        $result = $this->ccConfig->hasVerification();
        $configData = $this->scopeConfiguration->getValue('payment/bluepay_payment/useccv', \Magento\Store\Model\ScopeInterface::SCOPE_STORE);
        if ($configData !== null) {
            $result = (bool)$configData;
        }
        return $result;
    }

    /**
     * Whether switch/solo card type available
     *
     * @param string $methodCode
     * @return bool
     */
    protected function hasSsCardType($methodCode)
    {
        $result = false;
        $availableTypes = explode(',', $this->scopeConfiguration->getValue('payment/bluepay_payment/cctypes', \Magento\Store\Model\ScopeInterface::SCOPE_STORE));
        $ssPresentations = array_intersect(['SS', 'SM', 'SO'], $availableTypes);
        if ($availableTypes && count($ssPresentations) > 0) {
            $result = true;
        }
        return $result;
    }

    /**
     * Get icons for available payment methods
     *
     * @return array
     */
    protected function getIcons()
    {
        $icons = [];
        $types = $this->ccConfig->getCcAvailableTypes();
        foreach (array_keys($types) as $code) {
            if (!array_key_exists($code, $icons)) {
                $asset = $this->ccConfig->createAsset('Magento_Payment::images/cc/' . strtolower($code) . '.png');
                $placeholder = $this->assetSource->findRelativeSourceFilePath($asset);
                if ($placeholder) {
                    list($width, $height) = getimagesize($asset->getSourceFile());
                    $icons[$code] = [
                        'url' => $asset->getUrl(),
                        'width' => $width,
                        'height' => $height
                    ];
                }
            }
        }
        return $icons;
    }
}
