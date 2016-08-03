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
 
namespace BluePay\Payment\Model\Source;

use Magento\Customer\Controller\RegistryConstants;
use Magento\Framework\Registry;
use Magento\Catalog\Model\ResourceModel\Category\CollectionFactory;

class StoredAccounts extends \Magento\Eav\Model\Entity\Attribute\Source\Boolean
{
    /**
     * @var \Magento\Eav\Model\ResourceModel\Entity\AttributeFactory
     */
    public $_eavAttrEntity;

    public $_coreRegistry = null;

    public $_categoryCollection;

    public $_customerRepository;

    public $_customerRegistry;

    public $_customer = null;

    /**
     * @param \Magento\Eav\Model\ResourceModel\Entity\AttributeFactory $eavAttrEntity
     * @codeCoverageIgnore
     */
    public function __construct(
        \Magento\Eav\Model\ResourceModel\Entity\AttributeFactory $eavAttrEntity,
        \Magento\Framework\Registry $registry,
        \Magento\Catalog\Model\ResourceModel\Category\CollectionFactory $categoryCollection,
        \Magento\Customer\Model\ResourceModel\CustomerRepository $customerRepository,
        \Magento\Customer\Model\CustomerRegistry $customerRegistry
    ) {
        $this->_eavAttrEntity = $eavAttrEntity;
        $this->_coreRegistry = $registry;
        $this->_categoryCollection = $categoryCollection;
        $this->_customerRepository = $customerRepository;
        $this->_customerRegistry = $customerRegistry;
    }

    /**
     * Retrieve all options array
     *
     * @return array
     */
    public function getAllOptions()
    {
        $attributeCode = $this->getAttribute()->getAttributeCode();
        $customerId = $this->_coreRegistry->registry(RegistryConstants::CURRENT_CUSTOMER_ID);
        if ($customerId && $this->_customer != '1' && $attributeCode == 'bluepay_stored_accts') {
            $this->_customer = '1';
            $customer = $this->_customerRegistry->retrieve($customerId);
            $customerData = $customer->getDataModel();
            $paymentAcctString = $customerData->getCustomAttribute($attributeCode) ?
                $customerData->getCustomAttribute($attributeCode)->getValue() : '';
            if (strpos($paymentAcctString, '|') !== false) {
                $this->_options = [];
                $paymentAccts = explode('|', $paymentAcctString);
                foreach ($paymentAccts as $paymentAcct) {
                    if (strlen($paymentAcct) < 2) {
                        continue;
                    }
                    $paymentAccount = explode(',', $paymentAcct);
                    $val = ['label' => __($paymentAccount[0]), 'value' => $paymentAccount[1]];
                    array_push($this->_options, $val);
                }
                return $this->_options;
            }
        }
        if ($this->_options == null) {
            $this->_options = [
                ['label' => __('-No payment accounts found-'), 'value' => '']
            ];
        }
        return $this->_options;
    }
}
