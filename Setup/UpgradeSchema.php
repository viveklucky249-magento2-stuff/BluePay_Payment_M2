<?php

namespace BluePay\Payment\Setup;

use Magento\Framework\Setup\UpgradeSchemaInterface;
use Magento\Framework\Setup\SchemaSetupInterface;
use Magento\Framework\Setup\ModuleContextInterface;
 
/**
 * @codeCoverageIgnore
 */
class UpgradeSchema implements UpgradeSchemaInterface
{
    public function upgrade(SchemaSetupInterface $setup, ModuleContextInterface $context)
    {
        $setup->startSetup();
 
        //handle all possible upgrade versions
 
        if(!$context->getVersion()) {
            //no previous version found, installation, InstallSchema was just executed
            //be careful, since everything below is true for installation !
        }
 
        if (version_compare($context->getVersion(), '1.0.1') < 0) {
            //code to upgrade to 1.0.1
        }
 
        if (version_compare($context->getVersion(), '1.0.3') < 0) {
            //code to upgrade to 1.0.3
        }
 
        $setup->endSetup();
    }
}