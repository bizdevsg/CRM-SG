import { useNavigate } from "react-router-dom";
import Button from "../../../components/atoms/Button";
import Card from "../../../components/atoms/Card";

export default function TeamPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Tim Marketing</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Halaman admin hanya menyediakan aksi untuk menambah akun marketing baru.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Tambah Marketing</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Daftar marketing tidak lagi ditampilkan di halaman admin ini. Gunakan tombol di samping
              untuk membuat akun marketing baru pada cabang Anda.
            </p>
          </div>

          <Button className="px-4 py-2" onClick={() => navigate("/dashboard/team/new")}>
            Tambah Marketing
          </Button>
        </div>
      </Card>
    </div>
  );
}
