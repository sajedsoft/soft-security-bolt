function Profile() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            <p className="mt-1 text-gray-600">Manage your personal information and account settings.</p>
          </div>
          <div className="border-t pt-4">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">John Doe</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">john@example.com</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1 text-sm text-gray-900">Administrator</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;