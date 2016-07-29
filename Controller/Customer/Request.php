<?php
namespace BluePay\Payment\Controller\Customer;

class Request extends \Magento\Framework\App\Action\Action
{

    const CURRENT_VERSION = '1.0.0.0';
    /** @var  \Magento\Framework\View\Result\Page */
    private $resultPageFactory;

    /**
     * @var \Magento\Framework\App\Config\ScopeConfigInterface
     */
    private $scopeConfiguration;

    private $customerSession;

    private $request;

    private $customerRegistry;

    /** @var \Magento\Framework\Controller\Result\JsonFactory */
    private $jsonResultFactory;

    /**      * @param \Magento\Framework\App\Action\Context $context      */
    public function __construct(
        \Magento\Framework\App\Action\Context $context,
        \Magento\Customer\Model\Session $customerSession,
        \Magento\Customer\Model\CustomerRegistry $customerRegistry,
        \Magento\Framework\App\Request\Http $request,
        \Magento\Framework\View\Result\PageFactory $resultPageFactory,
        \Magento\Framework\HTTP\ZendClientFactory $zendClientFactory,
        \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfiguration,
        \Magento\Framework\Controller\Result\JsonFactory $jsonResultFactory
    ) {
        parent::__construct($context);
        $this->customerSession = $customerSession;
        $this->customerRegistry = $customerRegistry;
        $this->request = $request;
        $this->resultPageFactory = $resultPageFactory;
        $this->zendClientFactory = $zendClientFactory;
        $this->scopeConfiguration = $scopeConfiguration;
        $this->jsonResultFactory = $jsonResultFactory;
    }

