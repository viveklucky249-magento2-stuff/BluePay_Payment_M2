<?php
/**
 * Encrypted config field backend model
 *
 * Copyright © 2016 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */

// @codingStandardsIgnoreFile

namespace BluePay\Payment\Model\System\Config\Backend;

class Encrypted extends \Magento\Config\Model\Config\Backend\Encrypted
{

    /**
     * Encrypt value before saving
     *
     * @return void
     */
    public function beforeSave()
    {
        $this->_dataSaveAllowed = false;
        $value = $this->getValue();
        // don't save value, if an obscured value was received. This indicates that data was not changed.
        if (!preg_match('/^\*+$/', $value) && !empty($value)) {
            if ($this->getPath() == "payment/bluepay_payment/account_id" && strlen($value) != 12) {
                $this->_dataSaveAllowed = false;
                throw new \Magento\Framework\Exception\LocalizedException(__("Error. Account ID must be 12 digits and begin with 100. Your settings have not been saved."));
            } else if ($this->getPath() == "payment/bluepay_payment/secret_key" && strlen($value) != 32) {
                $this->_dataSaveAllowed = false;
                throw new \Magento\Framework\Exception\LocalizedException(__("Error. Secret Key must be 32 digits. Your settings have not been saved."));
            }
            $this->_dataSaveAllowed = true;
            $encrypted = $this->_encryptor->encrypt($value);
            $this->setValue($encrypted);
        }
    }
}
