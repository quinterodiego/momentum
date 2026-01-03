import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container">
      <div className="card text-center">
        <h1 className="text-3xl font-bold mb-4">404</h1>
        <p className="text-lg opacity-80 mb-4">Página no encontrada</p>
        <Link href="/dashboard" className="btn btn-primary">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

