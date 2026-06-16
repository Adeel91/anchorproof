module anchorproof::anchorproof {
    use std::string::String;
    use sui::address;
    use sui::tx_context::{Self, TxContext};
    use anchorproof::tenant;
    use anchorproof::blob;
    use anchorproof::verification;
    use anchorproof::access;
    use anchorproof::audit;
    use anchorproof::stats;

    // Initialize all registries
    public fun init(ctx: &mut TxContext) {
        tenant::init(ctx);
        blob::init(ctx);
        verification::init(ctx);
        access::init(ctx);
        audit::init(ctx);
        stats::init(ctx);
    }

    // ===== TENANT FUNCTIONS =====

    public fun register_tenant(
        tenant_registry: &mut tenant::TenantRegistry,
        audit_registry: &mut audit::AuditRegistry,
        sui_address: address,
        name: String,
        metadata: String,
        ctx: &mut TxContext
    ) {
        tenant::register_tenant(tenant_registry, sui_address, name, metadata, ctx);
        
        audit::log_audit(
            audit_registry,
            string::utf8(b"REGISTER_TENANT"),
            sui_address,
            string::utf8(b""),
            string::utf8(b"Tenant registered"),
            ctx
        );
    }

    public fun deactivate_tenant(
        tenant_registry: &mut tenant::TenantRegistry,
        audit_registry: &mut audit::AuditRegistry,
        sui_address: address,
        ctx: &mut TxContext
    ) {
        tenant::deactivate_tenant(tenant_registry, sui_address, ctx);
        
        audit::log_audit(
            audit_registry,
            string::utf8(b"DEACTIVATE_TENANT"),
            sui_address,
            string::utf8(b""),
            string::utf8(b"Tenant deactivated"),
            ctx
        );
    }

    public fun get_tenant(
        tenant_registry: &tenant::TenantRegistry,
        sui_address: address
    ): &tenant::Tenant {
        tenant::get_tenant(tenant_registry, sui_address)
    }

    // ===== BLOB FUNCTIONS =====

    public fun store_blob(
        blob_registry: &mut blob::BlobRegistry,
        tenant_registry: &mut tenant::TenantRegistry,
        audit_registry: &mut audit::AuditRegistry,
        tenant: address,
        blob_id: String,
        conversation_id: String,
        customer_id: String,
        agent_id: String,
        message_count: u64,
        content_hash: vector<u8>,
        seal_package_id: address,
        ctx: &mut TxContext
    ) {
        blob::store_blob(
            blob_registry,
            tenant_registry,
            tenant,
            blob_id,
            conversation_id,
            customer_id,
            agent_id,
            message_count,
            content_hash,
            seal_package_id,
            ctx
        );
        
        audit::log_audit(
            audit_registry,
            string::utf8(b"STORE_BLOB"),
            tenant,
            blob_id,
            string::utf8(b"Blob stored"),
            ctx
        );
    }

    public fun verify_blob(
        blob_registry: &mut blob::BlobRegistry,
        tenant_registry: &mut tenant::TenantRegistry,
        verification_registry: &mut verification::VerificationRegistry,
        audit_registry: &mut audit::AuditRegistry,
        blob_id: String,
        hash_match: bool,
        signature_valid: bool,
        proof: vector<u8>,
        ctx: &mut TxContext
    ) {
        blob::verify_blob(blob_registry, tenant_registry, &blob_id, ctx);
        verification::record_verification(
            verification_registry,
            blob_id,
            hash_match,
            signature_valid,
            proof,
            ctx
        );
        
        audit::log_audit(
            audit_registry,
            string::utf8(b"VERIFY_BLOB"),
            tx_context::sender(ctx),
            blob_id,
            string::utf8(b"Blob verified"),
            ctx
        );
    }

    public fun archive_blob(
        blob_registry: &mut blob::BlobRegistry,
        audit_registry: &mut audit::AuditRegistry,
        blob_id: String,
        ctx: &mut TxContext
    ) {
        blob::archive_blob(blob_registry, &blob_id, ctx);
        
        audit::log_audit(
            audit_registry,
            string::utf8(b"ARCHIVE_BLOB"),
            tx_context::sender(ctx),
            blob_id,
            string::utf8(b"Blob archived"),
            ctx
        );
    }

    public fun delete_blob(
        blob_registry: &mut blob::BlobRegistry,
        audit_registry: &mut audit::AuditRegistry,
        blob_id: String,
        ctx: &mut TxContext
    ) {
        blob::delete_blob(blob_registry, &blob_id, ctx);
        
        audit::log_audit(
            audit_registry,
            string::utf8(b"DELETE_BLOB"),
            tx_context::sender(ctx),
            blob_id,
            string::utf8(b"Blob deleted"),
            ctx
        );
    }

    public fun get_blob(
        blob_registry: &blob::BlobRegistry,
        blob_id: &String
    ): &blob::BlobRecord {
        blob::get_blob(blob_registry, blob_id)
    }

    public fun get_tenant_blobs(
        blob_registry: &blob::BlobRegistry,
        tenant: address
    ): vector<&blob::BlobRecord> {
        blob::get_tenant_blobs(blob_registry, tenant)
    }

    public fun get_verified_tenant_blobs(
        blob_registry: &blob::BlobRegistry,
        tenant: address
    ): vector<&blob::BlobRecord> {
        blob::get_verified_tenant_blobs(blob_registry, tenant)
    }

    public fun search_blobs_by_date(
        blob_registry: &blob::BlobRegistry,
        tenant: address,
        from_date: u64,
        to_date: u64
    ): vector<&blob::BlobRecord> {
        blob::search_blobs_by_date(blob_registry, tenant, from_date, to_date)
    }

    // ===== SEAL FUNCTIONS =====

    public fun seal_approve(
        id: vector<u8>,
        viewer: address,
        tenant_registry: &tenant::TenantRegistry,
        blob_registry: &blob::BlobRegistry,
    ) {
        access::seal_approve(id, viewer, tenant_registry, blob_registry);
    }

    // ===== VERIFICATION FUNCTIONS =====

    public fun generate_proof(
        blob_id: String,
        content_hash: vector<u8>,
        timestamp: u64,
        tenant: address
    ): vector<u8> {
        verification::generate_proof(blob_id, content_hash, timestamp, tenant)
    }

    public fun get_blob_verifications(
        verification_registry: &verification::VerificationRegistry,
        blob_id: &String
    ): vector<&verification::Verification> {
        verification::get_blob_verifications(verification_registry, blob_id)
    }

    // ===== ACCESS FUNCTIONS =====

    public fun log_access(
        access_registry: &mut access::AccessRegistry,
        audit_registry: &mut audit::AuditRegistry,
        blob_id: String,
        viewer: address,
        action: String,
        ctx: &mut TxContext
    ) {
        access::log_access(access_registry, blob_id, viewer, action, ctx);
        
        audit::log_audit(
            audit_registry,
            string::utf8(b"LOG_ACCESS"),
            viewer,
            blob_id,
            action,
            ctx
        );
    }

    public fun get_blob_access(
        access_registry: &access::AccessRegistry,
        blob_id: &String
    ): vector<&access::AccessRecord> {
        access::get_blob_access(access_registry, blob_id)
    }

    // ===== STATS FUNCTIONS (Tenant only) =====

    public fun get_tenant_stats(
        tenant_registry: &tenant::TenantRegistry,
        blob_registry: &blob::BlobRegistry,
        verification_registry: &verification::VerificationRegistry,
        tenant_address: address
    ): stats::TenantStats {
        stats::get_tenant_stats(tenant_registry, blob_registry, verification_registry, tenant_address)
    }

    // ===== AUDIT FUNCTIONS (Tenant only) =====

    public fun get_tenant_audit(
        audit_registry: &audit::AuditRegistry,
        tenant: address
    ): vector<&audit::AuditRecord> {
        audit::get_tenant_audit(audit_registry, tenant)
    }

    public fun get_blob_audit(
        audit_registry: &audit::AuditRegistry,
        blob_id: &String
    ): vector<&audit::AuditRecord> {
        audit::get_blob_audit(audit_registry, blob_id)
    }

    public fun get_recent_audit(
        audit_registry: &audit::AuditRegistry,
        limit: u64
    ): vector<&audit::AuditRecord> {
        audit::get_recent_audit(audit_registry, limit)
    }
}