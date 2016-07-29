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
 
class Config
{
    protected static $_methods;

    /**
     * @var \Magento\Framework\App\Config\ScopeConfigInterface
     */
    protected $scopeConfig;

    public function __construct(
        \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig
    ) {
        $this->scopeConfig = $scopeConfig;
    }
    public function getActiveMethods($store = null)
    {
        $methods = [];
        $config = $this->scopeConfig->getValue('payment', \Magento\Store\Model\ScopeInterface::SCOPE_STORE, $store);
        foreach ($config as $code => $methodConfig) {
            if (Mage::getStoreConfigFlag('bluepay_payment/'.$code.'/active', $store)) {
                $methods[$code] = $this->_getMethod($code, $methodConfig);
            }
        }
        return $methods;
    }

    public function getAllMethods($store = null)
    {
        $methods = [];
        $config = $this->scopeConfig->getValue('payment', \Magento\Store\Model\ScopeInterface::SCOPE_STORE, $store);
        foreach ($config as $code => $methodConfig) {
            $methods[$code] = $this->_getMethod($code, $methodConfig);
        }
        return $methods;
    }

    protected function _getMethod($code, $config, $store = null)
    {
        if (isset(self::$_methods[$code])) {
            return self::$_methods[$code];
        }
        $modelName = $config['model'];
        $method = Mage::getModel($modelName);
        $method->setId($code)->setStore($store);
        self::$_methods[$code] = $method;
        return self::$_methods[$code];
    }

    public function getAccountTypes()
    {
        $types = ['CHECKING' => 'Checking', 'BUSINESSCHECKING' => 'Business checking', 'SAVINGS' => 'Savings'];
        return $types;
    }
}
