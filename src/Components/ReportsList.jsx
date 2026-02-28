export default function ReportsList({ reports }) {
    return (
        <div className="bg-white shadow rounded-lg p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Reports</h2>
                <button className="text-sm px-3 py-2 rounded bg-gray-900 text-white hover:bg-gray-800">
                    View All
                </button>
            </div>

            <ul className="space-y-3">
                {reports.map((report) => (
                    <li key={report.id} className="flex justify-between p-3 bg-gray-50 rounded hover:bg-gray-100">
                        <div>
                            <p className="font-semibold">#{report.id} {report.title}</p>
                            <p className="text-sm text-gray-500">
                                Priority:{" "}
                                <span className={report.priority === "New" ? "text-red-500" : "text-yellow-600"}>
                                    {report.priority}
                                </span>
                            </p>
                        </div>
                        <div className="text-gray-500">{report.createdAt}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
