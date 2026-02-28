export default function StatCard({ title, value, icon }) {
    return (
        <div className="bg-white shadow rounded-lg p-5 flex items-center space-x-4">
            <div className="text-4xl">{icon}</div>
            <div>
                <p className="text-gray-500 font-semibold">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );
}