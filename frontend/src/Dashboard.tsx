import { useNavigate } from "react-router-dom";

export default function Dashboard({
  username,
  onLogout,
}: {
  username: string;
  onLogout: () => void;
}) {
  const navigate = useNavigate();

  const runParserTest = async () => {
    try {
      const res = await fetch("http://localhost:8001/api/gen"); // Adjust port/route as needed
      const data = await res.json();
      alert(`Parser Test Result: ${data.message}`);
    } catch (err) {
      alert("Failed to contact parser service.");
    }
  };

  const runGeneratorTest = async () => {
    try {
      const res = await fetch("http://localhost:8002/api/parse"); // Adjust port/route as needed
      const data = await res.json();
      alert(`Generator Test Result: ${data.message}`);
    } catch (err) {
      alert("Failed to contact generator service.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, {username}</h1>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Test Document Parser</h2>
          <p className="mb-4 text-gray-300">Make sure the parser service is up and responding.</p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            onClick={runParserTest}
          >
            Run Parser Test
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Test Document Generator</h2>
          <p className="mb-4 text-gray-300">Ensure document generation returns a valid file.</p>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            onClick={runGeneratorTest}
          >
            Run Generator Test
          </button>
        </div>
      </div>
    </div>
  );
}