    public function execute()
    {
        $result = $this->jsonResultFactory->create();

        if ($this->getRequest()->getPost('payment') != null) {
            $token = $this->getRequest()->getPost('payment')['stored_acct'] ?
                $this->getRequest()->getPost('payment')['stored_acct'] : '';
            $client = $this->zendClientFactory->create();
            $client->setUri('https://secure.bluepay.com/interfaces/bp10emu');
            $client->setConfig([
                'maxredirects'=>0,
                'timeout'=>15,
                'useragent'=>'BluePay Magento 2 Payment Plugin/' . self::CURRENT_VERSION,
            ]);
            $post = [
                'RESPONSEVERSION' => '3',
                'MERCHANT' => $this->scopeConfiguration->getValue(
                    'payment/bluepay_payment/account_id',
                    \Magento\Store\Model\ScopeInterface::SCOPE_STORE
                ),
                'TRANSACTION_TYPE' => 'AUTH',
                'AMOUNT' => '0.00',
                'PAYMENT_TYPE' => $this->getRequest()->getPost('payment')['payment_type'],
                'MODE' => $this->scopeConfiguration->getValue(
                    'payment/bluepay_payment/trans_mode',
                    \Magento\Store\Model\ScopeInterface::SCOPE_STORE
                ),
                'TPS_HASH_TYPE' => 'SHA512',
                'RRNO' => $token,
                'NAME1' => $this->customerSession->getCustomerData()->getFirstName(),
                'NAME2' => $this->customerSession->getCustomerData()->getLastName(),
                'COMPANY_NAME' => $this->customerSession->getCustomerData()->getAddresses()[0]->getCompany(),
                'TAMPER_PROOF_SEAL' => $this->calcTPS($token)
            ];
            if ($this->getRequest()->getPost('payment')['payment_type'] == 'CC') {
                $ccFields = [
                    'CC_NUM' => $this->getRequest()->getPost('payment')['cc_number'],
                    'CC_EXPIRES_MONTH' => $this->getRequest()->getPost('payment')['cc_exp_month'],
                    'CC_EXPIRES_YEAR' => $this->getRequest()->getPost('payment')['cc_exp_year']
                ];
                $post = array_merge($post, $ccFields);
            } else {
                $achFields = [
                    'ACH_ACCOUNT_TYPE' => $this->getRequest()->getPost('payment')['echeck_acct_type'],
                    'ACH_ACCOUNT' => $this->getRequest()->getPost('payment')['echeck_acct_number'],
                    'ACH_ROUTING' => $this->getRequest()->getPost('payment')['echeck_routing_number']
                ];
                $post = array_merge($post, $achFields);
            }
            $client->setParameterPost($post);
            $client->setMethod(\Zend_Http_Client::POST);
            try {
                $response = $client->request();

                $r = substr($response->getHeader('location'), strpos($response->getHeader('location'), "?") + 1);
                parse_str($r, $responseFromBP);
                if ($responseFromBP['Result'] == 'APPROVED') {
                    $this->saveCustomerPaymentInfo($responseFromBP);
                }
                 $result->setData(
                     [
                        'result' => __($responseFromBP['Result']),
                        'message' => __($responseFromBP['MESSAGE'])
                     ]
                 );
                $result->setHttpResponseCode(\Magento\Framework\Webapi\Response::HTTP_OK);
                return $result;
<<<<<<< HEAD
            } catch (\Exception $e) {
                throw new \Magento\Framework\Validator\Exception\LocalizedException(__($e->getMessage()));
=======
            } catch (Exception $e) {
                throw new \Magento\Framework\Exception\LocalizedException($this->_wrapGatewayError($e->getMessage()));
>>>>>>> origin/master
            }
        }
    }

<<<<<<< HEAD
    final public function calcTPS($token)
    {
        $hashstr = $this->scopeConfiguration->getValue(
            'payment/bluepay_payment/secret_key',
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        ) .
            $this->scopeConfiguration->getValue(
                'payment/bluepay_payment/account_id',
                \Magento\Store\Model\ScopeInterface::SCOPE_STORE
            ) .
        'AUTH' . '0.00' . $token . $this->scopeConfiguration->getValue(
            'payment/bluepay_payment/trans_mode',
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );
        return hash('sha512', $hashstr);
=======
    final protected function calcTPS($token)
    {
        $hashstr = $this->scopeConfiguration->getValue('payment/bluepay_payment/secret_key', \Magento\Store\Model\ScopeInterface::SCOPE_STORE) .
            $this->scopeConfiguration->getValue('payment/bluepay_payment/account_id', \Magento\Store\Model\ScopeInterface::SCOPE_STORE) .
        'AUTH' . '0.00' . $token . $this->scopeConfiguration->getValue('payment/bluepay_payment/trans_mode', \Magento\Store\Model\ScopeInterface::SCOPE_STORE);
        return bin2hex(md5($hashstr, true));
>>>>>>> origin/master
    }

    public function saveCustomerPaymentInfo($result)
    {
        $customer = $this->customerRegistry->retrieve($this->customerSession->getId());
        $customerData = $this->customerSession->getCustomerData();
        $paymentAcctString = $customerData->getCustomAttribute('bluepay_stored_accts') ?
            $customerData->getCustomAttribute('bluepay_stored_accts')->getValue() : '';
        $oldToken = isset($result["MASTER_ID"]) ? $result["MASTER_ID"] : '';
        $newToken = $result['RRNO'];
        $newCardType = $result['CARD_TYPE'];
        $newCcExpMonth = isset($result['CARD_EXPIRE']) ? substr($result['CARD_EXPIRE'], 0, 2) : '';
        $newCcExpYear = isset($result['CARD_EXPIRE']) ? substr($result['CARD_EXPIRE'], 2, 2) : '';
        $newPaymentAccount = $result['PAYMENT_ACCOUNT'];
        // This is a brand new payment account
        if ($oldToken == '') {
            $paymentAcctString = $result['PAYMENT_TYPE'] == 'ACH' ?
                $paymentAcctString . $newPaymentAccount . ' - eCheck,' . $newToken . '|' :
<<<<<<< HEAD
                $paymentAcctString . $newPaymentAccount . ' - ' .$newCardType . ' [' .
                $newCcExpMonth . '/' . $newCcExpYear .
=======
                $paymentAcctString . $newPaymentAccount . ' - ' .$newCardType . ' [' . $newCcExpMonth . '/' . $newCcExpYear .
>>>>>>> origin/master
            '],' . $newToken . '|';
        // update an existing payment account
        } else {
            $paymentAccts = explode('|', $paymentAcctString);
            foreach ($paymentAccts as $paymentAcct) {
                if (strlen($paymentAcct) < 2) {
                    continue;
                }
                $paymentAccount = explode(',', $paymentAcct);
                if (strpos($paymentAcct, $oldToken) !== false) {
                    $oldPaymentString = $paymentAccount[0];
                    $oldPaymentAccount = explode('-', $oldPaymentString)[0];
                    // gather new ACH info to update payment info in db
                    if (preg_match("/eCheck/i", $oldPaymentString)) {
<<<<<<< HEAD
                        $newPaymentString = str_replace(
                            trim($oldPaymentAccount),
                            $newPaymentAccount,
                            $oldPaymentString
                        );
=======
                        $newPaymentString = str_replace(trim($oldPaymentAccount), $newPaymentAccount, $oldPaymentString);
>>>>>>> origin/master
                    // gather new CC info to update payment info in db
                    } else {
                        $oldExpMonth = substr(explode('[', ($oldPaymentString))[1], 0, 2);
                        $oldExpYear = substr(explode('[', ($oldPaymentString))[1], 3, 2);
                        $oldCardType = explode('[', (explode('-', $oldPaymentString)[1]))[0];
                        $newPaymentString = str_replace($oldExpMonth, $newCcExpMonth, $oldPaymentString);
                        $newPaymentString = str_replace($oldExpYear, $newCcExpYear, $newPaymentString);
<<<<<<< HEAD
                        $newPaymentString = str_replace(
                            trim($oldPaymentAccount),
                            $newPaymentAccount,
                            $newPaymentString
                        );
=======
                        $newPaymentString = str_replace(trim($oldPaymentAccount), $newPaymentAccount, $newPaymentString);
>>>>>>> origin/master
                        $newPaymentString = str_replace(trim($oldCardType), $newCardType, $newPaymentString);
                    }
                    $paymentAcctString = str_replace($oldPaymentString, $newPaymentString, $paymentAcctString);
                    $paymentAcctString = str_replace($oldToken, $newToken, $paymentAcctString);
                    break;
                }
            }
        }
        $customerData->setCustomAttribute('bluepay_stored_accts', $paymentAcctString);
        $customer->updateData($customerData);
        $customer->save();
    }
}
