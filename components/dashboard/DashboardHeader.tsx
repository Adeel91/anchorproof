interface DashboardHeaderProps {
  tenant: {
    name: string;
    subscriptionTier: string;
    suiAddress: string;
  };
  user: {
    email: string;
    role: string;
  };
}

const truncateAddress = (address: string) => {
  if (!address) return '0x0000...0000';
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
};

export function DashboardHeader({ tenant, user }: DashboardHeaderProps) {
  return (
    <div className="relative border border-gray-800/80 bg-gray-900/10 backdrop-blur-xl p-8 rounded-2xl mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">
              Active Session // {tenant.subscriptionTier.toUpperCase()} Access
            </span>
          </div>
          <h1 className="text-3xl font-black text-white">{tenant.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="text-gray-400">{user.email}</span>
            <span>•</span>
            <span>
              Role: <span className="text-indigo-400">{user.role}</span>
            </span>
          </div>
        </div>

        <div className="border border-gray-800 bg-black/40 px-5 py-3 rounded-xl">
          <span className="text-[10px] font-bold text-gray-600 uppercase block mb-1">
            Enterprise Wallet
          </span>
          <span className="text-sm text-cyan-400 font-mono">
            {truncateAddress(tenant.suiAddress)}
          </span>
        </div>
      </div>
    </div>
  );
}
