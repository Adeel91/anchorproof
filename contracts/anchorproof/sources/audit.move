module anchorproof::audit {
    use std::string::String;
    use std::vector;
    use sui::address;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;

    // Audit event
    public struct AuditEvent has copy, drop {
        action: String,
        actor: address,
        blob_id: String,
        details: String,
        timestamp: u64,
    }

    // Audit record
    public struct AuditRecord has key {
        id: UID,
        action: String,
        actor: address,
        blob_id: String,
        details: String,
        timestamp: u64,
    }

    // Audit registry
    public struct AuditRegistry has key {
        id: UID,
        records: vector<AuditRecord>,
    }

    // Actions
    public const ACTION_STORE: u64 = 0;
    public const ACTION_VERIFY: u64 = 1;
    public const ACTION_VIEW: u64 = 2;
    public const ACTION_DELETE: u64 = 3;
    public const ACTION_ARCHIVE: u64 = 4;
    public const ACTION_RESTORE: u64 = 5;

    // Initialize audit registry
    public fun init(ctx: &mut TxContext) {
        let registry = AuditRegistry {
            id: object::new(ctx),
            records: vector::empty(),
        };
        transfer::share_object(registry);
    }

    // Log an audit event
    public fun log_audit(
        registry: &mut AuditRegistry,
        action: String,
        actor: address,
        blob_id: String,
        details: String,
        ctx: &mut TxContext
    ) {
        let record = AuditRecord {
            id: object::new(ctx),
            action,
            actor,
            blob_id,
            details,
            timestamp: tx_context::epoch(ctx),
        };
        
        vector::push_back(&mut registry.records, record);

        // Emit event
        event::emit(AuditEvent {
            action,
            actor,
            blob_id,
            details,
            timestamp: tx_context::epoch(ctx),
        });
    }

    // Get audit log for a tenant
    public fun get_tenant_audit(
        registry: &AuditRegistry,
        tenant: address
    ): vector<&AuditRecord> {
        let mut result = vector::empty();
        let mut i = 0;
        let length = vector::length(&registry.records);
        
        while (i < length) {
            let record = vector::borrow(&registry.records, i);
            if (record.actor == tenant) {
                vector::push_back(&mut result, record)
            };
            i = i + 1;
        };
        
        result
    }

    // Get audit log for a blob
    public fun get_blob_audit(
        registry: &AuditRegistry,
        blob_id: &String
    ): vector<&AuditRecord> {
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

    // Get recent audit records
    public fun get_recent_audit(
        registry: &AuditRegistry,
        limit: u64
    ): vector<&AuditRecord> {
        let mut result = vector::empty();
        let length = vector::length(&registry.records);
        let mut i = 0;
        
        // Start from the end (most recent)
        let mut index = length;
        while (i < limit && index > 0) {
            index = index - 1;
            let record = vector::borrow(&registry.records, index);
            vector::push_back(&mut result, record);
            i = i + 1;
        };
        
        result
    }

    // Get audit count
    public fun get_audit_count(registry: &AuditRegistry): u64 {
        vector::length(&registry.records) as u64
    }
}