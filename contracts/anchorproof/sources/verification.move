module anchorproof::verification {
    use std::string::String;
    use std::vector;
    use sui::address;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;

    // Events
    public struct VerificationRecorded has copy, drop {
        blob_id: String,
        verified_by: address,
        hash_match: bool,
        signature_valid: bool,
        timestamp: u64,
    }

    // Verification record
    public struct Verification has copy, drop {
        blob_id: String,
        verified_at: u64,
        verified_by: address,
        hash_match: bool,
        signature_valid: bool,
        proof: vector<u8>,
    }

    // Verification registry
    public struct VerificationRegistry has key {
        id: UID,
        verifications: vector<Verification>,
    }

    // Errors
    const ENotAuthorized: u64 = 1;
    const EVerificationFailed: u64 = 2;

    // Initialize verification registry
    public fun init(ctx: &mut TxContext) {
        let registry = VerificationRegistry {
            id: object::new(ctx),
            verifications: vector::empty(),
        };
        transfer::share_object(registry);
    }

    // Record a verification
    public fun record_verification(
        registry: &mut VerificationRegistry,
        blob_id: String,
        hash_match: bool,
        signature_valid: bool,
        proof: vector<u8>,
        ctx: &mut TxContext
    ) {
        let verification = Verification {
            blob_id,
            verified_at: tx_context::epoch(ctx),
            verified_by: tx_context::sender(ctx),
            hash_match,
            signature_valid,
            proof,
        };
        
        vector::push_back(&mut registry.verifications, verification);

        // Emit event
        event::emit(VerificationRecorded {
            blob_id,
            verified_by: tx_context::sender(ctx),
            hash_match,
            signature_valid,
            timestamp: tx_context::epoch(ctx),
        });
    }

    // Generate proof for a blob
    public fun generate_proof(
        blob_id: String,
        content_hash: vector<u8>,
        timestamp: u64,
        tenant: address
    ): vector<u8> {
        let mut proof = vector::empty();
        
        let blob_id_bytes = string::bytes(&blob_id);
        vector::append(&mut proof, blob_id_bytes);
        
        let timestamp_bytes = sui::bcs::to_bytes(&timestamp);
        vector::append(&mut proof, timestamp_bytes);
        
        let tenant_bytes = sui::bcs::to_bytes(&tenant);
        vector::append(&mut proof, tenant_bytes);
        
        vector::append(&mut proof, content_hash);
        
        proof
    }

    // Get all verifications for a blob
    public fun get_blob_verifications(
        registry: &VerificationRegistry,
        blob_id: &String
    ): vector<&Verification> {
        let mut result = vector::empty();
        let mut i = 0;
        let length = vector::length(&registry.verifications);
        
        while (i < length) {
            let verification = vector::borrow(&registry.verifications, i);
            if (&verification.blob_id == blob_id) {
                vector::push_back(&mut result, verification)
            };
            i = i + 1;
        };
        
        result
    }

    // Get verifications for a tenant (by address)
    public fun get_tenant_verifications(
        registry: &VerificationRegistry,
        tenant: address
    ): vector<&Verification> {
        let mut result = vector::empty();
        let mut i = 0;
        let length = vector::length(&registry.verifications);
        
        while (i < length) {
            let verification = vector::borrow(&registry.verifications, i);
            if (verification.verified_by == tenant) {
                vector::push_back(&mut result, verification)
            };
            i = i + 1;
        };
        
        result
    }

    // Get verification count
    public fun get_verification_count(registry: &VerificationRegistry): u64 {
        vector::length(&registry.verifications) as u64
    }
}