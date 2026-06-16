module anchorproof::access {
    use std::string::String;
    use sui::address;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use anchorproof::tenant::{Self, TenantRegistry};
    use anchorproof::blob::{Self, BlobRegistry};

    // Events
    public struct AccessLogged has copy, drop {
        blob_id: String,
        viewer: address,
        action: String,
        timestamp: u64,
    }

    // Access record
    public struct AccessRecord has key {
        id: UID,
        blob_id: String,
        viewer: address,
        accessed_at: u64,
        action: String,
    }

    // Access registry
    public struct AccessRegistry has key {
        id: UID,
        records: vector<AccessRecord>,
    }

    // Errors
    const ENotAuthorized: u64 = 1;
    const EAccessDenied: u64 = 2;
    const EBlobNotFound: u64 = 3;

    // Initialize access registry
    public fun init(ctx: &mut TxContext) {
        let registry = AccessRegistry {
            id: object::new(ctx),
            records: vector::empty(),
        };
        transfer::share_object(registry);
    }

    // SEAL approval function - called by SealClient
    public fun seal_approve(
        id: vector<u8>,
        viewer: address,
        tenant_registry: &TenantRegistry,
        blob_registry: &BlobRegistry,
    ) {
        // Check if viewer is an active tenant
        assert!(tenant::is_active_tenant(tenant_registry, viewer), ENotAuthorized);
        
        // Check if the blob exists
        let blob_id = string::utf8(id);
        assert!(blob::blob_exists(blob_registry, &blob_id), EBlobNotFound);
        
        // Additional check: viewer should be the owner of the blob
        let blob = blob::get_blob(blob_registry, &blob_id);
        assert!(blob.tenant == viewer, EAccessDenied);
    }

    // Log access to a blob
    public fun log_access(
        registry: &mut AccessRegistry,
        blob_id: String,
        viewer: address,
        action: String,
        ctx: &mut TxContext
    ) {
        let record = AccessRecord {
            id: object::new(ctx),
            blob_id,
            viewer,
            accessed_at: tx_context::epoch(ctx),
            action: action,
        };
        
        vector::push_back(&mut registry.records, record);

        // Emit event
        event::emit(AccessLogged {
            blob_id: blob_id,
            viewer,
            action,
            timestamp: tx_context::epoch(ctx),
        });
    }

    // Get access records for a blob
    public fun get_blob_access(
        registry: &AccessRegistry,
        blob_id: &String
    ): vector<&AccessRecord> {
        let mut result = vector::empty();
        let mut i = 0;
        let length = vector::length(&registry.records);
        
        while (i < length) {
            let record = vector::borrow(&registry.records, i);
            if (&record.blob_id == blob_id) {
                vector::push_back(&mut result, record)
            };
            i = i + 1;
        };
        
        result
    }

    // Get access records for a viewer
    public fun get_viewer_access(
        registry: &AccessRegistry,
        viewer: address
    ): vector<&AccessRecord> {
        let mut result = vector::empty();
        let mut i = 0;
        let length = vector::length(&registry.records);
        
        while (i < length) {
            let record = vector::borrow(&registry.records, i);
            if (record.viewer == viewer) {
                vector::push_back(&mut result, record)
            };
            i = i + 1;
        };
        
        result
    }
}