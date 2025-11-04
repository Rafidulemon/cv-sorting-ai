import Layout from '../components/Layout';

export default function HistoryPage() {
  return (
    <Layout>
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Processing History</h1>
        <p className="mt-2 text-sm text-gray-600">
          Detailed logs and exports will appear here once jobs have completed.
        </p>
      </div>
    </Layout>
  );
}
