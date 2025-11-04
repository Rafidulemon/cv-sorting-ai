import Layout from '../components/Layout';

export default function AccountPage() {
  return (
    <Layout>
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Account Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage billing, API usage, and notification preferences from this page.
        </p>
      </div>
    </Layout>
  );
}
