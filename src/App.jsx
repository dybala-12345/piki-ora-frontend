import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctors from './pages/Doctors';
import DoctorDetail from './pages/DoctorDetail';
import MyAppointments from './pages/MyAppointments';
import EditAppointment from './pages/EditAppointment';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';
import AdminLayout from './pages/admin/AdminLayout';
import AdminHome from './pages/admin/AdminHome';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminSlots from './pages/admin/AdminSlots';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminPatients from './pages/admin/AdminPatients';

function App() {
  return (
    <Routes>
      {/* Layout route: navbar + footer around every page, page renders in <Outlet/> */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="doctors/:id" element={<DoctorDetail />} />

        {/* Patient pages - must be logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="my-appointments" element={<MyAppointments />} />
          <Route path="my-appointments/:id/edit" element={<EditAppointment />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Administrator dashboard - must be logged in AND staff */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="slots" element={<AdminSlots />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="patients" element={<AdminPatients />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
