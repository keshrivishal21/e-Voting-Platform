import "./App.css";
import Navbar from "./components/Navbar";
import StudentBoard from "./pages/StudentBoard/Home";
import Footer from "./components/Footer";
import AdminBoard from "./pages/AdminBoard/Home";

function App() {
  return (
    <>
      <Navbar isCandidate={true} notificationCount={3} />
      <StudentBoard />
      <Footer />
    </>
  );
}

export default App;
