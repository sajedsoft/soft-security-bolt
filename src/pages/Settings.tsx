export default function Settings() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <div className="mt-6 bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
                </div>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm">Enable</button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                  <p className="text-sm text-gray-500">Receive push notifications on your device</p>
                </div>
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm">Disable</button>
              </div>
            </div>
          </div>
          <div className="border-t pt-6">
            <h2 className="text-lg font-medium text-gray-900">Privacy</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Profile Visibility</h3>
                  <p className="text-sm text-gray-500">Control who can see your profile information</p>
                </div>
                <select className="border rounded-md px-3 py-2 text-sm">
                  <option>Public</option>
                  <option>Private</option>
                  <option>Friends Only</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Settings }