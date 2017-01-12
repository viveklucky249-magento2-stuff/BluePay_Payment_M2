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
 * @package     BluePay_ECheck
 * @copyright   Copyright (c) 2016 BluePay Processing, LLC (http://www.bluepay.com)
 * @license     http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */

namespace BluePay\Payment\Model\Rewrite\Quote\Payment;

use Magento\Payment\Model\Method\Substitution;

/**
 * Class ToOrderPayment
 */
class ToOrderPayment extends \Magento\Quote\Model\Quote\Payment\ToOrderPayment
{
    public function convert(\Magento\Quote\Model\Quote\Payment $object, $data = [])
    {
        $paymentData = $this->objectCopyService->getDataFromFieldset(
            'quote_convert_payment',
            'to_order_payment',
            $object
        );

        $orderPayment = $this->orderPaymentRepository->create();
        $this->dataObjectHelper->populateWithArray(
            $orderPayment,
            array_merge($paymentData, $data),
            '\Magento\Sales\Api\Data\OrderPaymentInterface'
        );
        $orderPayment->setAdditionalInformation(
            array_merge(
                $object->getAdditionalInformation(),
                [Substitution::INFO_KEY_TITLE => $object->getMethodInstance()->getTitle()]
            )
        );
        $orderPayment->setPaymentType($object->getPaymentType());
        $orderPayment->setIframe($object->getIframe());
        $orderPayment->setCcNumber($object->getCcNumber());
        $orderPayment->setCcCid($object->getCcCid());
        $orderPayment->setEcheckRoutingNumber($object->getEcheckRoutingNumber());
        $orderPayment->setEcheckAcctNumber($object->getEcheckAcctNumber());
        $orderPayment->setEcheckAcctType($object->getEcheckAcctType());
        $orderPayment->setToken($object->getToken());
        $orderPayment->setSavePaymentInfo($object->getSavePaymentInfo());
        $paymentType = $object->getCardType() == "ACH" ? "OT" : $object->getCardType();
        $object->setCardType($paymentType);

        if ($object->getIframe() == "1") {
            $orderPayment->setResult($object->getResult());
            $orderPayment->setMessage($object->getMessage());
            $orderPayment->setCardType($object->getCardType());
            $orderPayment->setAuthCode($object->getAuthCode());
            $orderPayment->setAvs($object->getAvs());
            $orderPayment->setCvv2($object->getCvv2());
        }

        return $orderPayment;
    }
}
