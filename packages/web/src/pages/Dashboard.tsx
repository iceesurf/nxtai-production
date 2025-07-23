export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Leads</h3>
          <p className="text-2xl font-bold text-blue-600">--</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Conversas</h3>
          <p className="text-2xl font-bold text-green-600">--</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Campanhas</h3>
          <p className="text-2xl font-bold text-purple-600">--</p>
        </div>
      </div>
    </div>
  );
}