import Card from "../../../components/atoms/Card";
import { useDashboard } from "../../../context/DashboardContext";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("id-ID");
}

export default function JobApplicationsPage() {
  const applications = useDashboard()?.dashboard?.resources?.jobApplications || [];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Loker</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Pelamar Masuk</h2>
        </div>
        <p className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
          {applications.length} pelamar
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Belum ada pelamar dari form loker.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Nama</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">No WA</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">CV</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Masuk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {applications.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-slate-700">{item.applicantName}</td>
                  <td className="px-4 py-3 text-slate-700">{item.applicantEmail}</td>
                  <td className="px-4 py-3 text-slate-700">{item.whatsappNumber}</td>
                  <td className="px-4 py-3">
                    <a
                      href={item.cvFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-sky-700 underline"
                    >
                      Lihat CV
                    </a>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
