module anchorproof::tenant {
    use std::string::String;
    use sui::address;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::vec_map;
    use sui::event;

    // Events
    public struct TenantRegistered has copy, drop {
        tenant_address: address,
        name: String,
        timestamp: u64,
    }

    public struct TenantDeactivated has copy, drop {
        tenant_address: address,
        timestamp: u64,
    }

    // Tenant struct
    public struct Tenant has key {
        id: UID,
        name: String,
        sui_address: address,
        created_at: u64,
        active: bool,
        metadata: String,
        total_blobs: u64,
        total_verifications: u64,
    }

    // Tenant registry
    public struct TenantRegistry has key {
        id: UID,
        tenants: vec_map::VecMap<address, Tenant>,
        tenant_count: u64,
    }

    // Errors
    const ENotAuthorized: u64 = 1;
    const ETenantAlreadyExists: u64 = 2;
    const ETenantNotFound: u64 = 3;
    const EInvalidTenant: u64 = 4;

    // Initialize registry
    public fun init(ctx: &mut TxContext) {
        let registry = TenantRegistry {
            id: object::new(ctx),
            tenants: vec_map::empty(),
            tenant_count: 0,
        };
        transfer::share_object(registry);
    }

    // Register a new tenant
    public fun register_tenant(
        registry: &mut TenantRegistry,
        sui_address: address,
        name: String,
        metadata: String,
        ctx: &mut TxContext
    ) {
        assert!(!vec_map::contains(&registry.tenants, &sui_address), ETenantAlreadyExists);

        let tenant = Tenant {
            id: object::new(ctx),
            name,
            sui_address,
            created_at: tx_context::epoch(ctx),
            active: true,
            metadata,
            total_blobs: 0,
            total_verifications: 0,
        };

        vec_map::insert(&mut registry.tenants, sui_address, tenant);
        registry.tenant_count = registry.tenant_count + 1;

        // Emit event
        event::emit(TenantRegistered {
            tenant_address: sui_address,
            name,
            timestamp: tx_context::epoch(ctx),
        });
    }

    // Deactivate a tenant
    public fun deactivate_tenant(
        registry: &mut TenantRegistry,
        sui_address: address,
        _ctx: &mut TxContext
    ) {
        let tenant = vec_map::get_mut(&mut registry.tenants, &sui_address);
        tenant.active = false;

        event::emit(TenantDeactivated {
            tenant_address: sui_address,
            timestamp: tx_context::epoch(ctx),
        });
    }

    // Increment blob count for tenant
    public fun increment_blob_count(registry: &mut TenantRegistry, sui_address: address) {
        let tenant = vec_map::get_mut(&mut registry.tenants, &sui_address);
        tenant.total_blobs = tenant.total_blobs + 1;
    }

    // Increment verification count for tenant
    public fun increment_verification_count(registry: &mut TenantRegistry, sui_address: address) {
        let tenant = vec_map::get_mut(&mut registry.tenants, &sui_address);
        tenant.total_verifications = tenant.total_verifications + 1;
    }

    // Check if tenant is active
    public fun is_active_tenant(registry: &TenantRegistry, sui_address: address): bool {
        if (!vec_map::contains(&registry.tenants, &sui_address)) {
            return false
        };
        let tenant = vec_map::get(&registry.tenants, &sui_address);
        tenant.active
    }

    // Get tenant by address
    public fun get_tenant(registry: &TenantRegistry, sui_address: address): &Tenant {
        assert!(vec_map::contains(&registry.tenants, &sui_address), ETenantNotFound);
        vec_map::get(&registry.tenants, &sui_address)
    }

    // Get tenant mut
    public fun get_tenant_mut(registry: &mut TenantRegistry, sui_address: address): &mut Tenant {
        assert!(vec_map::contains(&registry.tenants, &sui_address), ETenantNotFound);
        vec_map::get_mut(&mut registry.tenants, &sui_address)
    }

    // Update tenant metadata
    public fun update_tenant_metadata(
        registry: &mut TenantRegistry,
        sui_address: address,
        new_metadata: String,
    ) {
        let tenant = vec_map::get_mut(&mut registry.tenants, &sui_address);
        tenant.metadata = new_metadata;
    }

    // Get all tenants
    public fun get_all_tenants(registry: &TenantRegistry): &vec_map::VecMap<address, Tenant> {
        &registry.tenants
    }

    // Get tenant count
    public fun get_tenant_count(registry: &TenantRegistry): u64 {
        registry.tenant_count
    }
}