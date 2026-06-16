module anchorproof::stats {
    use std::string::String;
    use std::vector;
    use sui::address;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use anchorproof::tenant::{Self, TenantRegistry};
    use anchorproof::blob::{Self, BlobRegistry};
    use anchorproof::verification::{Self, VerificationRegistry};

    // Tenant stats
    public struct TenantStats has copy, drop {
        tenant_address: address,
        tenant_name: String,
        blob_count: u64,
        verification_count: u64,
        created_at: u64,
        last_activity: u64,
        active: bool,
    }

    // Stats registry
    public struct StatsRegistry has key {
        id: UID,
        last_updated: u64,
    }

    // Initialize stats registry
    public fun init(ctx: &mut TxContext) {
        let registry = StatsRegistry {
            id: object::new(ctx),
            last_updated: tx_context::epoch(ctx),
        };
        transfer::share_object(registry);
    }

    // Get tenant stats
    public fun get_tenant_stats(
        tenant_registry: &TenantRegistry,
        blob_registry: &BlobRegistry,
        verification_registry: &VerificationRegistry,
        tenant_address: address
    ): TenantStats {
        let tenant = tenant::get_tenant(tenant_registry, tenant_address);
        let blobs = blob::get_tenant_blobs(blob_registry, tenant_address);
        let verifications = verification::get_tenant_verifications(verification_registry, tenant_address);
        
        TenantStats {
            tenant_address,
            tenant_name: tenant.name,
            blob_count: vector::length(&blobs) as u64,
            verification_count: vector::length(&verifications) as u64,
            created_at: tenant.created_at,
            last_activity: get_tenant_last_activity(blob_registry, tenant_address),
            active: tenant.active,
        }
    }

    // Get tenant's last activity
    fun get_tenant_last_activity(
        blob_registry: &BlobRegistry,
        tenant: address
    ): u64 {
        let blobs = blob::get_tenant_blobs(blob_registry, tenant);
        let length = vector::length(&blobs);
        
        if (length == 0) {
            return 0
        };
        
        let mut latest = 0;
        let mut i = 0;
        
        while (i < length) {
            let blob = vector::borrow(&blobs, i);
            if (blob.created_at > latest) {
                latest = blob.created_at
            };
            i = i + 1;
        };
        
        latest
    }

    // Update stats registry timestamp
    public fun update_stats_timestamp(registry: &mut StatsRegistry, ctx: &TxContext) {
        registry.last_updated = tx_context::epoch(ctx);
    }

    // Get last updated timestamp
    public fun get_last_updated(registry: &StatsRegistry): u64 {
        registry.last_updated
    }
}