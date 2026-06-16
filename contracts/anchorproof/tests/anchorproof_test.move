#[test_only]
module anchorproof::anchorproof_test {
    use std::string;
    use sui::test_scenario::{Self, Scenario};
    use sui::tx_context;
    use anchorproof::anchorproof;
    use anchorproof::tenant;
    use anchorproof::blob;
    use anchorproof::verification;
    use anchorproof::access;
    use anchorproof::audit;
    use anchorproof::stats;

    #[test]
    fun test_full_flow() {
        let scenario = &mut test_scenario::begin(@0x1);
        
        // Initialize
        anchorproof::init(test_scenario::ctx(scenario));
        
        // Register tenant
        let tenant_address = @0x2;
        let tenant_registry = test_scenario::take_shared<tenant::TenantRegistry>(scenario);
        let audit_registry = test_scenario::take_shared<audit::AuditRegistry>(scenario);
        
        anchorproof::register_tenant(
            &mut tenant_registry,
            &mut audit_registry,
            tenant_address,
            string::utf8(b"Test Corp"),
            string::utf8(b"Test metadata"),
            test_scenario::ctx(scenario)
        );
        
        test_scenario::return_shared(tenant_registry);
        test_scenario::return_shared(audit_registry);
        
        // Store blob
        let blob_registry = test_scenario::take_shared<blob::BlobRegistry>(scenario);
        let tenant_registry = test_scenario::take_shared<tenant::TenantRegistry>(scenario);
        let audit_registry = test_scenario::take_shared<audit::AuditRegistry>(scenario);
        
        let blob_id = string::utf8(b"test_blob_123");
        anchorproof::store_blob(
            &mut blob_registry,
            &mut tenant_registry,
            &mut audit_registry,
            tenant_address,
            blob_id,
            string::utf8(b"conv_123"),
            string::utf8(b"customer_456"),
            string::utf8(b"agent_789"),
            5,
            x"0123456789abcdef",
            @0x3,
            test_scenario::ctx(scenario)
        );
        
        test_scenario::return_shared(blob_registry);
        test_scenario::return_shared(tenant_registry);
        test_scenario::return_shared(audit_registry);
        
        // Verify blob
        let blob_registry = test_scenario::take_shared<blob::BlobRegistry>(scenario);
        let tenant_registry = test_scenario::take_shared<tenant::TenantRegistry>(scenario);
        let verification_registry = test_scenario::take_shared<verification::VerificationRegistry>(scenario);
        let audit_registry = test_scenario::take_shared<audit::AuditRegistry>(scenario);
        
        anchorproof::verify_blob(
            &mut blob_registry,
            &mut tenant_registry,
            &mut verification_registry,
            &mut audit_registry,
            string::utf8(b"test_blob_123"),
            true,
            true,
            x"0123456789abcdef",
            test_scenario::ctx(scenario)
        );
        
        test_scenario::return_shared(blob_registry);
        test_scenario::return_shared(tenant_registry);
        test_scenario::return_shared(verification_registry);
        test_scenario::return_shared(audit_registry);
        
        // Get stats
        let tenant_registry = test_scenario::take_shared<tenant::TenantRegistry>(scenario);
        let blob_registry = test_scenario::take_shared<blob::BlobRegistry>(scenario);
        let verification_registry = test_scenario::take_shared<verification::VerificationRegistry>(scenario);
        
        let global_stats = anchorproof::get_global_stats(
            &tenant_registry,
            &blob_registry,
            &verification_registry
        );
        
        assert!(global_stats.total_tenants == 1, 0);
        assert!(global_stats.total_blobs == 1, 0);
        assert!(global_stats.total_verifications == 1, 0);
        
        // Get tenant stats
        let tenant_stats = anchorproof::get_tenant_stats(
            &tenant_registry,
            &blob_registry,
            &verification_registry,
            tenant_address
        );
        
        assert!(tenant_stats.blob_count == 1, 0);
        assert!(tenant_stats.verification_count == 1, 0);
        assert!(tenant_stats.active == true, 0);
        
        test_scenario::return_shared(tenant_registry);
        test_scenario::return_shared(blob_registry);
        test_scenario::return_shared(verification_registry);
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_seal_approve() {
        let scenario = &mut test_scenario::begin(@0x1);
        
        anchorproof::init(test_scenario::ctx(scenario));
        
        // Register tenant
        let tenant_address = @0x2;
        let tenant_registry = test_scenario::take_shared<tenant::TenantRegistry>(scenario);
        let audit_registry = test_scenario::take_shared<audit::AuditRegistry>(scenario);
        
        anchorproof::register_tenant(
            &mut tenant_registry,
            &mut audit_registry,
            tenant_address,
            string::utf8(b"Test Corp"),
            string::utf8(b"Test metadata"),
            test_scenario::ctx(scenario)
        );
        
        test_scenario::return_shared(tenant_registry);
        test_scenario::return_shared(audit_registry);
        
        // Store blob
        let blob_registry = test_scenario::take_shared<blob::BlobRegistry>(scenario);
        let tenant_registry = test_scenario::take_shared<tenant::TenantRegistry>(scenario);
        let audit_registry = test_scenario::take_shared<audit::AuditRegistry>(scenario);
        
        anchorproof::store_blob(
            &mut blob_registry,
            &mut tenant_registry,
            &mut audit_registry,
            tenant_address,
            string::utf8(b"test_blob_123"),
            string::utf8(b"conv_123"),
            string::utf8(b"customer_456"),
            string::utf8(b"agent_789"),
            5,
            x"0123456789abcdef",
            @0x3,
            test_scenario::ctx(scenario)
        );
        
        test_scenario::return_shared(blob_registry);
        test_scenario::return_shared(tenant_registry);
        test_scenario::return_shared(audit_registry);
        
        // Test seal_approve
        let tenant_registry = test_scenario::take_shared<tenant::TenantRegistry>(scenario);
        let blob_registry = test_scenario::take_shared<blob::BlobRegistry>(scenario);
        
        let id = string::bytes(&string::utf8(b"test_blob_123"));
        anchorproof::seal_approve(
            id,
            tenant_address,
            &tenant_registry,
            &blob_registry
        );
        
        test_scenario::return_shared(tenant_registry);
        test_scenario::return_shared(blob_registry);
        
        test_scenario::end(scenario);
    }
}