interface StatsCardsProps {
  tenantId: string;
  emailDomain: string;
  walrusNamespace: string;
}

export function StatsCards({
  tenantId,
  emailDomain,
  walrusNamespace,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      <div className="border border-gray-800/80 bg-gray-900/5 p-5 rounded-xl">
        <span className="text-[10px] font-bold text-gray-600 uppercase block">
          Tenant ID
        </span>
        <span className="text-sm text-indigo-400 font-bold mt-2 block">
          {tenantId.slice(0, 16)}...
        </span>
      </div>
      <div className="border border-gray-800/80 bg-gray-900/5 p-5 rounded-xl">
        <span className="text-[10px] font-bold text-gray-600 uppercase block">
          Email Domain
        </span>
        <span className="text-sm text-gray-300 font-bold mt-2 block">
          {emailDomain}
        </span>
      </div>
      <div className="border border-gray-800/80 bg-gray-900/5 p-5 rounded-xl">
        <span className="text-[10px] font-bold text-gray-600 uppercase block">
          Storage Namespace
        </span>
        <span className="text-sm text-cyan-400 font-bold mt-2 block">
          {walrusNamespace}
        </span>
      </div>
    </div>
  );
}
