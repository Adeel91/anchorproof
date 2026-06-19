#[allow(unused_const)]
module anchorproof::anchorproof {
    use std::string::{Self, String};
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::table::{Self, Table};

    // ============================================================
    //  EVENTS
    // ============================================================

    public struct ConversationVerified has copy, drop {
        blob_id: String,
        conversation_id: String,
        content_hash: vector<u8>,
        verifier: address,
        timestamp: u64,
        sui_tx_hash: vector<u8>,
    }

    public struct HumanReviewLogged has copy, drop {
        blob_id: String,
        reviewer: address,
        decision: u8,
        timestamp: u64,
    }

    public struct SealApproved has copy, drop {
        blob_id: String,
        viewer: address,
        timestamp: u64,
    }

    public struct VerificationRevoked has copy, drop {
        blob_id: String,
        revoked_by: address,
        timestamp: u64,
    }

    // ============================================================
    //  STORAGE
    // ============================================================

    public struct LegalRecord has store {
        blob_id: String,
        conversation_id: String,
        content_hash: vector<u8>,
        sui_tx_hash: vector<u8>,
        created_at: u64,
        created_by: address,
        verified_at: u64,
        verified_by: address,
        verified_signature: vector<u8>,
        hash_match: bool,
        reviewed_at: u64,
        reviewed_by: address,
        review_decision: u8,
        review_notes_hash: vector<u8>,
        active: bool,
        tampered: bool,
        dispute_status: u8,
    }

    public struct LegalRegistry has key {
        id: UID,
        records: Table<String, LegalRecord>,
        total_records: u64,
    }

    // ============================================================
    //  ERRORS
    // ============================================================

    const ENotAuthorized: u64 = 1;
    const ERecordNotFound: u64 = 2;
    const EAlreadyVerified: u64 = 3;
    const EInvalidHash: u64 = 4;
    const ERecordInactive: u64 = 5;

    // Review decisions
    const REVIEW_APPROVED: u8 = 0;
    const REVIEW_REJECTED: u8 = 1;
    const REVIEW_ESCALATED: u8 = 2;

    // Dispute status
    const DISPUTE_NONE: u8 = 0;
    const DISPUTE_PENDING: u8 = 1;
    const DISPUTE_RESOLVED: u8 = 2;

    // ============================================================
    //  INIT
    // ============================================================

    fun init(ctx: &mut TxContext) {
        let registry = LegalRegistry {
            id: object::new(ctx),
            records: table::new(ctx),
            total_records: 0,
        };
        transfer::share_object(registry);
    }

    // ============================================================
    //  LEGAL PROTECTION FUNCTIONS
    // ============================================================

    public entry fun verify_conversation(
        registry: &mut LegalRegistry,
        clock: &Clock,
        blob_id: String,
        conversation_id: String,
        content_hash: vector<u8>,
        sui_tx_hash: vector<u8>,
        signature: vector<u8>,
        ctx: &mut TxContext
    ) {
        let verifier = tx_context::sender(ctx);
        let timestamp = clock::timestamp_ms(clock);

        assert!(!table::contains(&registry.records, blob_id), EAlreadyVerified);
        assert!(!vector::is_empty(&content_hash), EInvalidHash);

        let record = LegalRecord {
            blob_id,
            conversation_id,
            content_hash,
            sui_tx_hash,
            created_at: timestamp,
            created_by: verifier,
            verified_at: timestamp,
            verified_by: verifier,
            verified_signature: signature,
            hash_match: true,
            reviewed_at: 0,
            reviewed_by: @0x0,
            review_decision: 0,
            review_notes_hash: vector[],
            active: true,
            tampered: false,
            dispute_status: DISPUTE_NONE,
        };

        event::emit(ConversationVerified {
            blob_id: record.blob_id,
            conversation_id: record.conversation_id,
            content_hash: record.content_hash,
            verifier: record.verified_by,
            timestamp: record.verified_at,
            sui_tx_hash: record.sui_tx_hash,
        });

        table::add(&mut registry.records, blob_id, record);
        registry.total_records = registry.total_records + 1;
    }

    public entry fun human_review(
        registry: &mut LegalRegistry,
        clock: &Clock,
        blob_id: String,
        decision: u8,
        notes_hash: vector<u8>,
        ctx: &mut TxContext
    ) {
        let reviewer = tx_context::sender(ctx);
        let timestamp = clock::timestamp_ms(clock);
        
        assert!(table::contains(&registry.records, blob_id), ERecordNotFound);
        let record = table::borrow_mut(&mut registry.records, blob_id);

        assert!(record.active, ERecordInactive);

        record.reviewed_at = timestamp;
        record.reviewed_by = reviewer;
        record.review_decision = decision;
        record.review_notes_hash = notes_hash;

        event::emit(HumanReviewLogged {
            blob_id,
            reviewer,
            decision,
            timestamp,
        });
    }

    public entry fun mark_tampered(
        registry: &mut LegalRegistry,
        blob_id: String,
        ctx: &mut TxContext
    ) {
        let caller = tx_context::sender(ctx);
        assert!(table::contains(&registry.records, blob_id), ERecordNotFound);
        
        let record = table::borrow_mut(&mut registry.records, blob_id);
        assert!(record.verified_by == caller, ENotAuthorized);
        
        record.tampered = true;
        record.active = false;
    }

    public entry fun revoke_verification(
        registry: &mut LegalRegistry,
        blob_id: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let caller = tx_context::sender(ctx);
        assert!(table::contains(&registry.records, blob_id), ERecordNotFound);
        
        let record = table::borrow_mut(&mut registry.records, blob_id);
        assert!(record.verified_by == caller, ENotAuthorized);
        
        record.active = false;
        record.dispute_status = DISPUTE_RESOLVED;

        event::emit(VerificationRevoked {
            blob_id,
            revoked_by: caller,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    // ============================================================
    //  SEAL APPROVAL FUNCTION
    // ============================================================

    public fun seal_approve(
        _id: vector<u8>,
        viewer: address,
        _registry: &LegalRegistry,
        clock: &Clock,
    ): bool {
        let is_authorized = true;

        if (is_authorized) {
            event::emit(SealApproved {
                blob_id: string::utf8(b"seal-approved"),
                viewer,
                timestamp: clock::timestamp_ms(clock),
            });
        };

        is_authorized
    }

    // ============================================================
    //  QUERY FUNCTIONS
    // ============================================================

    public fun is_verified(registry: &LegalRegistry, blob_id: String): bool {
        if (!table::contains(&registry.records, blob_id)) {
            return false
        };
        let record = table::borrow(&registry.records, blob_id);
        record.active
    }

    public fun get_record(
        registry: &LegalRegistry,
        blob_id: String
    ): &LegalRecord {
        assert!(table::contains(&registry.records, blob_id), ERecordNotFound);
        table::borrow(&registry.records, blob_id)
    }
}
