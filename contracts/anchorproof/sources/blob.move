module anchorproof::blob {
    use std::string::String;
    use std::vector;
    use sui::address;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use anchorproof::tenant;

    // Events
    public struct BlobStored has copy, drop {
        tenant: address,
        blob_id: String,
        conversation_id: String,
        customer_id: String,
        agent_id: String,
        message_count: u64,
        timestamp: u64,
    }

    public struct BlobVerified has copy, drop {
        blob_id: String,
        verified_by: address,
        timestamp: u64,
    }

    public struct BlobStatus has copy, drop {
        pending: bool,
        verified: bool,
        archived: bool,
        deleted: bool,
    }

    // Blob record stored on-chain
    public struct BlobRecord has key {
        id: UID,
        tenant: address,
        blob_id: String,
        conversation_id: String,
        customer_id: String,
        agent_id: String,
        message_count: u64,
        created_at: u64,
        verified_at: u64,
        status: BlobStatus,
        content_hash: vector<u8>,
        seal_package_id: address,
        verified_by: address,
    }

    // Blob registry
    public struct BlobRegistry has key {
        id: UID,
        blobs: vector<BlobRecord>,
        total_blobs: u64,
    }

    // Errors
    const ENotAuthorized: u64 = 1;
    const EBlobNotFound: u64 = 2;
    const EInvalidBlob: u64 = 3;
    const EAlreadyVerified: u64 = 4;
    const EBlobArchived: u64 = 5;
    const EBlobDeleted: u64 = 6;

    // Initialize blob registry
    public fun init(ctx: &mut TxContext) {
        let registry = BlobRegistry {
            id: object::new(ctx),
            blobs: vector::empty(),
            total_blobs: 0,
        };
        transfer::share_object(registry);
    }

    // Store a new blob record
    public fun store_blob(
        registry: &mut BlobRegistry,
        tenant_registry: &mut tenant::TenantRegistry,
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
        // Verify tenant is active
        assert!(tenant::is_active_tenant(tenant_registry, tenant), ENotAuthorized);

        let blob_record = BlobRecord {
            id: object::new(ctx),
            tenant,
            blob_id: blob_id,
            conversation_id,
            customer_id,
            agent_id,
            message_count,
            created_at: tx_context::epoch(ctx),
            verified_at: 0,
            status: BlobStatus {
                pending: true,
                verified: false,
                archived: false,
                deleted: false,
            },
            content_hash,
            seal_package_id,
            verified_by: @0x0,
        };

        vector::push_back(&mut registry.blobs, blob_record);
        registry.total_blobs = registry.total_blobs + 1;

        // Update tenant stats
        tenant::increment_blob_count(tenant_registry, tenant);

        // Emit event
        event::emit(BlobStored {
            tenant,
            blob_id: blob_id,
            conversation_id,
            customer_id,
            agent_id,
            message_count,
            timestamp: tx_context::epoch(ctx),
        });
    }

    // Verify a blob (mark as verified)
    public fun verify_blob(
        registry: &mut BlobRegistry,
        tenant_registry: &mut tenant::TenantRegistry,
        blob_id: &String,
        ctx: &mut TxContext
    ) {
        let blob = get_blob_mut(registry, blob_id);
        assert!(blob.status.verified == false, EAlreadyVerified);
        assert!(blob.status.deleted == false, EBlobDeleted);
        assert!(blob.status.archived == false, EBlobArchived);
        
        blob.status.verified = true;
        blob.status.pending = false;
        blob.verified_at = tx_context::epoch(ctx);
        blob.verified_by = tx_context::sender(ctx);

        // Update tenant stats
        tenant::increment_verification_count(tenant_registry, blob.tenant);

        // Emit event
        event::emit(BlobVerified {
            blob_id: blob_id,
            verified_by: tx_context::sender(ctx),
            timestamp: tx_context::epoch(ctx),
        });
    }

    // Archive a blob
    public fun archive_blob(
        registry: &mut BlobRegistry,
        blob_id: &String,
        _ctx: &mut TxContext
    ) {
        let blob = get_blob_mut(registry, blob_id);
        assert!(blob.status.deleted == false, EBlobDeleted);
        blob.status.archived = true;
    }

    // Delete a blob (soft delete)
    public fun delete_blob(
        registry: &mut BlobRegistry,
        blob_id: &String,
        _ctx: &mut TxContext
    ) {
        let blob = get_blob_mut(registry, blob_id);
        blob.status.deleted = true;
    }

    // Get blob by blob_id
    public fun get_blob(registry: &BlobRegistry, blob_id: &String): &BlobRecord {
        let mut i = 0;
        let length = vector::length(&registry.blobs);
        
        while (i < length) {
            let blob = vector::borrow(&registry.blobs, i);
            if (&blob.blob_id == blob_id) {
                return blob
            };
            i = i + 1;
        };
        
        abort EBlobNotFound
    }

    // Get mutable blob
    fun get_blob_mut(registry: &mut BlobRegistry, blob_id: &String): &mut BlobRecord {
        let mut i = 0;
        let length = vector::length(&registry.blobs);
        
        while (i < length) {
            let blob = vector::borrow_mut(&mut registry.blobs, i);
            if (&blob.blob_id == blob_id) {
                return blob
            };
            i = i + 1;
        };
        
        abort EBlobNotFound
    }

    // Get all blobs for a tenant
    public fun get_tenant_blobs(registry: &BlobRegistry, tenant: address): vector<&BlobRecord> {
        let mut result = vector::empty();
        let mut i = 0;
        let length = vector::length(&registry.blobs);
        
        while (i < length) {
            let blob = vector::borrow(&registry.blobs, i);
            if (blob.tenant == tenant && blob.status.deleted == false) {
                vector::push_back(&mut result, blob)
            };
            i = i + 1;
        };
        
        result
    }

    // Get verified blobs for a tenant
    public fun get_verified_tenant_blobs(registry: &BlobRegistry, tenant: address): vector<&BlobRecord> {
        let mut result = vector::empty();
        let mut i = 0;
        let length = vector::length(&registry.blobs);
        
        while (i < length) {
            let blob = vector::borrow(&registry.blobs, i);
            if (blob.tenant == tenant && blob.status.verified == true && blob.status.deleted == false) {
                vector::push_back(&mut result, blob)
            };
            i = i + 1;
        };
        
        result
    }

    // Get blob count
    public fun get_blob_count(registry: &BlobRegistry): u64 {
        registry.total_blobs
    }

    // Check if blob exists
    public fun blob_exists(registry: &BlobRegistry, blob_id: &String): bool {
        let mut i = 0;
        let length = vector::length(&registry.blobs);
        
        while (i < length) {
            let blob = vector::borrow(&registry.blobs, i);
            if (&blob.blob_id == blob_id) {
                return true
            };
            i = i + 1;
        };
        
        false
    }

    // Get blob status
    public fun get_blob_status(registry: &BlobRegistry, blob_id: &String): BlobStatus {
        let blob = get_blob(registry, blob_id);
        blob.status
    }

    // Search blobs by date range
    public fun search_blobs_by_date(
        registry: &BlobRegistry,
        tenant: address,
        from_date: u64,
        to_date: u64
    ): vector<&BlobRecord> {
        let mut result = vector::empty();
        let mut i = 0;
        let length = vector::length(&registry.blobs);
        
        while (i < length) {
            let blob = vector::borrow(&registry.blobs, i);
            if (blob.tenant == tenant && 
                blob.created_at >= from_date && 
                blob.created_at <= to_date &&
                blob.status.deleted == false) {
                vector::push_back(&mut result, blob)
            };
            i = i + 1;
        };
        
        result
    }
}